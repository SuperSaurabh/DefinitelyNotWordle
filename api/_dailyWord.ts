let cached: { word: string; date: string } | null = null;

export async function getOfficialWord(): Promise<string> {
    const today = new Date().toISOString().slice(0, 10);
    if (cached?.date === today) return cached.word;

    const res = await fetch("https://api.datamuse.com/words?sp=?????&max=1000");
    const words = await res.json();
    const word = words[Math.floor(Math.random() * words.length)].word;
    cached = { word, date: today };
    console.log("OFFICIAL WORD:", word);
    return word;
}
