import {CefrLevel} from "@prisma/client";
import {parseCreateFlashcardInput} from "./flashcard-validation";

describe("flashcard validation", () => {
    test("parses a valid flashcard input", () => {
        expect(parseCreateFlashcardInput({
            front: "dziekuje",
            back: "gracias",
            hint: "polite phrase",
            explanation: "Used to thank someone.",
            imageUrl: "https://example.com/image.png",
            audioUrl: "https://example.com/audio.mp3",
            cefrLevel: CefrLevel.A1,
            position: 2,
        })).toEqual({
            front: "dziekuje",
            back: "gracias",
            hint: "polite phrase",
            explanation: "Used to thank someone.",
            imageUrl: "https://example.com/image.png",
            audioUrl: "https://example.com/audio.mp3",
            cefrLevel: CefrLevel.A1,
            position: 2,
        });
    });

    test("rejects missing front", () => {
        expect(() => parseCreateFlashcardInput({
            back: "gracias",
        })).toThrow("front is required");
    });

    test("rejects invalid media URLs", () => {
        expect(() => parseCreateFlashcardInput({
            front: "dziekuje",
            back: "gracias",
            audioUrl: "ftp://example.com/audio.mp3",
        })).toThrow("audioUrl must be a valid http or https URL");
    });

    test("rejects negative positions", () => {
        expect(() => parseCreateFlashcardInput({
            front: "dziekuje",
            back: "gracias",
            position: -1,
        })).toThrow("position must be a non-negative integer");
    });
});
