import {CefrLevel} from "@prisma/client";

export interface CreateFlashcardInput {
    front: string,
    back: string,
    hint?: string,
    explanation?: string,
    imageUrl?: string,
    audioUrl?: string,
    cefrLevel?: CefrLevel,
    position?: number,
}

const MAX_SIDE_LENGTH = 2000;
const MAX_HELPER_TEXT_LENGTH = 4000;
const MAX_URL_LENGTH = 2048;

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === "object" && value !== null && !Array.isArray(value);
};

const getRequiredString = (value: unknown, fieldName: string, maxLength: number) => {
    if (typeof value !== "string" || !value.trim()) {
        throw new Error(`${fieldName} is required`);
    }

    const trimmedValue = value.trim();

    if (trimmedValue.length > maxLength) {
        throw new Error(`${fieldName} is too long`);
    }

    return trimmedValue;
};

const getOptionalString = (value: unknown, fieldName: string, maxLength: number) => {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }

    if (typeof value !== "string") {
        throw new Error(`${fieldName} must be a string`);
    }

    const trimmedValue = value.trim();

    if (!trimmedValue) {
        return undefined;
    }

    if (trimmedValue.length > maxLength) {
        throw new Error(`${fieldName} is too long`);
    }

    return trimmedValue;
};

const getOptionalUrl = (value: unknown, fieldName: string) => {
    const url = getOptionalString(value, fieldName, MAX_URL_LENGTH);

    if (!url) {
        return undefined;
    }

    try {
        const parsedUrl = new URL(url);

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
            throw new Error();
        }

        return url;
    } catch {
        throw new Error(`${fieldName} must be a valid http or https URL`);
    }
};

const parseCefrLevel = (value: unknown) => {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }

    if (typeof value !== "string" || !Object.values(CefrLevel).includes(value as CefrLevel)) {
        throw new Error("Invalid cefrLevel");
    }

    return value as CefrLevel;
};

const parsePosition = (value: unknown) => {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }

    if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
        throw new Error("position must be a non-negative integer");
    }

    return value;
};

export function parseCreateFlashcardInput(value: unknown): CreateFlashcardInput {
    if (!isRecord(value)) {
        throw new Error("Request body must be an object");
    }

    return {
        front: getRequiredString(value.front, "front", MAX_SIDE_LENGTH),
        back: getRequiredString(value.back, "back", MAX_SIDE_LENGTH),
        hint: getOptionalString(value.hint, "hint", MAX_HELPER_TEXT_LENGTH),
        explanation: getOptionalString(value.explanation, "explanation", MAX_HELPER_TEXT_LENGTH),
        imageUrl: getOptionalUrl(value.imageUrl, "imageUrl"),
        audioUrl: getOptionalUrl(value.audioUrl, "audioUrl"),
        cefrLevel: parseCefrLevel(value.cefrLevel),
        position: parsePosition(value.position),
    };
}
