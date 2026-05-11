import React, {ChangeEventHandler, useEffect, useMemo, useState} from 'react';
import './App.css';
import Flashcard from "./components/Flashcard/Flashcard";
import {
    Box,
    Button,
    Chip,
    Container,
    IconButton,
    LinearProgress,
    Paper,
    Stack,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import {DeckModel, FlashcardModel} from "./components/Flashcard/FlashcardModel";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import {mockDecks} from "./components/Flashcard/util/mockFlashcards";

const STORAGE_KEY = "flashcard-learning-decks";
const EMPTY_FLASHCARDS: FlashcardModel[] = [];

interface StudyEntry {
    flashcard: FlashcardModel,
    deckIndex: number,
}

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

const shuffleIndexes = (indexes: number[]): number[] => {
    const shuffledIndexes = [...indexes];

    for (let i = shuffledIndexes.length - 1; i > 0; i -= 1) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [shuffledIndexes[i], shuffledIndexes[randomIndex]] = [shuffledIndexes[randomIndex], shuffledIndexes[i]];
    }

    return shuffledIndexes;
};

function App() {
    const [decks, setDecks] = useState<DeckModel[]>(loadInitialDecks);
    const [selectedDeckId, setSelectedDeckId] = useState(decks[0]?.id ?? "");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [questionInputValue, setQuestionInputValue] = useState("");
    const [answerInputValue, setAnswerInputValue] = useState("");
    const [isReversed, setIsReversed] = useState(false);
    const [isShuffled, setIsShuffled] = useState(false);
    const [shuffleOrder, setShuffleOrder] = useState<number[]>([]);
    const [showStarredOnly, setShowStarredOnly] = useState(false);
    const [showNeedsPracticeOnly, setShowNeedsPracticeOnly] = useState(false);

    const currentDeck = decks.find(deck => deck.id === selectedDeckId) ?? decks[0];
    const flashcards = currentDeck?.flashcards ?? EMPTY_FLASHCARDS;

    const filteredEntries = useMemo<StudyEntry[]>(() => {
        return flashcards
            .map((flashcard, deckIndex) => ({flashcard, deckIndex}))
            .filter(entry => !showStarredOnly || entry.flashcard.isStarred)
            .filter(entry => {
                if (!showNeedsPracticeOnly) {
                    return true;
                }

                return !entry.flashcard.isLearned || (entry.flashcard.incorrectCount ?? 0) > 0;
            });
    }, [flashcards, showNeedsPracticeOnly, showStarredOnly]);

    const visibleEntries = useMemo<StudyEntry[]>(() => {
        if (!isShuffled) {
            return filteredEntries;
        }

        const orderedEntries = shuffleOrder
            .map(deckIndex => filteredEntries.find(entry => entry.deckIndex === deckIndex))
            .filter((entry): entry is StudyEntry => Boolean(entry));
        const missingEntries = filteredEntries.filter(entry => !shuffleOrder.includes(entry.deckIndex));

        return [...orderedEntries, ...missingEntries];
    }, [filteredEntries, isShuffled, shuffleOrder]);

    const currentEntry = visibleEntries[currentIndex];
    const currentFlashcard = currentEntry?.flashcard;
    const displayedQuestion = isReversed ? currentFlashcard?.answer : currentFlashcard?.question;
    const displayedAnswer = isReversed ? currentFlashcard?.question : currentFlashcard?.answer;
    const learnedCount = flashcards.filter(card => card.isLearned).length;
    const starredCount = flashcards.filter(card => card.isStarred).length;
    const needsPracticeCount = flashcards.filter(card => !card.isLearned || (card.incorrectCount ?? 0) > 0).length;

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
    }, [decks]);

    useEffect(() => {
        if (currentIndex > visibleEntries.length - 1) {
            setCurrentIndex(Math.max(visibleEntries.length - 1, 0));
        }
    }, [currentIndex, visibleEntries.length]);

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

    const updateFlashcardAtDeckIndex = (deckIndex: number, updater: (flashcard: FlashcardModel) => FlashcardModel) => {
        updateSelectedDeck(previousFlashcards => previousFlashcards.map((flashcard, flashcardIndex) => {
            if (flashcardIndex !== deckIndex) {
                return flashcard;
            }

            return updater(flashcard);
        }));
    };

    const handleSelectDeck = (deckId: string) => {
        setSelectedDeckId(deckId);
        setCurrentIndex(0);
        setShuffleOrder([]);
    };

    const toggleIsLearned = (index: number, checked: boolean) => {
        updateFlashcardAtDeckIndex(index, flashcard => ({
            ...flashcard,
            isLearned: checked,
            lastReviewedAt: new Date().toISOString(),
        }));
    };

    const markCurrentFlashcard = (isKnown: boolean) => {
        if (!currentEntry) {
            return;
        }

        updateFlashcardAtDeckIndex(currentEntry.deckIndex, flashcard => ({
            ...flashcard,
            isLearned: isKnown,
            correctCount: (flashcard.correctCount ?? 0) + (isKnown ? 1 : 0),
            incorrectCount: (flashcard.incorrectCount ?? 0) + (isKnown ? 0 : 1),
            lastReviewedAt: new Date().toISOString(),
        }));

        if (currentIndex < visibleEntries.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const toggleCurrentStar = () => {
        if (!currentEntry) {
            return;
        }

        updateFlashcardAtDeckIndex(currentEntry.deckIndex, flashcard => ({
            ...flashcard,
            isStarred: !flashcard.isStarred,
        }));
    };

    const goToNext = () => {
        if (currentIndex < visibleEntries.length - 1) {
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
                    isStarred: false,
                    correctCount: 0,
                    incorrectCount: 0,
                }
            ]));
            setAnswerInputValue("");
            setQuestionInputValue("");
        }
    };

    const toggleShuffle = () => {
        const nextIsShuffled = !isShuffled;
        setIsShuffled(nextIsShuffled);
        setShuffleOrder(nextIsShuffled ? shuffleIndexes(filteredEntries.map(entry => entry.deckIndex)) : []);
        setCurrentIndex(0);
    };

    const toggleStarredFilter = () => {
        setShowStarredOnly(!showStarredOnly);
        setCurrentIndex(0);
    };

    const toggleNeedsPracticeFilter = () => {
        setShowNeedsPracticeOnly(!showNeedsPracticeOnly);
        setCurrentIndex(0);
    };

    const getProgress = () => {
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
                            Progress: {learnedCount} / {flashcards.length} cards learned
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <Chip label={`${starredCount} starred`} size="small" variant="outlined" />
                            <Chip label={`${needsPracticeCount} to practice`} size="small" variant="outlined" />
                            <Chip
                                label={`${Math.round(getProgress())}% Complete`}
                                color={getProgress() === 100 ? 'success' : 'primary'}
                                size="small"
                            />
                        </Stack>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={getProgress()}
                    />
                </Box>
            </Box>

            <Paper sx={{ p: 3, mb: 4, border: '1px solid #ddd' }}>
                <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', flexWrap: 'wrap', rowGap: 1, mb: 2 }}>
                    <Tooltip title="Reverse direction">
                        <IconButton color={isReversed ? 'primary' : 'default'} onClick={() => setIsReversed(!isReversed)}>
                            <SwapHorizIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Shuffle cards">
                        <IconButton color={isShuffled ? 'primary' : 'default'} onClick={toggleShuffle}>
                            <ShuffleIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Show starred only">
                        <IconButton color={showStarredOnly ? 'primary' : 'default'} onClick={toggleStarredFilter}>
                            <StarIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Show cards to practice">
                        <IconButton color={showNeedsPracticeOnly ? 'primary' : 'default'} onClick={toggleNeedsPracticeFilter}>
                            <FilterAltIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={goToPrevious}
                        disabled={currentIndex === 0}
                    >
                        <ArrowBackIosNewIcon/>
                    </Button>

                    <Box sx={{ flex: 1, maxWidth: 600 }}>
                        {currentFlashcard ? (
                            <Flashcard
                                answer={displayedAnswer ?? ""}
                                question={displayedQuestion ?? ""}
                                isLearned={currentFlashcard.isLearned}
                                toggleIsLearnedFunction={toggleIsLearned}
                                flashcardIndex={currentEntry.deckIndex}
                                sourceLanguage={isReversed ? currentFlashcard.targetLanguage : currentFlashcard.sourceLanguage}
                                targetLanguage={isReversed ? currentFlashcard.sourceLanguage : currentFlashcard.targetLanguage}
                                example={currentFlashcard.example}
                                level={currentFlashcard.level}
                            />
                        ) : (
                            <Paper sx={{ p: 4, textAlign: 'center', border: '1px dashed #bbb' }}>
                                <Typography variant="h6">No cards match this view</Typography>
                            </Paper>
                        )}
                    </Box>

                    <Button
                        variant="outlined"
                        onClick={goToNext}
                        disabled={currentIndex === visibleEntries.length - 1 || visibleEntries.length === 0}
                    >
                        <ArrowForwardIosIcon/>
                    </Button>
                </Box>

                <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', mt: 2, flexWrap: 'wrap', rowGap: 1 }}>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<CloseIcon />}
                        onClick={() => markCurrentFlashcard(false)}
                        disabled={!currentFlashcard}
                    >
                        Need practice
                    </Button>
                    <Tooltip title={currentFlashcard?.isStarred ? "Remove star" : "Star card"}>
                        <IconButton onClick={toggleCurrentStar} disabled={!currentFlashcard}>
                            {currentFlashcard?.isStarred ? <StarIcon color="warning" /> : <StarBorderIcon />}
                        </IconButton>
                    </Tooltip>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleOutlineIcon />}
                        onClick={() => markCurrentFlashcard(true)}
                        disabled={!currentFlashcard}
                    >
                        I know it
                    </Button>
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                    Card {visibleEntries.length === 0 ? 0 : currentIndex + 1} of {visibleEntries.length} - Use arrow keys to navigate
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
