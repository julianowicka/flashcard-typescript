import {NextResponse} from "next/server";
import {getCurrentUserId} from "@/lib/current-user";
import {canViewDeck} from "@/lib/deck-access";
import {forbidden, notFound} from "@/lib/api-errors";
import {prisma} from "@/lib/prisma";

interface RouteContext {
    params: Promise<{
        deckId: string,
    }>,
}

export async function GET(_request: Request, context: RouteContext) {
    const currentUserId = await getCurrentUserId();
    const {deckId} = await context.params;

    const deck = await prisma.deck.findFirst({
        where: {
            id: deckId,
            deletedAt: null,
        },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                },
            },
            shares: currentUserId
                ? {
                    where: {
                        userId: currentUserId,
                    },
                    select: {
                        role: true,
                    },
                }
                : false,
            tags: {
                include: {
                    tag: true,
                },
            },
            flashcards: {
                where: {
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
            },
        },
    });

    if (!deck) {
        return notFound();
    }

    const shareRole = deck.shares[0]?.role ?? null;

    if (!canViewDeck({
        ownerId: deck.ownerId,
        currentUserId,
        visibility: deck.visibility,
        shareRole,
    })) {
        return forbidden();
    }

    return NextResponse.json({
        deck,
    });
}
