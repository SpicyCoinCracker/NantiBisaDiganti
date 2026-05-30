import { MatchResult } from './kmp';

const BASE = 256;
const MOD = 1000000007;

export function rabinKarpSearch(text: string, pattern: string): MatchResult {
    const indices: number[] = [];
    let comparisons = 0;

    const n = text.length;
    const m = pattern.length;

    if (m === 0 || m > n) {
        return { indices, executionTime: 0, comparisons: 0 };
    }

    const startTime = performance.now();
    const textUpper = text.toUpperCase();
    const patternUpper = pattern.toUpperCase();

    let patHash = 0;
    let txtHash = 0;
    let h = 1;

    for (let i = 0; i < m - 1; i++) {
        h = (h * BASE) % MOD;
    }

    for (let i = 0; i < m; i++) {
        patHash = (BASE * patHash + patternUpper.charCodeAt(i)) % MOD;
        txtHash = (BASE * txtHash + textUpper.charCodeAt(i)) % MOD;
    }

    for (let i = 0; i <= n - m; i++) {
        comparisons++;
        if (patHash === txtHash) {
            let j = 0;
            while (j < m && textUpper[i + j] === patternUpper[j]) {
                comparisons++;
                j++;
            }
            if (j === m) {
                indices.push(i);
            }
        }

        if (i < n - m) {
            txtHash = (
                BASE * (txtHash - textUpper.charCodeAt(i) * h) +
                textUpper.charCodeAt(i + m)
            ) % MOD;
            if (txtHash < 0) txtHash += MOD;
        }
    }

    return {
        indices,
        executionTime: performance.now() - startTime,
        comparisons,
    };
}

export function rabinKarpSearchMultiple(text: string, patterns: string[]): Map<string, MatchResult> {
    const results = new Map<string, MatchResult>();

    for (const pattern of patterns) {
        const result = rabinKarpSearch(text, pattern);
        if (result.indices.length > 0) {
            results.set(pattern, result);
        }
    }

    return results;
}

export interface RabinKarpMatch {
    keyword: string;
    index: number;
    algorithm: 'rabin-karp';
    executionTime: number;
    comparisons: number;
}

export function rabinKarpSearchFlat(text: string, patterns: string[]): RabinKarpMatch[] {
    const matches: RabinKarpMatch[] = [];

    for (const pattern of patterns) {
        const result = rabinKarpSearch(text, pattern);
        for (const idx of result.indices) {
            matches.push({
                keyword: pattern,
                index: idx,
                algorithm: 'rabin-karp',
                executionTime: result.executionTime,
                comparisons: result.comparisons,
            });
        }
    }

    return matches;
}
