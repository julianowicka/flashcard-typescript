import {NextRequest, NextResponse} from "next/server";
import {badRequest, forbidden, notFound, unauthorized} from "@/lib/api-errors";
import {getCurrentUserId} from "@/lib/current-user";
import {getDeckAccess} from "@/lib/deck-access";
import {prisma} from "@/lib/prisma";
import {parseUpsertDeckShareInput} from "@/lib/share-validation";

interface RouteContext {
    params: Promise<{
        deckId: string,
    }>,
}

const shareInclude = {
    user: {
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
        },
    },
};

export async function GET(_request: NextRequest, context: RouteContext) {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
        return unauthorized();
    }

    const {deckId} = await context.params;
    const access = await getDeckAccess(deckId, currentUserId);

    if (!access) {
        return notFound();
    }

    if (access.deck.ownerId !== currentUserId) {
        return forbidden();
    }

    const shares = await prisma.deckShare.findMany({
        where: {
            deckId,
        },
        include: shareInclude,
        orderBy: {
            createdAt: "asc",
        },
    });

    return NextResponse.json({shares});
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

    if (access.deck.ownerId !== currentUserId) {
        return forbidden();
    }

    let input;

    try {
        input = parseUpsertDeckShareInput(await request.json());
    } catch (error) {
        return badRequest(error instanceof Error ? error.message : "Invalid request body");
    }

    const targetUser = await prisma.user.findUnique({
        where: {
            email: input.email,
        },
        select: {
            id: true,
        },
    });

    if (!targetUser) {
        return notFound();
    }

    if (targetUser.id === access.deck.ownerId) {
        return badRequest("Deck owner does not need a share entry");
    }

    const share = await prisma.deckShare.upsert({
        where: {
            deckId_userId: {
                deckId,
                userId: targetUser.id,
            },
        },
        create: {
            deckId,
            userId: targetUser.id,
            role: input.role,
        },
        update: {
            role: input.role,
        },
        include: shareInclude,
    });

    return NextResponse.json({share}, {status: 200});
}
