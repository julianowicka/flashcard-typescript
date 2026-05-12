export interface CreateTagInput {
    name: string,
    slug: string,
}

const MAX_TAG_NAME_LENGTH = 50;

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === "object" && value !== null && !Array.isArray(value);
};

export function createSlug(value: string) {
    return value
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function parseCreateTagInput(value: unknown): CreateTagInput {
    if (!isRecord(value)) {
        throw new Error("Request body must be an object");
    }

    if (typeof value.name !== "string" || !value.name.trim()) {
        throw new Error("name is required");
    }

    const name = value.name.trim();

    if (name.length > MAX_TAG_NAME_LENGTH) {
        throw new Error("name is too long");
    }

    const slug = createSlug(name);

    if (!slug) {
        throw new Error("name must contain letters or numbers");
    }

    return {
        name,
        slug,
    };
}
