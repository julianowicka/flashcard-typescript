import {NextRequest, NextResponse} from "next/server";
import {badRequest, forbidden, notFound, unauthorized} from "@/lib/api-errors";
import {getCurrentUserId} from "@/lib/current-user";
import {getDeckAccess} from "@/lib/deck-access";
import {prisma} from "@/lib/prisma";

interface RouteContext {
    params: Promise<{
        deckId: string,
        userId: string,
    }>,
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
        return unauthorized();
    }

    const {deckId, userId} = await context.params;
    const access = await getDeckAccess(deckId, currentUserId);

    if (!access) {
        return notFound();
    }

    if (access.deck.ownerId !== currentUserId) {
        return forbidden();
    }

    if (userId === access.deck.ownerId) {
        return badRequest("Deck owner share cannot be removed");
    }

    await prisma.deckShare.deleteMany({
        where: {
            deckId,
            userId,
        },
    });

    return NextResponse.json({deleted: true});
}
