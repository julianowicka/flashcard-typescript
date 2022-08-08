import React from 'react';
import './App.css';
import Flashcard, {IFlashcard} from "./components/Flashcard/Flashcard";

function App() {

    const mockFlashcard = ():IFlashcard[] =>{

        let mockFlashcards:IFlashcard[] = [];
        for (let i=0; i<10; i++) {
            mockFlashcards.push({
                answer: `answer ${i}`,
                question: `question ${i}`,
                isLearned: i%2 === 1,
            })
        }

        return mockFlashcards
    }

  return (
    <div className="App">

        {
            mockFlashcard().map((flashcard: IFlashcard, index: number) => <span key={index}><Flashcard answer={flashcard.answer} question={flashcard.question} isLearned={flashcard.isLearned} /></span>)
        }

    </div>
  );
}

export default App;
