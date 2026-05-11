import {DeckShareRole, DeckVisibility} from "@prisma/client";
import {canEditDeck, canViewDeck} from "./deck-access";

describe("deck access", () => {
    test("allows everyone to view public decks", () => {
        expect(canViewDeck({
            ownerId: "owner",
            visibility: DeckVisibility.PUBLIC,
        })).toBe(true);
    });

    test("allows owners to view and edit their decks", () => {
        expect(canViewDeck({
            ownerId: "user-1",
            currentUserId: "user-1",
            visibility: DeckVisibility.PRIVATE,
        })).toBe(true);

        expect(canEditDeck({
            ownerId: "user-1",
            currentUserId: "user-1",
        })).toBe(true);
    });

    test("allows editors, but not viewers, to edit shared decks", () => {
        expect(canEditDeck({
            ownerId: "owner",
            currentUserId: "friend",
            shareRole: DeckShareRole.EDITOR,
        })).toBe(true);

        expect(canEditDeck({
            ownerId: "owner",
            currentUserId: "friend",
            shareRole: DeckShareRole.VIEWER,
        })).toBe(false);
    });
});
