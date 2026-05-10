export interface FlashcardModel {
    question: string,
    answer: string,
    isLearned: boolean,
    sourceText?: string,
    targetText?: string,
    sourceLanguage?: string,
    targetLanguage?: string,
    example?: string,
    tags?: string[],
    level?: string,
}

export interface DeckModel {
    id: string,
    name: string,
    description: string,
    sourceLanguage: string,
    targetLanguage: string,
    level: string,
    flashcards: FlashcardModel[],
}
