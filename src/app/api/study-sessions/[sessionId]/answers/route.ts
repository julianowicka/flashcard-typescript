import {NextRequest, NextResponse} from "next/server";
import {badRequest, forbidden, notFound, unauthorized} from "@/lib/api-errors";
import {getCurrentUserId} from "@/lib/current-user";
import {prisma} from "@/lib/prisma";
import {calculateNextStudyProgress} from "@/lib/study-progress";
import {parseCreateStudyAnswerInput} from "@/lib/study-validation";

interface RouteContext {
    params: Promise<{
        sessionId: string,
    }>,
}

export async function POST(request: NextRequest, context: RouteContext) {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
        return unauthorized();
    }

    const {sessionId} = await context.params;

    let input;

    try {
        input = parseCreateStudyAnswerInput(await request.json());
    } catch (error) {
        return badRequest(error instanceof Error ? error.message : "Invalid request body");
    }

    const session = await prisma.studySession.findUnique({
        where: {
            id: sessionId,
        },
        select: {
            id: true,
            userId: true,
            deckId: true,
            finishedAt: true,
        },
    });

    if (!session) {
        return notFound();
    }

    if (session.userId !== currentUserId) {
        return forbidden();
    }

    if (session.finishedAt) {
        return badRequest("Study session is already finished");
    }

    const flashcard = await prisma.flashcard.findFirst({
        where: {
            id: input.flashcardId,
            deckId: session.deckId,
            deletedAt: null,
        },
        select: {
            id: true,
        },
    });

    if (!flashcard) {
        return badRequest("Flashcard does not belong to this study session deck");
    }

    const now = new Date();
    const result = await prisma.$transaction(async (tx) => {
        const previousProgress = await tx.studyProgress.findUnique({
            where: {
                userId_flashcardId: {
                    userId: currentUserId,
                    flashcardId: input.flashcardId,
                },
            },
            select: {
                easeFactor: true,
                interval: true,
                repetitionCount: true,
                correctCount: true,
                wrongCount: true,
            },
        });
        const nextProgress = calculateNextStudyProgress(previousProgress, input.isCorrect, now);

        const answer = await tx.studyAnswer.create({
            data: {
                sessionId,
                userId: currentUserId,
                flashcardId: input.flashcardId,
                answer: input.answer,
                normalizedAnswer: input.normalizedAnswer,
                correctAnswerSnapshot: input.correctAnswerSnapshot,
                isCorrect: input.isCorrect,
                answerType: input.answerType,
                responseTimeMs: input.responseTimeMs,
            },
        });

        const progress = await tx.studyProgress.upsert({
            where: {
                userId_flashcardId: {
                    userId: currentUserId,
                    flashcardId: input.flashcardId,
                },
            },
            create: {
                userId: currentUserId,
                flashcardId: input.flashcardId,
                ...nextProgress,
            },
            update: nextProgress,
        });

        return {
            answer,
            progress,
        };
    });

    return NextResponse.json(result, {status: 201});
}
