import {DeckVisibility, Prisma} from "@prisma/client";
import {NextRequest, NextResponse} from "next/server";
import {getCurrentUserId} from "@/lib/current-user";
import {prisma} from "@/lib/prisma";
import {badRequest, unauthorized} from "@/lib/api-errors";
import {parseCreateDeckInput} from "@/lib/deck-validation";

const deckListSelect = {
    id: true,
    title: true,
    description: true,
    sourceLanguage: true,
    targetLanguage: true,
    cefrLevel: true,
    visibility: true,
    ownerId: true,
    createdAt: true,
    updatedAt: true,
    _count: {
        select: {
            flashcards: true,
        },
    },
} satisfies Prisma.DeckSelect;

export async function GET(request: NextRequest) {
    const currentUserId = await getCurrentUserId();
    const scope = request.nextUrl.searchParams.get("scope") ?? "accessible";

    if ((scope === "mine" || scope === "shared") && !currentUserId) {
        return unauthorized();
    }

    const where: Prisma.DeckWhereInput = {
        deletedAt: null,
    };

    if (scope === "mine") {
        where.ownerId = currentUserId ?? "";
    } else if (scope === "shared") {
        where.shares = {
            some: {
                userId: currentUserId ?? "",
            },
        };
    } else if (scope === "public") {
        where.visibility = DeckVisibility.PUBLIC;
    } else if (scope === "accessible") {
        where.OR = [
            {visibility: DeckVisibility.PUBLIC},
            ...(currentUserId
                ? [
                    {ownerId: currentUserId},
                    {
                        shares: {
                            some: {
                                userId: currentUserId,
                            },
                        },
                    },
                ]
                : []),
        ];
    } else {
        return badRequest("Invalid deck scope");
    }

    const decks = await prisma.deck.findMany({
        where,
        select: deckListSelect,
        orderBy: {
            updatedAt: "desc",
        },
    });

    return NextResponse.json({decks});
}

export async function POST(request: NextRequest) {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
        return unauthorized();
    }

    let input;

    try {
        input = parseCreateDeckInput(await request.json());
    } catch (error) {
        return badRequest(error instanceof Error ? error.message : "Invalid request body");
    }

    const deck = await prisma.deck.create({
        data: {
            ownerId: currentUserId,
            title: input.title,
            description: input.description,
            sourceLanguage: input.sourceLanguage,
            targetLanguage: input.targetLanguage,
            cefrLevel: input.cefrLevel,
            visibility: input.visibility,
        },
        select: deckListSelect,
    });

    return NextResponse.json({deck}, {status: 201});
}
