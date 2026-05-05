import { getOfficialWord } from "./_dailyWord.js";

export async function POST(request: Request) {
    const body = await request.json();
    const userWord: string = body.word;
    const officialWord = await getOfficialWord();
    console.log("OFFICIAL WORD:", officialWord);
    const correct = userWord === officialWord.toLowerCase();

    if (!correct) {
        const dictRes = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${userWord}`,
        );
        if (!dictRes.ok) {
            return Response.json({ valid: false, correct: false });
        }
    }

    const result: number[] = []; // 2 is corrent, 1 is wrong place, 0 is wrong

    [...userWord].forEach((letter, i) => {
        if (officialWord[i] == letter) result.push(2);
        else if (officialWord.slice(i).includes(letter)) result.push(1);
        else result.push(0);
    });

    return Response.json({ valid: true, correct, result: result });
}
