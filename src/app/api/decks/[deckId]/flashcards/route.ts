import {NextRequest, NextResponse} from "next/server";
import {badRequest, forbidden, notFound, unauthorized} from "@/lib/api-errors";
import {getCurrentUserId} from "@/lib/current-user";
import {getDeckAccess} from "@/lib/deck-access";
import {parseCreateFlashcardInput} from "@/lib/flashcard-validation";
import {prisma} from "@/lib/prisma";

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

    const flashcards = await prisma.flashcard.findMany({
        where: {
            deckId,
            deletedAt: null,
        },
        orderBy: {
            position: "asc",
        },
        include: {
            tags: {
                include: {
                    tag: true,
                },
            },
        },
    });

    return NextResponse.json({flashcards});
}

export async function POST(request: NextRequest, context: RouteContext) {
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
        input = parseCreateFlashcardInput(await request.json());
    } catch (error) {
        return badRequest(error instanceof Error ? error.message : "Invalid request body");
    }

    const nextPosition = input.position ?? await prisma.flashcard.count({
        where: {
            deckId,
            deletedAt: null,
        },
    });

    const flashcard = await prisma.flashcard.create({
        data: {
            deckId,
            front: input.front,
            back: input.back,
            hint: input.hint,
            explanation: input.explanation,
            imageUrl: input.imageUrl,
            audioUrl: input.audioUrl,
            cefrLevel: input.cefrLevel,
            position: nextPosition,
        },
        include: {
            tags: {
                include: {
                    tag: true,
                },
            },
        },
    });

    return NextResponse.json({flashcard}, {status: 201});
}
