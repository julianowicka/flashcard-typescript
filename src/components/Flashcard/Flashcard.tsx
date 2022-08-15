import React, {MouseEventHandler, useState} from "react";
import {Checkbox, FormControlLabel, Typography} from "@mui/material";

interface FlashcardProps {
    question: string,
    answer: string,
    isLearned: boolean,
    toggleIsLearnedFunction: (i: number, checked: boolean) => void,
    flashcardIndex: number,
}

export const Flashcard = (props: FlashcardProps) => {
    const {question, answer, isLearned, toggleIsLearnedFunction, flashcardIndex} = props;

    const [isReversed, setIsReversed] = useState(false);

    const handleFlipCard = () => {
        setIsReversed(!isReversed);
    };

    const flashcardWidth = () => {
        return Math.min(1000, window.innerWidth - 40);
    }

    const handleToggleIsLearned = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean): void => {
        toggleIsLearnedFunction(flashcardIndex, checked);


    };

    const handleStopFlippingTheCard: MouseEventHandler = (event) => {
        event.stopPropagation();

    };

    return <div onClick={handleFlipCard} style={{
        border: "1px solid",
        borderRadius: "32px",
        margin: "40px 0px 0px 0px",
        padding: "15px",
        width: flashcardWidth() + "px",
        height: "500px",
        boxShadow: "8px 8px 28px 2px rgba(66, 68, 90, 1)",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        maxWidth: "90%",
        alignItems: "center",

    }}>
        {isReversed ? (
            <>
                <Typography style={{margin: "0 0 15px 0"}} variant="h5" component="div">{question}</Typography>
                <Typography variant="h6" component="div">
                    {answer}
                </Typography>
               <FormControlLabel style={{padding: "10px"}} onClick={handleStopFlippingTheCard}
                                       control={
                                           <Checkbox checked={isLearned} onChange={handleToggleIsLearned}
                                                     onClick={handleStopFlippingTheCard}/>
                                       }
                                       label="Flashcard learned"
                />
            </>
        ) : (
            <>
                <Typography variant="h5" component="div">{question}</Typography>
                <Typography variant="h6" component="div">{isLearned ? "I know this" : "False"}</Typography>
            </>
        )}
    </div>
}

export default Flashcard