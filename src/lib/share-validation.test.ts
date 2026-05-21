import {DeckShareRole} from "@prisma/client";
import {normalizeEmail, parseUpsertDeckShareInput} from "./share-validation";

describe("share validation", () => {
    test("normalizes email addresses", () => {
        expect(normalizeEmail(" Friend@Example.COM ")).toBe("friend@example.com");
    });

    test("parses valid share input", () => {
        expect(parseUpsertDeckShareInput({
            email: "friend@example.com",
            role: DeckShareRole.EDITOR,
        })).toEqual({
            email: "friend@example.com",
            role: DeckShareRole.EDITOR,
        });
    });

    test("rejects invalid email", () => {
        expect(() => parseUpsertDeckShareInput({
            email: "not-an-email",
            role: DeckShareRole.VIEWER,
        })).toThrow("email must be valid");
    });

    test("rejects invalid role", () => {
        expect(() => parseUpsertDeckShareInput({
            email: "friend@example.com",
            role: "OWNER",
        })).toThrow("Invalid role");
    });
});
