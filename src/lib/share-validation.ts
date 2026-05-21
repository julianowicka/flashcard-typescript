import {DeckShareRole} from "@prisma/client";

export interface UpsertDeckShareInput {
    email: string,
    role: DeckShareRole,
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === "object" && value !== null && !Array.isArray(value);
};

export function normalizeEmail(value: string) {
    return value.trim().toLowerCase();
}

export function parseUpsertDeckShareInput(value: unknown): UpsertDeckShareInput {
    if (!isRecord(value)) {
        throw new Error("Request body must be an object");
    }

    if (typeof value.email !== "string" || !value.email.trim()) {
        throw new Error("email is required");
    }

    const email = normalizeEmail(value.email);

    if (!EMAIL_PATTERN.test(email)) {
        throw new Error("email must be valid");
    }

    if (typeof value.role !== "string" || !Object.values(DeckShareRole).includes(value.role as DeckShareRole)) {
        throw new Error("Invalid role");
    }

    return {
        email,
        role: value.role as DeckShareRole,
    };
}
