export interface CreateTagInput {
    name: string,
    slug: string,
}

export interface TagIdsInput {
    tagIds: string[],
}

const MAX_TAG_NAME_LENGTH = 50;
const MAX_TAGS_PER_RESOURCE = 20;

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

export function parseTagIdsInput(value: unknown): TagIdsInput {
    if (!isRecord(value)) {
        throw new Error("Request body must be an object");
    }

    if (!Array.isArray(value.tagIds)) {
        throw new Error("tagIds must be an array");
    }

    if (value.tagIds.length > MAX_TAGS_PER_RESOURCE) {
        throw new Error("too many tags");
    }

    const tagIds = value.tagIds.map((tagId) => {
        if (typeof tagId !== "string" || !tagId.trim()) {
            throw new Error("tagIds must contain non-empty strings");
        }

        return tagId.trim();
    });

    return {
        tagIds: Array.from(new Set(tagIds)),
    };
}
