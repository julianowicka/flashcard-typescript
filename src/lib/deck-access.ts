import {DeckShareRole, DeckVisibility} from "@prisma/client";
import {prisma} from "@/lib/prisma";

export function canViewDeck(params: {
    ownerId: string,
    currentUserId?: string | null,
    visibility: DeckVisibility,
    shareRole?: DeckShareRole | null,
}) {
    if (params.visibility === DeckVisibility.PUBLIC) {
        return true;
    }

    if (!params.currentUserId) {
        return false;
    }

    return params.ownerId === params.currentUserId || Boolean(params.shareRole);
}

export function canEditDeck(params: {
    ownerId: string,
    currentUserId?: string | null,
    shareRole?: DeckShareRole | null,
}) {
    if (!params.currentUserId) {
        return false;
    }

    return params.ownerId === params.currentUserId || params.shareRole === DeckShareRole.EDITOR;
}

export async function getDeckAccess(deckId: string, currentUserId?: string | null) {
    const deck = await prisma.deck.findFirst({
        where: {
            id: deckId,
            deletedAt: null,
        },
        select: {
            id: true,
            ownerId: true,
            visibility: true,
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
        },
    });

    if (!deck) {
        return null;
    }

    const shareRole = deck.shares[0]?.role ?? null;

    return {
        deck,
        shareRole,
        canView: canViewDeck({
            ownerId: deck.ownerId,
            currentUserId,
            visibility: deck.visibility,
            shareRole,
        }),
        canEdit: canEditDeck({
            ownerId: deck.ownerId,
            currentUserId,
            shareRole,
        }),
    };
}
