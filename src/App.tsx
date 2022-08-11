import React, {ChangeEventHandler, useState} from 'react';
import './App.css';
import Flashcard, {IFlashcard} from "./components/Flashcard/Flashcard";
import {Button, TextField} from "@mui/material";

function App() {

    const mockFlashcard = (): IFlashcard[] => {

        let mockFlashcards: IFlashcard[] = [];
        for (let i = 0; i < 2; i++) {
            mockFlashcards.push({
                answer: `answer ${i}`,
                question: `question ${i}`,
                isLearned: i % 2 === 1,
            })
        }

        return mockFlashcards
    }
    const [flashcards, setFlashcards] = useState(mockFlashcard());

    const [questionInputValue, setQuestionInputValue] = useState("")

    const handleChangeQuestion: ChangeEventHandler<HTMLInputElement> = (event) => {
        setQuestionInputValue(event.target.value);
    }

    const [answerInputValue, setAnswerInputValue] = useState("")

    const handleChangeAnswer: ChangeEventHandler<HTMLInputElement> = (event) => {
        setAnswerInputValue(event.target.value);
    }

    const handleAddFlashcard = () => {
        const newFlashcards: IFlashcard[] = [...flashcards];
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
                    (flashcard: IFlashcard, index: number) => (
                        <span key={index}>
                        <Flashcard
                            answer={flashcard.answer}
                            question={flashcard.question}
                            isLearned={flashcard.isLearned}
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
