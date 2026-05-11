import type {Metadata} from "next";
import type {ReactNode} from "react";
import "../index.css";

export const metadata: Metadata = {
    title: "Flashcard Learning App",
    description: "Study Spanish and English with flashcards, Learn mode, and tests.",
};

export default function RootLayout({
    children,
}: {
    children: ReactNode,
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
