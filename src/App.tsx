import React, {ChangeEventHandler, useState} from 'react';
import './App.css';
import Flashcard from "./components/Flashcard/Flashcard";
import {Button, TextField} from "@mui/material";
import {FlashcardModel} from "./components/Flashcard/FlashcardModel";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import {mockFlashcards} from "./components/Flashcard/util/mockFlashcards";

function App() {
    const [flashcards, setFlashcards] = useState(mockFlashcards());

    const [currentFlashcard, setCurrentFlashcard] = useState(flashcards[0]);

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
        alert(newFlashcards.map((f)=>f.question));

    }

    const flashcardWidth = () => {
        return Math.min(1000, window.innerWidth);
    }


    return (
        <div className="App" style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
        }}>
            <div

                style={{
                    display: "flex",
                    width: flashcardWidth() + "px",
                }}
            >
                <Button variant="text"
                        style={{width: "30px"}}
                >
                    <ArrowBackIosNewIcon/>
                </Button>
                <Flashcard
                    answer={currentFlashcard.answer}
                    question={currentFlashcard.question}
                    isLearned={currentFlashcard.isLearned}
                    toggleIsLearnedFunction={toggleIsLearned}
                    flashcardIndex={0}
                />
                <Button variant="text"
                        style={{width: "30px"}}
                >
                    <ArrowForwardIosIcon/>
                </Button>
            </div>


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
