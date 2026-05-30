let cached: string[] | null = null;

export async function loadKeywordsFromFile(): Promise<string[]> {
    if (cached !== null) return cached;

    try {
        const url = chrome.runtime.getURL('keywords.txt');
        const resp = await fetch(url);
        const text = await resp.text();
        const keywords = text
            .split('\n')
            .map(k => k.trim().toLowerCase())
            .filter(k => k.length > 0);

        if (keywords.length > 0) {
            cached = keywords;
            return keywords;
        }
    } catch (e) {
        console.warn('Failed to load keywords.txt:', e);
    }

    cached = [];
    return cached;
}
