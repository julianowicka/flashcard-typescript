import React, {ChangeEventHandler, useState} from 'react';
import './App.css';
import Flashcard, {IFlashcard} from "./components/Flashcard/Flashcard";

function App() {

    const mockFlashcard = (): IFlashcard[] => {

        let mockFlashcards: IFlashcard[] = [];
        for (let i = 0; i < 10; i++) {
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

    const handleChangeAnswer: ChangeEventHandler<HTMLInputElement> = (event) =>{
        setAnswerInputValue(event.target.value);
    }

    const handleAddFlashcard = () => {
        const newFlashcards: IFlashcard[] = [...flashcards];
        newFlashcards.push({answer: answerInputValue, question: questionInputValue, isLearned: true});
        console.log("newFlashcards");
        console.log(newFlashcards);
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
            <input onChange={handleChangeQuestion} value={questionInputValue}/>
            <input onChange={handleChangeAnswer} value={answerInputValue}/>
            <button onClick={handleAddFlashcard}>Dodaj</button>
        </div>
    );
}

export default App;
