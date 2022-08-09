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

    const [inputValue, setInputValue] = useState("")

    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
        setInputValue(event.target.value)
    }
    const handleAddFlashcard = () => {
        const newFlashcards: IFlashcard[] = [...flashcards];
        newFlashcards.push({answer: "new answer", question: inputValue, isLearned: true});
        console.log("newFlashcards");
        console.log(newFlashcards);
        setFlashcards(newFlashcards);
    }

    return (
        <div className="App">

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
            <input onChange={handleChange} value={inputValue}/>
            <button onClick={handleAddFlashcard}>Dodaj</button>
        </div>
    );
}

export default App;
