import React, {ChangeEventHandler, useState, useEffect} from 'react';
import './App.css';
import Flashcard from "./components/Flashcard/Flashcard";
import {Button, TextField, Typography, Box, Container, Paper, Chip, LinearProgress} from "@mui/material";
import {FlashcardModel} from "./components/Flashcard/FlashcardModel";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import AddIcon from '@mui/icons-material/Add';
import {mockFlashcards} from "./components/Flashcard/util/mockFlashcards";

function App() {
    const [flashcards, setFlashcards] = useState(mockFlashcards());
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentFlashcard, setCurrentFlashcard] = useState(flashcards[0]);

    // Update current flashcard when index or flashcards change
    useEffect(() => {
        if (flashcards.length > 0) {
            setCurrentFlashcard(flashcards[currentIndex]);
        }
    }, [currentIndex, flashcards]);

    const toggleIsLearned = (index: number, checked: boolean) => {
        const newFlashcards: FlashcardModel[] = [...flashcards];
        const toBeChanged = newFlashcards[currentIndex];
        toBeChanged.isLearned = checked;
        setFlashcards(newFlashcards);
    };

    const goToNext = () => {
        if (currentIndex < flashcards.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const goToPrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
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
        if (questionInputValue.trim() && answerInputValue.trim()) {
            const newFlashcards: FlashcardModel[] = [...flashcards];
            newFlashcards.push({
                answer: answerInputValue.trim(), 
                question: questionInputValue.trim(), 
                isLearned: false
            });
            setFlashcards(newFlashcards);
            setAnswerInputValue("");
            setQuestionInputValue("");
        }
    };

    const getProgress = () => {
        const learnedCount = flashcards.filter(card => card.isLearned).length;
        return (learnedCount / flashcards.length) * 100;
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'ArrowRight') {
            goToNext();
        } else if (event.key === 'ArrowLeft') {
            goToPrevious();
        }
    };


    return (
        <Container maxWidth="lg" sx={{ py: 4 }} onKeyDown={handleKeyPress} tabIndex={0}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom>
                    Flashcard Learning App
                </Typography>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    Learn with flashcards
                </Typography>
                
                {/* Progress Section */}
                <Box sx={{ mt: 3, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Progress: {flashcards.filter(card => card.isLearned).length} / {flashcards.length} cards learned
                        </Typography>
                        <Chip 
                            label={`${Math.round(getProgress())}% Complete`} 
                            color={getProgress() === 100 ? 'success' : 'primary'}
                            size="small"
                        />
                    </Box>
                    <LinearProgress 
                        variant="determinate" 
                        value={getProgress()}
                    />
                </Box>
            </Box>

            {/* Flashcard Navigation Section */}
            <Paper sx={{ p: 3, mb: 4, border: '1px solid #ddd' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <Button 
                        variant="outlined" 
                        onClick={goToPrevious}
                        disabled={currentIndex === 0}
                    >
                        <ArrowBackIosNewIcon/>
                    </Button>
                    
                    <Box sx={{ flex: 1, maxWidth: 600 }}>
                        <Flashcard
                            answer={currentFlashcard.answer}
                            question={currentFlashcard.question}
                            isLearned={currentFlashcard.isLearned}
                            toggleIsLearnedFunction={toggleIsLearned}
                            flashcardIndex={currentIndex}
                        />
                    </Box>
                    
                    <Button 
                        variant="outlined" 
                        onClick={goToNext}
                        disabled={currentIndex === flashcards.length - 1}
                    >
                        <ArrowForwardIosIcon/>
                    </Button>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                    Card {currentIndex + 1} of {flashcards.length} • Use arrow keys to navigate
                </Typography>
            </Paper>

            {/* Add New Flashcard Section */}
            <Paper sx={{ p: 3, border: '1px solid #ddd' }}>
                <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
                    Add New Flashcard
                </Typography>
                <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'stretch', md: 'flex-end' }
                }}>
                    <TextField 
                        label="Question" 
                        variant="outlined" 
                        onChange={handleChangeQuestion}
                        value={questionInputValue}
                        fullWidth
                        placeholder="Enter your question here..."
                    />
                    <TextField 
                        label="Answer" 
                        variant="outlined"
                        onChange={handleChangeAnswer} 
                        value={answerInputValue}
                        fullWidth
                        placeholder="Enter the answer here..."
                    />
                    <Button 
                        variant="contained" 
                        onClick={handleAddFlashcard}
                        disabled={!questionInputValue.trim() || !answerInputValue.trim()}
                        startIcon={<AddIcon />}
                    >
                        Add Card
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}

export default App;
