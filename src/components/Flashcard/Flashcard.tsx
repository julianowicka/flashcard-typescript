import React, {useState} from "react";
import {Typography} from "@mui/material";

export interface IFlashcard {
    question: string,
    answer: string,
    isLearned: boolean,
}

export const Flashcard = ({question, answer, isLearned}: IFlashcard) => {

    const [isReversed, setIsReversed] = useState(false);

    const handleFlipCard = () => {
        setIsReversed(!isReversed);
    };

    const flashcardWidth = () => {
        return Math.min(500, window.innerWidth -40);
    }

    return <div onClick={handleFlipCard} style={{
        border: "1px solid",
        borderRadius: "32px",
        margin: "40px 0px 0px 0px",
        width: flashcardWidth()+"px",
        height: "250px",
        boxShadow: "8px 8px 28px 2px rgba(66, 68, 90, 1)",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        maxWidth: "90%",

    }}>
        {isReversed ? (
            <Typography variant="h6" component="div">
                {answer}
            </Typography>
        ) : (
            <>
                <Typography variant="h6" component="div">{question}</Typography>
                <Typography variant="h6" component="div">{isLearned ? "I know this" : "False"}</Typography>
            </>
        )}
    </div>
}

export default Flashcard