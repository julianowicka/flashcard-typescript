import {NextRequest, NextResponse} from "next/server";
import {badRequest, forbidden, notFound, unauthorized} from "@/lib/api-errors";
import {getCurrentUserId} from "@/lib/current-user";
import {getDeckAccess} from "@/lib/deck-access";
import {prisma} from "@/lib/prisma";
import {parseTagIdsInput} from "@/lib/tag-validation";

interface RouteContext {
    params: Promise<{
        deckId: string,
        flashcardId: string,
    }>,
}

async function getExistingFlashcard(deckId: string, flashcardId: string) {
    return prisma.flashcard.findFirst({
        where: {
            id: flashcardId,
            deckId,
            deletedAt: null,
        },
        select: {
            id: true,
        },
    });
}

export async function GET(_request: NextRequest, context: RouteContext) {
    const currentUserId = await getCurrentUserId();
    const {deckId, flashcardId} = await context.params;
    const access = await getDeckAccess(deckId, currentUserId);

    if (!access || !await getExistingFlashcard(deckId, flashcardId)) {
        return notFound();
    }

    if (!access.canView) {
        return forbidden();
    }

    const tags = await prisma.flashcardTag.findMany({
        where: {
            flashcardId,
        },
        include: {
            tag: true,
        },
        orderBy: {
            tag: {
                name: "asc",
            },
        },
    });

    return NextResponse.json({
        tags: tags.map((flashcardTag) => flashcardTag.tag),
    });
}

export async function PUT(request: NextRequest, context: RouteContext) {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
        return unauthorized();
    }

    const {deckId, flashcardId} = await context.params;
    const access = await getDeckAccess(deckId, currentUserId);

    if (!access || !await getExistingFlashcard(deckId, flashcardId)) {
        return notFound();
    }

    if (!access.canEdit) {
        return forbidden();
    }

    let input;

    try {
        input = parseTagIdsInput(await request.json());
    } catch (error) {
        return badRequest(error instanceof Error ? error.message : "Invalid request body");
    }

    const existingTagsCount = await prisma.tag.count({
        where: {
            id: {
                in: input.tagIds,
            },
        },
    });

    if (existingTagsCount !== input.tagIds.length) {
        return badRequest("One or more tags do not exist");
    }

    await prisma.$transaction([
        prisma.flashcardTag.deleteMany({
            where: {
                flashcardId,
            },
        }),
        prisma.flashcardTag.createMany({
            data: input.tagIds.map((tagId) => ({
                flashcardId,
                tagId,
            })),
            skipDuplicates: true,
        }),
    ]);

    const tags = await prisma.flashcardTag.findMany({
        where: {
            flashcardId,
        },
        include: {
            tag: true,
        },
        orderBy: {
            tag: {
                name: "asc",
            },
        },
    });

    return NextResponse.json({
        tags: tags.map((flashcardTag) => flashcardTag.tag),
    });
}
