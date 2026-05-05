import { useState, useEffect } from "react";
import "./App.css";

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

type GameStatus = "playing" | "won" | "lost";

function App() {
    const [guesses, setGuesses] = useState<Map<string, number[]>>(new Map());
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
        if (current.length !== WORD_LENGTH) return;

        const res = await fetch("/api/checkWord", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ word: current }),
        });

        const { valid, correct, result } = await res.json();

        if (!valid) {
            flashMessage("Not in word list");
            return;
        }

        const newGuesses = new Map(guesses);
        newGuesses.set(current, result);
        setGuesses(newGuesses);
        setCurrent("");

        if (correct) {
            setStatus("won");
            flashMessage("You got it!");
        } else if (newGuesses.size >= MAX_GUESSES) {
            setStatus("lost");
            flashMessage("Out of guesses");
        }
    }

    function flashMessage(msg: string) {
        setMessage(msg);
        setTimeout(() => setMessage(""), 2000);
    }

    const guessEntries = [...guesses.entries()];
    const rows = [];
    for (let i = 0; i < MAX_GUESSES; i++) {
        if (i < guessEntries.length) {
            rows.push({ word: guessEntries[i][0], result: guessEntries[i][1] });
        } else if (i === guessEntries.length) {
            rows.push({ word: current, result: null });
        } else {
            rows.push({ word: "", result: null });
        }
    }

    return (
        <div className="container">
            <h1>Definitely Not Wordle</h1>
            <div className="message-bar">{message}</div>
            <div className="board">
                {rows.map((row, i) => (
                    <Row key={i} word={row.word} result={row.result} />
                ))}
            </div>
        </div>
    );
}

function Row({ word, result }: { word: string; result: number[] | null }) {
    const tiles = [];
    for (let i = 0; i < WORD_LENGTH; i++) {
        const letter = word[i] || "";
        const status = result?.[i];
        const colorClass =
            status === 2
                ? "hit"
                : status === 1
                  ? "present"
                  : status === 0
                    ? "miss"
                    : "";
        tiles.push(
            <div
                key={i}
                className={`tile ${letter ? "filled" : ""} ${colorClass}`}
            >
                {letter}
            </div>,
        );
    }
    return <div className="row">{tiles}</div>;
}

export default App;
