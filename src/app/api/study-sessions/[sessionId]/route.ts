import {NextRequest, NextResponse} from "next/server";
import {forbidden, notFound, unauthorized} from "@/lib/api-errors";
import {getCurrentUserId} from "@/lib/current-user";
import {prisma} from "@/lib/prisma";

interface RouteContext {
    params: Promise<{
        sessionId: string,
    }>,
}

export async function PATCH(_request: NextRequest, context: RouteContext) {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
        return unauthorized();
    }

    const {sessionId} = await context.params;
    const session = await prisma.studySession.findUnique({
        where: {
            id: sessionId,
        },
        select: {
            id: true,
            userId: true,
            finishedAt: true,
        },
    });

    if (!session) {
        return notFound();
    }

    if (session.userId !== currentUserId) {
        return forbidden();
    }

    const updatedSession = await prisma.studySession.update({
        where: {
            id: sessionId,
        },
        data: {
            finishedAt: session.finishedAt ?? new Date(),
        },
    });

    return NextResponse.json({session: updatedSession});
}
