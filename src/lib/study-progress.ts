export interface StudyProgressState {
    easeFactor: number,
    interval: number,
    repetitionCount: number,
    correctCount: number,
    wrongCount: number,
}

export interface NextStudyProgress extends StudyProgressState {
    lastReviewedAt: Date,
    nextReviewAt: Date,
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function calculateNextStudyProgress(
    previousProgress: StudyProgressState | null,
    isCorrect: boolean,
    reviewedAt = new Date(),
): NextStudyProgress {
    const baseProgress = previousProgress ?? {
        easeFactor: 2.5,
        interval: 0,
        repetitionCount: 0,
        correctCount: 0,
        wrongCount: 0,
    };

    if (!isCorrect) {
        return {
            ...baseProgress,
            interval: 0,
            repetitionCount: 0,
            wrongCount: baseProgress.wrongCount + 1,
            lastReviewedAt: reviewedAt,
            nextReviewAt: new Date(reviewedAt.getTime() + ONE_DAY_MS),
        };
    }

    const nextRepetitionCount = baseProgress.repetitionCount + 1;
    const nextInterval = baseProgress.interval === 0 ? 1 : Math.max(1, baseProgress.interval * 2);

    return {
        ...baseProgress,
        interval: nextInterval,
        repetitionCount: nextRepetitionCount,
        correctCount: baseProgress.correctCount + 1,
        lastReviewedAt: reviewedAt,
        nextReviewAt: new Date(reviewedAt.getTime() + nextInterval * ONE_DAY_MS),
    };
}
