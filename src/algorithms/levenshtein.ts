const VISUAL_SIMILARITY: Map<string, number> = new Map([
    ["O0", 0.1], ["0O", 0.1],
    ["I1", 0.1], ["1I", 0.1],
    ["L1", 0.2], ["1L", 0.2],
    ["A4", 0.2], ["4A", 0.2],
    ["E3", 0.2], ["3E", 0.2],
    ["S5", 0.2], ["5S", 0.2],
    ["B8", 0.2], ["8B", 0.2],
    ["T7", 0.3], ["7T", 0.3],
    ["G9", 0.3], ["9G", 0.3],
    ["G6", 0.3], ["6G", 0.3],
    ["0@", 0.2], ["@0", 0.2],
    ["S$", 0.1], ["$S", 0.1],
]);

function getSubstitutionWeight(a: string, b: string): number {
    if (a === b) return 0;
    const key = a + b;
    return VISUAL_SIMILARITY.get(key) ?? 1.0;
}

export function weightedLevenshtein(a: string, b: string): number {
    const m = a.length;
    const n = b.length;

    const dp: number[][] = Array.from(
        { length: m + 1 },
        () => new Array(n + 1).fill(0)
    );

    for (let i = 1; i <= m; i++) dp[i][0] = dp[i - 1][0] + 1;
    for (let j = 1; j <= n; j++) dp[0][j] = dp[0][j - 1] + 1;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const subWeight = getSubstitutionWeight(
                a[i - 1].toUpperCase(),
                b[j - 1].toUpperCase()
            );
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + subWeight
            );
        }
    }
    return dp[m][n];
}

export function isFuzzyMatch(
    word: string,
    keyword: string,
    threshold: number = 1.5
): boolean {
    if (Math.abs(word.length - keyword.length) > 2) return false;
    const distance = weightedLevenshtein(
        word.toUpperCase(),
        keyword.toUpperCase()
    );
    return distance <= threshold && distance > 0;
}

export interface FuzzyMatchResult {
    word: string;
    keyword: string;
    distance: number;
    startIndex: number;
}

export function fuzzySearchAll(
    text: string,
    keywords: string[],
    threshold: number = 1.5
): FuzzyMatchResult[] {
    const results: FuzzyMatchResult[] = [];
    const n = text.length;
    let i = 0;

    while (i < n) {
        if (/\s/.test(text[i]) || !/[a-zA-Z0-9]/.test(text[i])) {
            i++;
            continue;
        }

        let j = i;
        while (j < n && /[a-zA-Z0-9]/.test(text[j])) {
            j++;
        }

        const word = text.substring(i, j);
        if (word.length >= 3) {
            for (const keyword of keywords) {
                if (isFuzzyMatch(word, keyword, threshold)) {
                    results.push({
                        word,
                        keyword,
                        distance: weightedLevenshtein(
                            word.toUpperCase(),
                            keyword.toUpperCase()
                        ),
                        startIndex: i,
                    });
                }
            }
        }

        i = j;
    }

    return results;
}
