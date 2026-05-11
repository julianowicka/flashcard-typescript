import {CefrLevel, DeckVisibility} from "@prisma/client";

export interface CreateDeckInput {
    title: string,
    description?: string,
    sourceLanguage: string,
    targetLanguage: string,
    cefrLevel?: CefrLevel,
    visibility: DeckVisibility,
}

const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_LANGUAGE_LENGTH = 40;

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === "object" && value !== null && !Array.isArray(value);
};

const getOptionalString = (value: unknown) => {
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
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

const parseEnum = <T extends Record<string, string>>(value: unknown, enumValue: T, fallback?: T[keyof T]) => {
    if (value === undefined || value === null || value === "") {
        return fallback;
    }

    if (typeof value !== "string" || !Object.values(enumValue).includes(value)) {
        throw new Error("Invalid enum value");
    }

    return value as T[keyof T];
};

export function parseCreateDeckInput(value: unknown): CreateDeckInput {
    if (!isRecord(value)) {
        throw new Error("Request body must be an object");
    }

    const description = getOptionalString(value.description);

    if (description && description.length > MAX_DESCRIPTION_LENGTH) {
        throw new Error("description is too long");
    }

    return {
        title: getRequiredString(value.title, "title", MAX_TITLE_LENGTH),
        description,
        sourceLanguage: getRequiredString(value.sourceLanguage, "sourceLanguage", MAX_LANGUAGE_LENGTH),
        targetLanguage: getRequiredString(value.targetLanguage, "targetLanguage", MAX_LANGUAGE_LENGTH),
        cefrLevel: parseEnum(value.cefrLevel, CefrLevel),
        visibility: parseEnum(value.visibility, DeckVisibility, DeckVisibility.PRIVATE) ?? DeckVisibility.PRIVATE,
    };
}
