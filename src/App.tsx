import React, {ChangeEventHandler, useState} from 'react';
import './App.css';
import Flashcard from "./components/Flashcard/Flashcard";
import {Button, TextField} from "@mui/material";
import {FlashcardModel} from "./components/Flashcard/FlashcardModel";

function App() {

    const mockFlashcard = (): FlashcardModel[] => {

        let mockFlashcards: FlashcardModel[] = [];
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
    const [flashcards, setFlashcards] = useState(mockFlashcard());

    const toggleIsLearned = (index: number, checked: boolean) => {
        const newFlashcard: FlashcardModel[] = [...flashcards];
        const toBeChanged = newFlashcard[index];
        toBeChanged.isLearned = checked;
        setFlashcards(newFlashcard);
    };

    const [questionInputValue, setQuestionInputValue] = useState("")

    const handleChangeQuestion: ChangeEventHandler<HTMLInputElement> = (event) => {
        setQuestionInputValue(event.target.value);
    }

    const [answerInputValue, setAnswerInputValue] = useState("")

    const handleChangeAnswer: ChangeEventHandler<HTMLInputElement> = (event) => {
        setAnswerInputValue(event.target.value);
    }

    const handleAddFlashcard = () => {
        const newFlashcards: FlashcardModel[] = [...flashcards];
        newFlashcards.push({answer: answerInputValue, question: questionInputValue, isLearned: true});
        setFlashcards(newFlashcards);
        setAnswerInputValue("");
        setQuestionInputValue("");

    }

    return (
        <div className="App" style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
        }}>

            {
                flashcards.map(
                    (flashcard: FlashcardModel, index: number) => (
                        <span key={index}>
                        <Flashcard
                            answer={flashcard.answer}
                            question={flashcard.question}
                            isLearned={flashcard.isLearned}
                            toggleIsLearnedFunction={toggleIsLearned}
                            flashcardIndex={index}
                        />
                    </span>)
                )
            }
            <div style={{margin: "40px 0 200px 0"}}>
                <TextField label="Question" variant="outlined" onChange={handleChangeQuestion}
                           value={questionInputValue}/>
                <TextField style={{margin: "0 0 0 15px"}} label="Answer" variant="outlined"
                           onChange={handleChangeAnswer} value={answerInputValue}/>
                <Button style={{margin: "0 0 0 15px", height: "56px"}} variant="outlined"
                        onClick={handleAddFlashcard}>Dodaj</Button>
            </div>
        </div>
    );
}

export default App;
