import {StudyAnswerType, StudyMode} from "@prisma/client";

export interface CreateStudySessionInput {
    mode: StudyMode,
}

export interface CreateStudyAnswerInput {
    flashcardId: string,
    answer: string,
    normalizedAnswer: string,
    correctAnswerSnapshot: string,
    isCorrect: boolean,
    answerType: StudyAnswerType,
    responseTimeMs?: number,
}

const MAX_ANSWER_LENGTH = 4000;

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === "object" && value !== null && !Array.isArray(value);
};

const getRequiredString = (value: unknown, fieldName: string, maxLength = MAX_ANSWER_LENGTH) => {
    if (typeof value !== "string" || !value.trim()) {
        throw new Error(`${fieldName} is required`);
    }

    const trimmedValue = value.trim();

    if (trimmedValue.length > maxLength) {
        throw new Error(`${fieldName} is too long`);
    }

    return trimmedValue;
};

const parseEnum = <T extends Record<string, string>>(value: unknown, enumValue: T, fieldName: string) => {
    if (typeof value !== "string" || !Object.values(enumValue).includes(value)) {
        throw new Error(`Invalid ${fieldName}`);
    }

    return value as T[keyof T];
};

export function normalizeStudyAnswer(value: string) {
    return value
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[?!.,"']/g, "")
        .replace(/\s+/g, " ");
}

export function parseCreateStudySessionInput(value: unknown): CreateStudySessionInput {
    if (!isRecord(value)) {
        throw new Error("Request body must be an object");
    }

    return {
        mode: parseEnum(value.mode, StudyMode, "mode"),
    };
}

export function parseCreateStudyAnswerInput(value: unknown): CreateStudyAnswerInput {
    if (!isRecord(value)) {
        throw new Error("Request body must be an object");
    }

    if (typeof value.isCorrect !== "boolean") {
        throw new Error("isCorrect must be a boolean");
    }

    const responseTimeMs = value.responseTimeMs;

    if (
        responseTimeMs !== undefined
        && (typeof responseTimeMs !== "number" || !Number.isInteger(responseTimeMs) || responseTimeMs < 0)
    ) {
        throw new Error("responseTimeMs must be a non-negative integer");
    }

    const answer = getRequiredString(value.answer, "answer");

    return {
        flashcardId: getRequiredString(value.flashcardId, "flashcardId", 200),
        answer,
        normalizedAnswer: normalizeStudyAnswer(answer),
        correctAnswerSnapshot: getRequiredString(value.correctAnswerSnapshot, "correctAnswerSnapshot"),
        isCorrect: value.isCorrect,
        answerType: parseEnum(value.answerType, StudyAnswerType, "answerType"),
        responseTimeMs,
    };
}
