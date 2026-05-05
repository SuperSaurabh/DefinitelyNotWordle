import { getOfficialWord } from "./_dailyWord.js";

export async function POST(request: Request) {
    const body = await request.json();
    const userWord = body.word;

    const dictRes = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${userWord}`,
    );
    if (!dictRes.ok) {
        return Response.json({ valid: false, correct: false });
    }

    const officialWord = await getOfficialWord();
    const correct = userWord === officialWord.toLowerCase();

    return Response.json({ valid: true, correct });
}
