import {createSlug, parseCreateTagInput} from "./tag-validation";

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
});
