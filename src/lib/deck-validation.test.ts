import {CefrLevel, DeckVisibility} from "@prisma/client";
import {parseCreateDeckInput} from "./deck-validation";

describe("deck validation", () => {
    test("parses a valid deck input", () => {
        expect(parseCreateDeckInput({
            title: "Spanish A1",
            description: "Basics",
            sourceLanguage: "pl",
            targetLanguage: "es",
            cefrLevel: CefrLevel.A1,
            visibility: DeckVisibility.PRIVATE,
        })).toEqual({
            title: "Spanish A1",
            description: "Basics",
            sourceLanguage: "pl",
            targetLanguage: "es",
            cefrLevel: CefrLevel.A1,
            visibility: DeckVisibility.PRIVATE,
        });
    });

    test("defaults visibility to private", () => {
        expect(parseCreateDeckInput({
            title: "English B2",
            sourceLanguage: "pl",
            targetLanguage: "en",
        }).visibility).toBe(DeckVisibility.PRIVATE);
    });

    test("rejects missing title", () => {
        expect(() => parseCreateDeckInput({
            sourceLanguage: "pl",
            targetLanguage: "en",
        })).toThrow("title is required");
    });
});
