let cached: { word: string; date: string } | null = null;

export async function getOfficialWord(): Promise<string> {
    const today = new Date().toISOString().slice(0, 10);

    if (cached?.date === today) return cached.word;

    const res = await fetch(
        "https://random-word-api.herokuapp.com/word?length=5&diff=1",
    );
    const [word] = await res.json();
    cached = { word, date: today };
    return word;
}
