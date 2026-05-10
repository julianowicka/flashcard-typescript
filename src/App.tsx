import React, {ChangeEventHandler, useEffect, useState} from 'react';
import './App.css';
import Flashcard from "./components/Flashcard/Flashcard";
import {Box, Button, Chip, Container, LinearProgress, Paper, Stack, TextField, Typography} from "@mui/material";
import {DeckModel, FlashcardModel} from "./components/Flashcard/FlashcardModel";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import AddIcon from '@mui/icons-material/Add';
import {mockDecks} from "./components/Flashcard/util/mockFlashcards";

const STORAGE_KEY = "flashcard-learning-decks";

const loadInitialDecks = (): DeckModel[] => {
    const fallbackDecks = mockDecks();

    try {
        const storedDecks = window.localStorage.getItem(STORAGE_KEY);

        if (!storedDecks) {
            return fallbackDecks;
        }

        const parsedDecks = JSON.parse(storedDecks) as DeckModel[];
        return Array.isArray(parsedDecks) && parsedDecks.length > 0 ? parsedDecks : fallbackDecks;
    } catch {
        return fallbackDecks;
    }
};

function App() {
    const [decks, setDecks] = useState<DeckModel[]>(loadInitialDecks);
    const [selectedDeckId, setSelectedDeckId] = useState(decks[0]?.id ?? "");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [questionInputValue, setQuestionInputValue] = useState("");
    const [answerInputValue, setAnswerInputValue] = useState("");

    const currentDeck = decks.find(deck => deck.id === selectedDeckId) ?? decks[0];
    const flashcards = currentDeck?.flashcards ?? [];
    const currentFlashcard = flashcards[currentIndex] ?? flashcards[0];

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
    }, [decks]);

    useEffect(() => {
        if (currentIndex > flashcards.length - 1) {
            setCurrentIndex(Math.max(flashcards.length - 1, 0));
        }
    }, [currentIndex, flashcards.length]);

    const updateSelectedDeck = (updater: (flashcards: FlashcardModel[]) => FlashcardModel[]) => {
        setDecks(previousDecks => previousDecks.map(deck => {
            if (deck.id !== selectedDeckId) {
                return deck;
            }

            return {
                ...deck,
                flashcards: updater(deck.flashcards),
            };
        }));
    };

    const handleSelectDeck = (deckId: string) => {
        setSelectedDeckId(deckId);
        setCurrentIndex(0);
    };

    const toggleIsLearned = (index: number, checked: boolean) => {
        updateSelectedDeck(previousFlashcards => previousFlashcards.map((flashcard, flashcardIndex) => {
            if (flashcardIndex !== index) {
                return flashcard;
            }

            return {
                ...flashcard,
                isLearned: checked,
            };
        }));
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

    const handleChangeQuestion: ChangeEventHandler<HTMLInputElement> = (event) => {
        setQuestionInputValue(event.target.value);
    };

    const handleChangeAnswer: ChangeEventHandler<HTMLInputElement> = (event) => {
        setAnswerInputValue(event.target.value);
    };

    const handleAddFlashcard = () => {
        if (questionInputValue.trim() && answerInputValue.trim()) {
            updateSelectedDeck(previousFlashcards => ([
                ...previousFlashcards,
                {
                    answer: answerInputValue.trim(),
                    question: questionInputValue.trim(),
                    sourceText: questionInputValue.trim(),
                    targetText: answerInputValue.trim(),
                    sourceLanguage: currentDeck.sourceLanguage,
                    targetLanguage: currentDeck.targetLanguage,
                    level: currentDeck.level,
                    isLearned: false,
                }
            ]));
            setAnswerInputValue("");
            setQuestionInputValue("");
        }
    };

    const getProgress = () => {
        const learnedCount = flashcards.filter(card => card.isLearned).length;
        return flashcards.length > 0 ? (learnedCount / flashcards.length) * 100 : 0;
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

                <Paper sx={{ p: 2, mt: 3, textAlign: 'left', border: '1px solid #ddd' }}>
                    <Typography variant="overline" color="text.secondary">
                        Decks
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', rowGap: 1 }}>
                        {decks.map(deck => (
                            <Chip
                                key={deck.id}
                                label={`${deck.name} (${deck.flashcards.length})`}
                                color={deck.id === currentDeck.id ? 'primary' : 'default'}
                                variant={deck.id === currentDeck.id ? 'filled' : 'outlined'}
                                onClick={() => handleSelectDeck(deck.id)}
                            />
                        ))}
                    </Stack>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h6">
                            {currentDeck.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {currentDeck.description}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {currentDeck.sourceLanguage} -&gt; {currentDeck.targetLanguage} - Level {currentDeck.level}
                        </Typography>
                    </Box>
                </Paper>

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
                        {currentFlashcard && (
                            <Flashcard
                                answer={currentFlashcard.answer}
                                question={currentFlashcard.question}
                                isLearned={currentFlashcard.isLearned}
                                toggleIsLearnedFunction={toggleIsLearned}
                                flashcardIndex={currentIndex}
                                sourceLanguage={currentFlashcard.sourceLanguage}
                                targetLanguage={currentFlashcard.targetLanguage}
                                example={currentFlashcard.example}
                                level={currentFlashcard.level}
                            />
                        )}
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
                    Card {currentIndex + 1} of {flashcards.length} - Use arrow keys to navigate
                </Typography>
            </Paper>

            <Paper sx={{ p: 3, border: '1px solid #ddd' }}>
                <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
                    Add New Flashcard to {currentDeck.name}
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
