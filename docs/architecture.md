# Flashcard App Architecture

This document describes the target backend and database architecture for the flashcard application. The goal is to build toward a modern Quizlet-like product with users, private and shared decks, learning progress, study history, statistics, and safe deployment on a VPS.

## Goals

- Support many users using the app concurrently.
- Store authentication data using an Auth.js / NextAuth-compatible model.
- Store decks, flashcards, tags, sharing permissions, learning progress, sessions, and answers in PostgreSQL.
- Keep learning progress separate from flashcard content.
- Support private, shared, and public decks.
- Support viewer/editor sharing roles, with ownership stored directly on the deck.
- Keep the schema friendly to Prisma migrations, PostgreSQL backups, and stable VPS deployment.
- Avoid physical deletion for core product data where history matters; prefer `deletedAt` soft delete.

## Architecture Layers

1. **Identity and auth**
   - `User`
   - `Account`
   - `Session`
   - `VerificationToken`

2. **Content**
   - `Deck`
   - `Flashcard`
   - `Tag`
   - `DeckTag`
   - `FlashcardTag`
   - later: `ExampleSentence`, `AudioAsset`, `ImportJob`

3. **Sharing and permissions**
   - `Deck.ownerId`
   - `Deck.visibility`
   - `DeckShare`

4. **Learning and analytics**
   - `StudyProgress`
   - `StudySession`
   - `StudyAnswer`

## Core Decisions

### Progress Is Per User

Learning progress must not be stored on `Deck` or `Flashcard`.

A flashcard is shared content. Many users can study the same flashcard, and each user needs an independent learning state. Therefore progress belongs in:

```text
StudyProgress(userId, flashcardId)
```

This pair must be unique.

### Deck Ownership

`Deck.ownerId` is the source of truth for ownership.

`DeckShare` should store shared users only, with roles:

```text
VIEWER
EDITOR
```

The effective `OWNER` role is derived from:

```text
Deck.ownerId === currentUser.id
```

This avoids conflicting states such as `Deck.ownerId = userA` while `DeckShare.role = OWNER` for `userB`.

### Tags As Tables

Tags should be relational tables, not `String[]`.

This supports:

- filtering
- searching
- unique slugs
- deck-level tags
- flashcard-level tags
- future shared/global tag management

### Soft Delete

Core content should use `deletedAt`:

- `Deck.deletedAt`
- `Flashcard.deletedAt`

This protects study history and makes backups/restores safer. Most queries should filter `deletedAt = null`.

## Target Models

### User

Auth.js-compatible user model plus app relations.

Required:

- `id`
- `createdAt`
- `updatedAt`

Optional:

- `name`
- `email`
- `emailVerified`
- `image`

Relations:

- `accounts`
- `sessions`
- `decks`
- `deckShares`
- `progress`
- `studySessions`
- `studyAnswers`

### Account

Auth.js OAuth account table.

Required:

- `userId`
- `type`
- `provider`
- `providerAccountId`

Optional provider fields:

- `refresh_token`
- `access_token`
- `expires_at`
- `token_type`
- `scope`
- `id_token`
- `session_state`

Primary key:

```text
provider + providerAccountId
```

### Session

Auth.js database session table.

Required:

- `sessionToken`
- `userId`
- `expires`

### VerificationToken

Auth.js-compatible verification token table.

Required:

- `identifier`
- `token`
- `expires`

Primary key:

```text
identifier + token
```

### Deck

Represents a study deck.

Required:

- `id`
- `ownerId`
- `title`
- `sourceLanguage`
- `targetLanguage`
- `visibility`
- `createdAt`
- `updatedAt`

Optional:

- `description`
- `cefrLevel`
- `deletedAt`

Relations:

- owner: `User`
- `flashcards`
- `shares`
- `tags`
- `studySessions`

Notes:

- `sourceLanguage` and `targetLanguage` should be strings or ISO-like codes, not enums. Language lists grow and vary.
- `visibility = SHARED` means access is controlled by `DeckShare`.

### DeckShare

Represents a deck shared with another user.

Required:

- `id`
- `deckId`
- `userId`
- `role`
- `createdAt`

Constraints:

```text
unique(deckId, userId)
```

Roles:

- `VIEWER`
- `EDITOR`

Owner is not represented here.

### Flashcard

Represents one card inside a deck.

Required:

- `id`
- `deckId`
- `front`
- `back`
- `position`
- `createdAt`
- `updatedAt`

Optional:

- `hint`
- `explanation`
- `imageUrl`
- `audioUrl`
- `cefrLevel`
- `deletedAt`

Relations:

- `deck`
- `progress`
- `studyAnswers`
- `tags`
- later: `exampleSentences`, `audioAssets`

Notes:

- `audioUrl` is acceptable for MVP.
- Later, audio can move into `AudioAsset`.
- `position` allows manual ordering inside a deck.

### StudyProgress

Current learning state for a user and flashcard.

Required:

- `id`
- `userId`
- `flashcardId`
- `easeFactor`
- `interval`
- `repetitionCount`
- `correctCount`
- `wrongCount`
- `createdAt`
- `updatedAt`

Optional:

- `lastReviewedAt`
- `nextReviewAt`

Constraints:

```text
unique(userId, flashcardId)
```

Notes:

- This model supports spaced repetition.
- `nextReviewAt` is the key field for review queues.

### StudySession

Represents one learning session.

Required:

- `id`
- `userId`
- `deckId`
- `mode`
- `startedAt`

Optional:

- `finishedAt`

Relations:

- `user`
- `deck`
- `answers`

Notes:

- This is needed for statistics, history, and test summaries.

### StudyAnswer

Represents one answer inside a study session.

Required:

- `id`
- `sessionId`
- `userId`
- `flashcardId`
- `answer`
- `correctAnswerSnapshot`
- `isCorrect`
- `answerType`
- `createdAt`

Optional:

- `normalizedAnswer`
- `responseTimeMs`

Notes:

- `correctAnswerSnapshot` preserves history even if the flashcard is edited later.
- `userId` is denormalized from session for faster analytics queries.

### Tag

Reusable tag.

Required:

- `id`
- `name`
- `slug`
- `createdAt`

Optional:

- `createdById`

Constraints:

```text
unique(slug)
```

### DeckTag

Join table between `Deck` and `Tag`.

Required:

- `deckId`
- `tagId`

Constraints:

```text
unique(deckId, tagId)
```

### FlashcardTag

Join table between `Flashcard` and `Tag`.

Required:

- `flashcardId`
- `tagId`

Constraints:

```text
unique(flashcardId, tagId)
```

## Future Models

### ExampleSentence

Useful for language learning.

Fields:

- `id`
- `flashcardId`
- `sentence`
- `translation`
- `audioUrl`
- `createdAt`
- `updatedAt`
- `deletedAt`

### AudioAsset

Use later if audio becomes richer than a single URL.

Fields:

- `id`
- `ownerId`
- `flashcardId`
- `exampleSentenceId`
- `url`
- `mimeType`
- `durationMs`
- `source`
- `createdAt`

### ImportJob

Use later for CSV/AI/import workflows.

Fields:

- `id`
- `userId`
- `status`
- `source`
- `fileName`
- `errorMessage`
- `createdAt`
- `finishedAt`

## Enums

```prisma
enum DeckVisibility {
  PRIVATE
  SHARED
  PUBLIC
}

enum DeckShareRole {
  VIEWER
  EDITOR
}

enum StudyMode {
  FLASHCARDS
  WRITE
  LEARN
  TEST
  MATCH
  REVIEW
}

enum StudyAnswerType {
  WRITTEN
  MULTIPLE_CHOICE
  TRUE_FALSE
  MANUAL
}

enum CefrLevel {
  A1
  A2
  B1
  B2
  C1
  C2
}
```

## Recommended Indexes

### Deck

```text
index(ownerId, deletedAt)
index(visibility, deletedAt)
index(sourceLanguage, targetLanguage)
index(cefrLevel)
index(updatedAt)
```

Common queries:

- my decks
- public decks
- decks by language pair
- decks by CEFR level

### DeckShare

```text
unique(deckId, userId)
index(userId, role)
index(deckId)
```

Common queries:

- decks shared with me
- users who can access a deck

### Flashcard

```text
index(deckId, deletedAt)
index(deckId, position)
index(cefrLevel)
```

Common queries:

- flashcards in a deck
- ordered flashcards in a deck
- active flashcards only

### StudyProgress

```text
unique(userId, flashcardId)
index(userId, nextReviewAt)
index(userId, lastReviewedAt)
index(flashcardId)
```

Common queries:

- progress for user's flashcards
- review queue
- flashcard-level progress

### StudySession

```text
index(userId, startedAt)
index(userId, deckId, startedAt)
index(deckId, startedAt)
```

Common queries:

- recent sessions
- deck-specific user history
- deck activity

### StudyAnswer

```text
index(userId, createdAt)
index(sessionId)
index(flashcardId)
index(userId, flashcardId, createdAt)
```

Common queries:

- session details
- recent answers
- answer history for one flashcard
- user statistics

### Tag Joins

```text
Tag: unique(slug)
DeckTag: unique(deckId, tagId), index(tagId)
FlashcardTag: unique(flashcardId, tagId), index(tagId)
```

Common queries:

- filter decks by tag
- filter flashcards by tag

## PostgreSQL Notes

Prisma indexes are enough for MVP. Later, add PostgreSQL partial indexes manually in migrations for soft-delete-heavy queries:

```sql
CREATE INDEX deck_owner_active_idx
ON "Deck" ("ownerId")
WHERE "deletedAt" IS NULL;

CREATE INDEX flashcard_deck_active_idx
ON "Flashcard" ("deckId", "position")
WHERE "deletedAt" IS NULL;
```

## MVP Schema To Implement Now

Implement now:

- `User`
- `Account`
- `Session`
- `VerificationToken`
- `Deck`
- `Flashcard`
- `DeckShare`
- `StudyProgress`
- `StudySession`
- `StudyAnswer`
- `Tag`
- `DeckTag`
- `FlashcardTag`

Keep in `Flashcard` for MVP:

- `hint`
- `explanation`
- `imageUrl`
- `audioUrl`

Implement later:

- `ExampleSentence`
- `AudioAsset`
- `ImportJob`
- `Notification`
- `Organization`
- `Subscription`

## Risks If Designed Poorly

- Storing progress in `Flashcard` breaks multi-user learning.
- Storing tags as strings makes filtering and sharing harder.
- Missing `StudySession` prevents useful statistics.
- Missing `StudyAnswer` prevents answer history and test review.
- Missing `correctAnswerSnapshot` makes historical answers confusing after edits.
- Duplicate ownership in `DeckShare` and `Deck.ownerId` can create permission conflicts.
- Hard delete can destroy learning history.
- Missing `nextReviewAt` index makes spaced repetition slow.
- Enum languages would make future language support painful.
- Missing `position` makes card ordering awkward.
- Missing `deletedAt` filters can leak archived content into active views.

## Query Patterns

### My Decks

Filter:

```text
Deck.ownerId = currentUser.id
Deck.deletedAt = null
```

### Shared With Me

Join:

```text
DeckShare.userId = currentUser.id
Deck.deletedAt = null
```

### Public Decks

Filter:

```text
Deck.visibility = PUBLIC
Deck.deletedAt = null
```

### Flashcards In Deck

Filter:

```text
Flashcard.deckId = deckId
Flashcard.deletedAt = null
order by position
```

### Progress For Deck

Query flashcards by deck, then progress by:

```text
StudyProgress.userId = currentUser.id
StudyProgress.flashcardId in deck flashcard ids
```

### Review Queue

Filter:

```text
StudyProgress.userId = currentUser.id
StudyProgress.nextReviewAt <= now()
```

### Recent Statistics

Use:

```text
StudySession.userId = currentUser.id
StudySession.startedAt >= date
StudyAnswer.userId = currentUser.id
StudyAnswer.createdAt >= date
```
