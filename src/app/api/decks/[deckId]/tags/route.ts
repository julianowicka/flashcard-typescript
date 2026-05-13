import {NextRequest, NextResponse} from "next/server";
import {badRequest, forbidden, notFound, unauthorized} from "@/lib/api-errors";
import {getCurrentUserId} from "@/lib/current-user";
import {getDeckAccess} from "@/lib/deck-access";
import {prisma} from "@/lib/prisma";
import {parseTagIdsInput} from "@/lib/tag-validation";

interface RouteContext {
    params: Promise<{
        deckId: string,
    }>,
}

export async function GET(_request: NextRequest, context: RouteContext) {
    const currentUserId = await getCurrentUserId();
    const {deckId} = await context.params;
    const access = await getDeckAccess(deckId, currentUserId);

    if (!access) {
        return notFound();
    }

    if (!access.canView) {
        return forbidden();
    }

    const tags = await prisma.deckTag.findMany({
        where: {
            deckId,
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
        tags: tags.map((deckTag) => deckTag.tag),
    });
}

export async function PUT(request: NextRequest, context: RouteContext) {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
        return unauthorized();
    }

    const {deckId} = await context.params;
    const access = await getDeckAccess(deckId, currentUserId);

    if (!access) {
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
        prisma.deckTag.deleteMany({
            where: {
                deckId,
            },
        }),
        prisma.deckTag.createMany({
            data: input.tagIds.map((tagId) => ({
                deckId,
                tagId,
            })),
            skipDuplicates: true,
        }),
    ]);

    const tags = await prisma.deckTag.findMany({
        where: {
            deckId,
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
        tags: tags.map((deckTag) => deckTag.tag),
    });
}
