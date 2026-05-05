import { useState, useEffect } from "react";
import "./App.css";

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

type GameStatus = "playing" | "won" | "lost";

function App() {
    const [guesses, setGuesses] = useState<string[]>([]);
    const [current, setCurrent] = useState("");
    const [status, setStatus] = useState<GameStatus>("playing");
    const [message, setMessage] = useState("");

    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (status !== "playing") return;

            if (e.key === "Enter") {
                submitGuess();
            } else if (e.key === "Backspace") {
                setCurrent((c) => c.slice(0, -1));
            } else if (
                /^[a-zA-Z]$/.test(e.key) &&
                current.length < WORD_LENGTH
            ) {
                setCurrent((c) => c + e.key.toLowerCase());
            }
        }

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    });

    async function submitGuess() {
        if (current.length !== WORD_LENGTH) {
            flashMessage("Not enough letters");
            return;
        }

        try {
            const res = await fetch("/api/check-word", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ word: current }),
            });

            if (!res.ok) {
                flashMessage("Something went wrong");
                return;
            }

            const { valid, correct } = await res.json();

            if (!valid) {
                flashMessage("Not in word list");
                return;
            }

            const newGuesses = [...guesses, current];
            setGuesses(newGuesses);
            setCurrent("");

            if (correct) {
                setStatus("won");
                flashMessage("You got it!");
            } else if (newGuesses.length >= MAX_GUESSES) {
                setStatus("lost");
                flashMessage("Out of guesses");
            }
        } catch {
            flashMessage("Network error");
        }
    }

    function flashMessage(msg: string) {
        setMessage(msg);
        setTimeout(() => setMessage(""), 2000);
    }

    // Build the 6x5 grid
    const rows: string[] = [];
    for (let i = 0; i < MAX_GUESSES; i++) {
        if (i < guesses.length) rows.push(guesses[i]);
        else if (i === guesses.length) rows.push(current);
        else rows.push("");
    }

    return (
        <div className="container">
            <h1>Wordle</h1>

            <div className="message-bar">{message}</div>

            <div className="board">
                {rows.map((row, i) => (
                    <Row key={i} word={row} submitted={i < guesses.length} />
                ))}
            </div>
        </div>
    );
}

function Row({ word, submitted }: { word: string; submitted: boolean }) {
    const tiles = [];
    for (let i = 0; i < WORD_LENGTH; i++) {
        const letter = word[i] || "";
        tiles.push(
            <div
                key={i}
                className={`tile ${letter ? "filled" : ""} ${submitted ? "submitted" : ""}`}
            >
                {letter}
            </div>,
        );
    }
    return <div className="row">{tiles}</div>;
}

export default App;
