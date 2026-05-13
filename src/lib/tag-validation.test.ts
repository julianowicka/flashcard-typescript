import {createSlug, parseCreateTagInput, parseTagIdsInput} from "./tag-validation";

describe("tag validation", () => {
    test("creates normalized slugs", () => {
        expect(createSlug("  Hiszpanski A1-A2!  ")).toBe("hiszpanski-a1-a2");
    });

    test("parses valid tag input", () => {
        expect(parseCreateTagInput({
            name: "Business English",
        })).toEqual({
            name: "Business English",
            slug: "business-english",
        });
    });

    test("rejects missing tag name", () => {
        expect(() => parseCreateTagInput({})).toThrow("name is required");
    });

    test("rejects names without letters or numbers", () => {
        expect(() => parseCreateTagInput({
            name: "!!!",
        })).toThrow("name must contain letters or numbers");
    });

    test("parses unique tag ids", () => {
        expect(parseTagIdsInput({
            tagIds: ["tag-1", "tag-1", " tag-2 "],
        })).toEqual({
            tagIds: ["tag-1", "tag-2"],
        });
    });

    test("rejects invalid tag id lists", () => {
        expect(() => parseTagIdsInput({
            tagIds: ["tag-1", ""],
        })).toThrow("tagIds must contain non-empty strings");
    });
});
