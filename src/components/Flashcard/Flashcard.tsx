import React, {MouseEventHandler, useState} from "react";
import {Checkbox, FormControlLabel, Typography, Card, CardContent} from "@mui/material";

interface FlashcardProps {
    question: string,
    answer: string,
    isLearned: boolean,
    toggleIsLearnedFunction: (i: number, checked: boolean) => void,
    flashcardIndex: number,
}

export const Flashcard = (props: FlashcardProps) => {
    const {question, answer, isLearned, toggleIsLearnedFunction, flashcardIndex} = props;

    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlipCard = () => {
        setIsFlipped(!isFlipped);
    };


    const handleToggleIsLearned = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean): void => {
        toggleIsLearnedFunction(flashcardIndex, checked);


    };

    const handleStopFlippingTheCard: MouseEventHandler = (event) => {
        event.stopPropagation();

    };

    return (
        <Card 
            onClick={handleFlipCard}
            sx={{
                minHeight: 300,
                width: '100%',
                cursor: 'pointer',
                border: '1px solid #ddd',
                backgroundColor: isFlipped ? '#f5f5f5' : '#fff'
            }}
        >
            <CardContent sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                p: 3
            }}>


                {isFlipped ? (
                    <>
                        <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
                            Question:
                        </Typography>
                        <Typography variant="h5" sx={{ mb: 3 }}>
                            {question}
                        </Typography>
                        <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
                            Answer:
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 3, p: 2, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
                            {answer}
                        </Typography>
                        <FormControlLabel 
                            onClick={handleStopFlippingTheCard}
                            control={
                                <Checkbox 
                                    checked={isLearned} 
                                    onChange={handleToggleIsLearned}
                                    onClick={handleStopFlippingTheCard}
                                />
                            }
                            label="Mark as learned"
                        />
                    </>
                ) : (
                    <>
                        <Typography variant="h5" sx={{ mb: 3 }}>
                            {question}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                            Click to reveal the answer
                        </Typography>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export default Flashcard