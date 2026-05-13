import {NextRequest, NextResponse} from "next/server";
import {badRequest, forbidden, notFound, unauthorized} from "@/lib/api-errors";
import {getCurrentUserId} from "@/lib/current-user";
import {getDeckAccess} from "@/lib/deck-access";
import {prisma} from "@/lib/prisma";
import {parseCreateStudySessionInput} from "@/lib/study-validation";

interface RouteContext {
    params: Promise<{
        deckId: string,
    }>,
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

    if (!access.canView) {
        return forbidden();
    }

    let input;

    try {
        input = parseCreateStudySessionInput(await request.json());
    } catch (error) {
        return badRequest(error instanceof Error ? error.message : "Invalid request body");
    }

    const session = await prisma.studySession.create({
        data: {
            userId: currentUserId,
            deckId,
            mode: input.mode,
        },
    });

    return NextResponse.json({session}, {status: 201});
}
