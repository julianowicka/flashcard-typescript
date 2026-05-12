import {Prisma} from "@prisma/client";
import {NextRequest, NextResponse} from "next/server";
import {badRequest, unauthorized} from "@/lib/api-errors";
import {getCurrentUserId} from "@/lib/current-user";
import {prisma} from "@/lib/prisma";
import {parseCreateTagInput} from "@/lib/tag-validation";

const tagSelect = {
    id: true,
    name: true,
    slug: true,
    createdAt: true,
    _count: {
        select: {
            decks: true,
            flashcards: true,
        },
    },
} satisfies Prisma.TagSelect;

export async function GET(request: NextRequest) {
    const query = request.nextUrl.searchParams.get("q")?.trim();

    const tags = await prisma.tag.findMany({
        where: query
            ? {
                OR: [
                    {
                        name: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                    {
                        slug: {
                            contains: query.toLowerCase(),
                            mode: "insensitive",
                        },
                    },
                ],
            }
            : undefined,
        select: tagSelect,
        orderBy: {
            name: "asc",
        },
        take: 50,
    });

    return NextResponse.json({tags});
}

export async function POST(request: NextRequest) {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
        return unauthorized();
    }

    let input;

    try {
        input = parseCreateTagInput(await request.json());
    } catch (error) {
        return badRequest(error instanceof Error ? error.message : "Invalid request body");
    }

    const existingTag = await prisma.tag.findUnique({
        where: {
            slug: input.slug,
        },
        select: tagSelect,
    });

    if (existingTag) {
        return NextResponse.json({tag: existingTag});
    }

    const tag = await prisma.tag.create({
        data: {
            name: input.name,
            slug: input.slug,
            createdById: currentUserId,
        },
        select: tagSelect,
    });

    return NextResponse.json({tag}, {status: 201});
}
