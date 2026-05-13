import {StudyAnswerType, StudyMode} from "@prisma/client";
import {
    normalizeStudyAnswer,
    parseCreateStudyAnswerInput,
    parseCreateStudySessionInput,
} from "./study-validation";

describe("study validation", () => {
    test("normalizes answers", () => {
        expect(normalizeStudyAnswer("  Canción?!  ")).toBe("cancion");
    });

    test("parses study session input", () => {
        expect(parseCreateStudySessionInput({
            mode: StudyMode.LEARN,
        })).toEqual({
            mode: StudyMode.LEARN,
        });
    });

    test("parses study answer input", () => {
        expect(parseCreateStudyAnswerInput({
            flashcardId: "card-1",
            answer: " Gracias ",
            correctAnswerSnapshot: "gracias",
            isCorrect: true,
            answerType: StudyAnswerType.WRITTEN,
            responseTimeMs: 1200,
        })).toEqual({
            flashcardId: "card-1",
            answer: "Gracias",
            normalizedAnswer: "gracias",
            correctAnswerSnapshot: "gracias",
            isCorrect: true,
            answerType: StudyAnswerType.WRITTEN,
            responseTimeMs: 1200,
        });
    });

    test("rejects invalid study answer input", () => {
        expect(() => parseCreateStudyAnswerInput({
            flashcardId: "card-1",
            answer: "gracias",
            correctAnswerSnapshot: "gracias",
            isCorrect: "yes",
            answerType: StudyAnswerType.WRITTEN,
        })).toThrow("isCorrect must be a boolean");
    });
});
