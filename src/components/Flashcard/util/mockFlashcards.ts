import {FlashcardModel} from "../FlashcardModel";

export const mockFlashcards = (): FlashcardModel[] => {
    const mockFlashcards: FlashcardModel[] = [];
    
    // JavaScript/TypeScript concepts
    mockFlashcards.push({
        question: "What are async/await in JavaScript?",
        answer: "Async/await are keywords for handling asynchronous operations. 'async' before a function declaration makes it return a Promise. 'await' can only be used inside async functions and pauses execution until the Promise resolves, making asynchronous code look and behave more like synchronous code.",
        isLearned: false,
    });
    
    mockFlashcards.push({
        question: "What is a Promise in JavaScript?",
        answer: "A Promise is an object representing the eventual completion or failure of an asynchronous operation. It allows you to handle asynchronous operations more elegantly than callbacks, providing methods like .then(), .catch(), and .finally() to handle success, error, and cleanup scenarios.",
        isLearned: true,
    });
    
    // React concepts
    mockFlashcards.push({
        question: "What is the difference between state and props in React?",
        answer: "Props are read-only data passed from parent to child components, while state is mutable data managed within a component. Props flow down the component tree, and state can be updated using setState (class components) or useState hook (functional components).",
        isLearned: false,
    });
    
    mockFlashcards.push({
        question: "What is the Virtual DOM in React?",
        answer: "The Virtual DOM is a JavaScript representation of the actual DOM kept in memory. React uses it to optimize rendering by comparing (diffing) the new virtual DOM tree with the previous one and only updating the parts of the real DOM that have changed.",
        isLearned: false,
    });
    
    // TypeScript concepts
    mockFlashcards.push({
        question: "What are TypeScript interfaces?",
        answer: "Interfaces in TypeScript define the structure of objects, specifying what properties and methods an object should have. They provide compile-time type checking and help catch errors early in development while improving code documentation and IDE support.",
        isLearned: true,
    });
    
    // Web Development concepts
    mockFlashcards.push({
        question: "What is the difference between let, const, and var?",
        answer: "'var' has function scope and is hoisted. 'let' and 'const' have block scope. 'let' allows reassignment while 'const' creates immutable bindings. Both 'let' and 'const' are not hoisted in the same way as 'var' and have a temporal dead zone.",
        isLearned: false,
    });
    
    mockFlashcards.push({
        question: "What is CSS Flexbox?",
        answer: "Flexbox is a CSS layout method that provides an efficient way to arrange, distribute, and align items in a container. It works with a flex container (parent) and flex items (children), offering properties like justify-content, align-items, and flex-direction for responsive layouts.",
        isLearned: false,
    });
    
    // Computer Science concepts
    mockFlashcards.push({
        question: "What is Big O notation?",
        answer: "Big O notation describes the upper bound of algorithm complexity in terms of time or space. It helps analyze how an algorithm's performance scales with input size. Common examples: O(1) constant, O(n) linear, O(n²) quadratic, O(log n) logarithmic.",
        isLearned: true,
    });

    return mockFlashcards;
}
