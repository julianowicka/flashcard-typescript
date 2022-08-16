import {FlashcardModel} from "../FlashcardModel";

export const mockFlashcards = (): FlashcardModel[] => {

    const mockFlashcards: FlashcardModel[] = [];
    mockFlashcards.push({
        question: "Czym są async/await?",
        answer: "Obydwa słowa kluczowe wiążą się z obietnicami. Pierwsze z nich - async - wstawione przed deklaracją funkcji sprawi, że taka funkcja zwróci obietnicę. Drugie z nich - await - może wystąpić tylko wewnątrz funkcji poprzedzonej przez async i powinno się znaleźć przed wykonaniem funkcji asynchronicznej. Sprawi, że wykonanie nie przejdzie dalej, dopóki obietnica nie zostanie wykonana. Dzięki temu asynchroniczny kod przypomina swoim zachowaniem kod synchroniczny.\n",
        isLearned: false,
    });
    mockFlashcards.push({
        question: "Czym jest obietnica (promise)?",
        answer: "Obietnice to obiekty, które reprezentują wykonanie (sukcesem lub porażką) operacji asynchronicznej. Są tak nazwane, bo wykonywana funkcja asynchroniczna musi złożyć obietnicę dostarczenia w przyszłości wartości. Po zakończeniu operacji asynchronicznej jej wynik może zostać obsłużony przez wywołanie na obietnicy metody then.",
        isLearned: false,
    });

    return mockFlashcards
}
