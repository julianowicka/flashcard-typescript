import React from "react";

export interface IFlashcard {
    question: string,
    answer: string,
    isLearned: boolean,
}

export const Flashcard = ({question, answer, isLearned}: IFlashcard) => {

    console.log(answer, question, isLearned);

    return <div>

        <p>{answer}</p>
        <p>{question}</p>
        <p>{isLearned ? "I know this" : "False"}</p>

    </div>
}

export default Flashcard