import {DeckShareRole, DeckVisibility} from "@prisma/client";

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
