import {calculateNextStudyProgress} from "./study-progress";

describe("study progress", () => {
    const reviewedAt = new Date("2026-05-13T10:00:00.000Z");

    test("creates first correct progress", () => {
        expect(calculateNextStudyProgress(null, true, reviewedAt)).toEqual({
            easeFactor: 2.5,
            interval: 1,
            repetitionCount: 1,
            correctCount: 1,
            wrongCount: 0,
            lastReviewedAt: reviewedAt,
            nextReviewAt: new Date("2026-05-14T10:00:00.000Z"),
        });
    });

    test("extends interval after correct answers", () => {
        expect(calculateNextStudyProgress({
            easeFactor: 2.5,
            interval: 3,
            repetitionCount: 2,
            correctCount: 2,
            wrongCount: 1,
        }, true, reviewedAt)).toMatchObject({
            interval: 6,
            repetitionCount: 3,
            correctCount: 3,
            wrongCount: 1,
        });
    });

    test("resets repetition after wrong answers", () => {
        expect(calculateNextStudyProgress({
            easeFactor: 2.5,
            interval: 3,
            repetitionCount: 2,
            correctCount: 2,
            wrongCount: 1,
        }, false, reviewedAt)).toMatchObject({
            interval: 0,
            repetitionCount: 0,
            correctCount: 2,
            wrongCount: 2,
            nextReviewAt: new Date("2026-05-14T10:00:00.000Z"),
        });
    });
});
