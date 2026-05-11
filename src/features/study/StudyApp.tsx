"use client";

import React, {ChangeEventHandler, useEffect, useMemo, useState} from 'react';
import Flashcard from "../../components/Flashcard/Flashcard";
import {
    Box,
    Button,
    Chip,
    Container,
    Alert,
    IconButton,
    LinearProgress,
    Paper,
    Stack,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import {DeckModel, FlashcardModel} from "../../components/Flashcard/FlashcardModel";
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
import {mockDecks} from "../../components/Flashcard/util/mockFlashcards";

const STORAGE_KEY = "flashcard-learning-decks";
const EMPTY_FLASHCARDS: FlashcardModel[] = [];

interface StudyEntry {
    flashcard: FlashcardModel,
    deckIndex: number,
}

type StudyMode = "flashcards" | "learn" | "test";

interface LearnResult {
    isCorrect: boolean,
    correctAnswer: string,
}

interface TestAnswer {
    deckIndex: number,
    question: string,
    correctAnswer: string,
    userAnswer: string,
    isCorrect: boolean,
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

const normalizeAnswer = (value: string): string => {
    return value
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[?!.,"']/g, "")
        .replace(/\s+/g, " ");
};

const getLearningText = (flashcard: FlashcardModel, isReversed: boolean, side: "question" | "answer"): string => {
    if (side === "question") {
        return isReversed ? flashcard.answer : flashcard.question;
    }

    return isReversed ? flashcard.question : flashcard.answer;
};

function StudyApp() {
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
    const [studyMode, setStudyMode] = useState<StudyMode>("flashcards");
    const [learnIndex, setLearnIndex] = useState(0);
    const [writtenAnswer, setWrittenAnswer] = useState("");
    const [selectedChoice, setSelectedChoice] = useState("");
    const [learnResult, setLearnResult] = useState<LearnResult | null>(null);
    const [testIndex, setTestIndex] = useState(0);
    const [testWrittenAnswer, setTestWrittenAnswer] = useState("");
    const [testResults, setTestResults] = useState<TestAnswer[]>([]);
    const [isTestFinished, setIsTestFinished] = useState(false);

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
    const currentLearnEntry = visibleEntries[learnIndex];
    const currentLearnFlashcard = currentLearnEntry?.flashcard;
    const learnQuestion = currentLearnFlashcard ? getLearningText(currentLearnFlashcard, isReversed, "question") : "";
    const learnAnswer = currentLearnFlashcard ? getLearningText(currentLearnFlashcard, isReversed, "answer") : "";
    const learnQuestionType = learnIndex % 2 === 0 ? "written" : "choice";
    const currentTestEntry = visibleEntries[testIndex];
    const currentTestFlashcard = currentTestEntry?.flashcard;
    const testQuestion = currentTestFlashcard ? getLearningText(currentTestFlashcard, isReversed, "question") : "";
    const testAnswer = currentTestFlashcard ? getLearningText(currentTestFlashcard, isReversed, "answer") : "";
    const testQuestionType = testIndex % 2 === 0 ? "written" : "choice";
    const testScore = testResults.filter(result => result.isCorrect).length;
    const learnedCount = flashcards.filter(card => card.isLearned).length;
    const starredCount = flashcards.filter(card => card.isStarred).length;
    const needsPracticeCount = flashcards.filter(card => !card.isLearned || (card.incorrectCount ?? 0) > 0).length;

    const answerOptions = useMemo<string[]>(() => {
        if (!currentLearnFlashcard) {
            return [];
        }

        const distractors = visibleEntries
            .map(entry => getLearningText(entry.flashcard, isReversed, "answer"))
            .filter(answer => normalizeAnswer(answer) !== normalizeAnswer(learnAnswer));
        const uniqueDistractors = Array.from(new Set(distractors));
        const selectedDistractors = shuffleIndexes(uniqueDistractors.map((_, index) => index))
            .slice(0, 3)
            .map(index => uniqueDistractors[index]);

        return shuffleIndexes([learnAnswer, ...selectedDistractors].map((_, index) => index))
            .map(index => [learnAnswer, ...selectedDistractors][index]);
    }, [currentLearnFlashcard, isReversed, learnAnswer, visibleEntries]);

    const testAnswerOptions = useMemo<string[]>(() => {
        if (!currentTestFlashcard) {
            return [];
        }

        const distractors = visibleEntries
            .map(entry => getLearningText(entry.flashcard, isReversed, "answer"))
            .filter(answer => normalizeAnswer(answer) !== normalizeAnswer(testAnswer));
        const uniqueDistractors = Array.from(new Set(distractors));
        const selectedDistractors = shuffleIndexes(uniqueDistractors.map((_, index) => index))
            .slice(0, 3)
            .map(index => uniqueDistractors[index]);
        const options = [testAnswer, ...selectedDistractors];

        return shuffleIndexes(options.map((_, index) => index)).map(index => options[index]);
    }, [currentTestFlashcard, isReversed, testAnswer, visibleEntries]);

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
    }, [decks]);

    useEffect(() => {
        if (currentIndex > visibleEntries.length - 1) {
            setCurrentIndex(Math.max(visibleEntries.length - 1, 0));
        }
    }, [currentIndex, visibleEntries.length]);

    useEffect(() => {
        if (learnIndex > visibleEntries.length - 1) {
            setLearnIndex(Math.max(visibleEntries.length - 1, 0));
        }
    }, [learnIndex, visibleEntries.length]);

    useEffect(() => {
        if (testIndex > visibleEntries.length - 1) {
            setTestIndex(Math.max(visibleEntries.length - 1, 0));
        }
    }, [testIndex, visibleEntries.length]);

    useEffect(() => {
        setWrittenAnswer("");
        setSelectedChoice("");
        setLearnResult(null);
    }, [learnIndex, learnQuestion, learnAnswer, studyMode]);

    useEffect(() => {
        setTestWrittenAnswer("");
    }, [testIndex, testQuestion, testAnswer, studyMode]);

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
        setLearnIndex(0);
        resetTest();
        setShuffleOrder([]);
    };

    const toggleIsLearned = (index: number, checked: boolean) => {
        updateFlashcardAtDeckIndex(index, flashcard => ({
            ...flashcard,
            isLearned: checked,
            lastReviewedAt: new Date().toISOString(),
        }));
    };

    const recordAnswer = (deckIndex: number, isCorrect: boolean) => {
        updateFlashcardAtDeckIndex(deckIndex, flashcard => ({
            ...flashcard,
            isLearned: isCorrect,
            correctCount: (flashcard.correctCount ?? 0) + (isCorrect ? 1 : 0),
            incorrectCount: (flashcard.incorrectCount ?? 0) + (isCorrect ? 0 : 1),
            lastReviewedAt: new Date().toISOString(),
        }));
    };

    const resetTest = () => {
        setTestIndex(0);
        setTestWrittenAnswer("");
        setTestResults([]);
        setIsTestFinished(false);
    };

    const markCurrentFlashcard = (isKnown: boolean) => {
        if (!currentEntry) {
            return;
        }

        recordAnswer(currentEntry.deckIndex, isKnown);

        if (currentIndex < visibleEntries.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const checkLearnAnswer = (answer: string) => {
        if (!currentLearnEntry || learnResult) {
            return;
        }

        const isCorrect = normalizeAnswer(answer) === normalizeAnswer(learnAnswer);
        recordAnswer(currentLearnEntry.deckIndex, isCorrect);
        setLearnResult({
            isCorrect,
            correctAnswer: learnAnswer,
        });
    };

    const goToNextLearnQuestion = () => {
        if (learnIndex < visibleEntries.length - 1) {
            setLearnIndex(learnIndex + 1);
        } else {
            setLearnIndex(0);
        }
    };

    const submitTestAnswer = (answer: string) => {
        if (!currentTestEntry || isTestFinished) {
            return;
        }

        const isCorrect = normalizeAnswer(answer) === normalizeAnswer(testAnswer);
        recordAnswer(currentTestEntry.deckIndex, isCorrect);
        setTestResults(previousResults => ([
            ...previousResults,
            {
                deckIndex: currentTestEntry.deckIndex,
                question: testQuestion,
                correctAnswer: testAnswer,
                userAnswer: answer,
                isCorrect,
            }
        ]));

        if (testIndex < visibleEntries.length - 1) {
            setTestIndex(testIndex + 1);
        } else {
            setIsTestFinished(true);
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
        setLearnIndex(0);
        resetTest();
    };

    const toggleStarredFilter = () => {
        setShowStarredOnly(!showStarredOnly);
        setCurrentIndex(0);
        setLearnIndex(0);
        resetTest();
    };

    const toggleNeedsPracticeFilter = () => {
        setShowNeedsPracticeOnly(!showNeedsPracticeOnly);
        setCurrentIndex(0);
        setLearnIndex(0);
        resetTest();
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
                <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', mb: 2 }}>
                    <Button
                        variant={studyMode === "flashcards" ? "contained" : "outlined"}
                        onClick={() => setStudyMode("flashcards")}
                    >
                        Flashcards
                    </Button>
                    <Button
                        variant={studyMode === "learn" ? "contained" : "outlined"}
                        onClick={() => setStudyMode("learn")}
                    >
                        Learn
                    </Button>
                    <Button
                        variant={studyMode === "test" ? "contained" : "outlined"}
                        onClick={() => {
                            setStudyMode("test");
                            resetTest();
                        }}
                    >
                        Test
                    </Button>
                </Stack>

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

                {studyMode === "flashcards" ? (
                    <>
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
                    </>
                ) : studyMode === "learn" ? (
                    <Box sx={{ maxWidth: 720, mx: 'auto' }}>
                        {currentLearnFlashcard ? (
                            <Paper sx={{ p: 3, border: '1px solid #ddd' }}>
                                <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', rowGap: 1 }}>
                                    <Chip label={learnQuestionType === "written" ? "Type answer" : "Choose answer"} color="primary" size="small" />
                                    <Chip label={`${isReversed ? currentLearnFlashcard.targetLanguage : currentLearnFlashcard.sourceLanguage} -> ${isReversed ? currentLearnFlashcard.sourceLanguage : currentLearnFlashcard.targetLanguage}`} size="small" variant="outlined" />
                                    {currentLearnFlashcard.level && <Chip label={currentLearnFlashcard.level} size="small" variant="outlined" />}
                                </Stack>

                                <Typography variant="overline" color="text.secondary">
                                    Translate
                                </Typography>
                                <Typography variant="h4" sx={{ mt: 1, mb: 3 }}>
                                    {learnQuestion}
                                </Typography>

                                {learnQuestionType === "written" ? (
                                    <Stack spacing={2}>
                                        <TextField
                                            label="Your answer"
                                            value={writtenAnswer}
                                            onChange={(event) => setWrittenAnswer(event.target.value)}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter" && writtenAnswer.trim()) {
                                                    checkLearnAnswer(writtenAnswer);
                                                }
                                            }}
                                            disabled={Boolean(learnResult)}
                                            fullWidth
                                        />
                                        <Button
                                            variant="contained"
                                            onClick={() => checkLearnAnswer(writtenAnswer)}
                                            disabled={!writtenAnswer.trim() || Boolean(learnResult)}
                                        >
                                            Check
                                        </Button>
                                    </Stack>
                                ) : (
                                    <Stack spacing={1}>
                                        {answerOptions.map(option => (
                                            <Button
                                                key={option}
                                                variant={selectedChoice === option ? "contained" : "outlined"}
                                                onClick={() => {
                                                    setSelectedChoice(option);
                                                    checkLearnAnswer(option);
                                                }}
                                                disabled={Boolean(learnResult)}
                                                sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
                                            >
                                                {option}
                                            </Button>
                                        ))}
                                    </Stack>
                                )}

                                {learnResult && (
                                    <Alert severity={learnResult.isCorrect ? "success" : "error"} sx={{ mt: 2 }}>
                                        {learnResult.isCorrect ? "Correct" : `Correct answer: ${learnResult.correctAnswer}`}
                                    </Alert>
                                )}

                                {currentLearnFlashcard.example && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                                        {currentLearnFlashcard.example}
                                    </Typography>
                                )}

                                <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', mt: 3 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => setLearnIndex(Math.max(learnIndex - 1, 0))}
                                        disabled={learnIndex === 0}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={goToNextLearnQuestion}
                                        disabled={!learnResult}
                                    >
                                        Next
                                    </Button>
                                </Stack>
                            </Paper>
                        ) : (
                            <Paper sx={{ p: 4, textAlign: 'center', border: '1px dashed #bbb' }}>
                                <Typography variant="h6">No cards match this Learn session</Typography>
                            </Paper>
                        )}

                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                            Question {visibleEntries.length === 0 ? 0 : learnIndex + 1} of {visibleEntries.length}
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ maxWidth: 760, mx: 'auto' }}>
                        {isTestFinished ? (
                            <Paper sx={{ p: 3, border: '1px solid #ddd' }}>
                                <Typography variant="overline" color="text.secondary">
                                    Test result
                                </Typography>
                                <Typography variant="h3" sx={{ mt: 1 }}>
                                    {testScore} / {testResults.length}
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={testResults.length > 0 ? (testScore / testResults.length) * 100 : 0}
                                    sx={{ my: 2 }}
                                />
                                <Stack spacing={1}>
                                    {testResults.map((result, index) => (
                                        <Alert key={`${result.deckIndex}-${index}`} severity={result.isCorrect ? "success" : "error"}>
                                            {result.question} - your answer: {result.userAnswer || "empty"}; correct: {result.correctAnswer}
                                        </Alert>
                                    ))}
                                </Stack>
                                <Button variant="contained" onClick={resetTest} sx={{ mt: 3 }}>
                                    Retake test
                                </Button>
                            </Paper>
                        ) : currentTestFlashcard ? (
                            <Paper sx={{ p: 3, border: '1px solid #ddd' }}>
                                <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', rowGap: 1 }}>
                                    <Chip label={testQuestionType === "written" ? "Written test" : "Multiple choice"} color="primary" size="small" />
                                    <Chip label={`${isReversed ? currentTestFlashcard.targetLanguage : currentTestFlashcard.sourceLanguage} -> ${isReversed ? currentTestFlashcard.sourceLanguage : currentTestFlashcard.targetLanguage}`} size="small" variant="outlined" />
                                    {currentTestFlashcard.level && <Chip label={currentTestFlashcard.level} size="small" variant="outlined" />}
                                </Stack>

                                <Typography variant="overline" color="text.secondary">
                                    Test question
                                </Typography>
                                <Typography variant="h4" sx={{ mt: 1, mb: 3 }}>
                                    {testQuestion}
                                </Typography>

                                {testQuestionType === "written" ? (
                                    <Stack spacing={2}>
                                        <TextField
                                            label="Test answer"
                                            value={testWrittenAnswer}
                                            onChange={(event) => setTestWrittenAnswer(event.target.value)}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter" && testWrittenAnswer.trim()) {
                                                    submitTestAnswer(testWrittenAnswer);
                                                }
                                            }}
                                            fullWidth
                                        />
                                        <Button
                                            variant="contained"
                                            onClick={() => submitTestAnswer(testWrittenAnswer)}
                                            disabled={!testWrittenAnswer.trim()}
                                        >
                                            Submit answer
                                        </Button>
                                    </Stack>
                                ) : (
                                    <Stack spacing={1}>
                                        {testAnswerOptions.map(option => (
                                            <Button
                                                key={option}
                                                variant="outlined"
                                                onClick={() => submitTestAnswer(option)}
                                                sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
                                            >
                                                {option}
                                            </Button>
                                        ))}
                                    </Stack>
                                )}
                            </Paper>
                        ) : (
                            <Paper sx={{ p: 4, textAlign: 'center', border: '1px dashed #bbb' }}>
                                <Typography variant="h6">No cards match this Test session</Typography>
                            </Paper>
                        )}

                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                            Question {visibleEntries.length === 0 ? 0 : Math.min(testIndex + 1, visibleEntries.length)} of {visibleEntries.length}
                        </Typography>
                    </Box>
                )}
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

export default StudyApp;
