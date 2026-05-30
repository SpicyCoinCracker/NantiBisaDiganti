import { kmpSearchMultiple, MatchResult } from './kmp';
import { bmSearchMultiple } from './boyer-moore';
import { regexSearchAll } from './regex';
import { fuzzySearchAll } from './levenshtein';
import { ahoCorasickSearch } from './aho-corasick';
import { rabinKarpSearchMultiple } from './rabin-karp';
import { normalizeText } from './normalize';

export type AlgorithmType = 'kmp' | 'boyer-moore' | 'regex' | 'fuzzy' | 'aho-corasick' | 'rabin-karp';

export interface PipelineMatch {
    keyword: string;
    index: number;
    algorithm: AlgorithmType;
    executionTime: number;
    comparisons?: number;
    matchText?: string;
}

export interface AlgoStat {
    time: number;
    matches: number;
    comparisons: number;
}

export interface PipelineStats {
    totalMatches: number;
    algorithmStats: {
        kmp: AlgoStat;
        bm: AlgoStat;
        regex: AlgoStat;
        fuzzy: AlgoStat;
        ahoCorasick: AlgoStat;
        rabinKarp: AlgoStat;
    };
    matchesByAlgorithm: Record<string, number>;
    keywordBreakdown: Record<string, number>;
}

function isWholeWordMatch(text: string, index: number, keywordLen: number): boolean {
    const before = index <= 0 ? true : !/[a-zA-Z0-9]/.test(text[index - 1]);
    const after = index + keywordLen >= text.length ? true : !/[a-zA-Z0-9]/.test(text[index + keywordLen]);
    return before && after;
}

function emptyStats(): PipelineStats {
    return {
        totalMatches: 0,
        algorithmStats: {
            kmp: { time: 0, matches: 0, comparisons: 0 },
            bm: { time: 0, matches: 0, comparisons: 0 },
            regex: { time: 0, matches: 0, comparisons: 0 },
            fuzzy: { time: 0, matches: 0, comparisons: 0 },
            ahoCorasick: { time: 0, matches: 0, comparisons: 0 },
            rabinKarp: { time: 0, matches: 0, comparisons: 0 },
        },
        matchesByAlgorithm: { kmp: 0, 'boyer-moore': 0, regex: 0, fuzzy: 0, 'aho-corasick': 0, 'rabin-karp': 0 },
        keywordBreakdown: {},
    };
}

export function runPipeline(
    text: string,
    keywords: string[],
    useKMP: boolean = true,
    useBM: boolean = true,
    useRegex: boolean = true,
    useFuzzy: boolean = true,
    useAC: boolean = false,
    useRK: boolean = false
): { matches: PipelineMatch[]; stats: PipelineStats } {
    const matches: PipelineMatch[] = [];
    const matchedSet = new Set<number>();
    const normalizedText = normalizeText(text);
    const stats = emptyStats();

    function addMatch(keyword: string, index: number, algo: AlgorithmType, time: number, comparisons?: number, matchText?: string) {
        if (matchedSet.has(index)) return;
        matchedSet.add(index);
        matches.push({ keyword, index, algorithm: algo, executionTime: time, comparisons, matchText });
        stats.keywordBreakdown[keyword] = (stats.keywordBreakdown[keyword] || 0) + 1;
    }

    function filterExactMatches(
        algoResults: Map<string, MatchResult>,
        algo: AlgorithmType
    ): { cmp: number; cnt: number } {
        let cmp = 0, cnt = 0;
        for (const [keyword, r] of algoResults) {
            cmp += r.comparisons;
            for (const idx of r.indices) {
                if (keyword.length <= 4 && !isWholeWordMatch(normalizedText, idx, keyword.length)) continue;
                addMatch(keyword, idx, algo, r.executionTime, r.comparisons);
                cnt++;
            }
        }
        return { cmp, cnt };
    }

    if (useKMP) {
        const t0 = performance.now();
        const results = kmpSearchMultiple(normalizedText, keywords);
        const elapsed = performance.now() - t0;
        const { cmp, cnt } = filterExactMatches(results, 'kmp');
        stats.algorithmStats.kmp = { time: elapsed, matches: cnt, comparisons: cmp };
        stats.matchesByAlgorithm.kmp = cnt;
    }

    if (useBM) {
        const t0 = performance.now();
        const results = bmSearchMultiple(normalizedText, keywords);
        const elapsed = performance.now() - t0;
        const { cmp, cnt } = filterExactMatches(results, 'boyer-moore');
        stats.algorithmStats.bm = { time: elapsed, matches: cnt, comparisons: cmp };
        stats.matchesByAlgorithm['boyer-moore'] = cnt;
    }

    if (useRegex) {
        const t0 = performance.now();
        const results = regexSearchAll(normalizedText);
        const elapsed = performance.now() - t0;
        for (const r of results) {
            addMatch(r.match, r.index, 'regex', elapsed, 0, r.match);
        }
        stats.algorithmStats.regex = { time: elapsed, matches: results.length, comparisons: 0 };
        stats.matchesByAlgorithm.regex = results.length;
    }

    if (useAC) {
        const t0 = performance.now();
        const results = ahoCorasickSearch(normalizedText, keywords);
        const elapsed = performance.now() - t0;
        const { cmp, cnt } = filterExactMatches(results, 'aho-corasick');
        stats.algorithmStats.ahoCorasick = { time: elapsed, matches: cnt, comparisons: cmp };
        stats.matchesByAlgorithm['aho-corasick'] = cnt;
    }

    if (useRK) {
        const t0 = performance.now();
        const results = rabinKarpSearchMultiple(normalizedText, keywords);
        const elapsed = performance.now() - t0;
        const { cmp, cnt } = filterExactMatches(results, 'rabin-karp');
        stats.algorithmStats.rabinKarp = { time: elapsed, matches: cnt, comparisons: cmp };
        stats.matchesByAlgorithm['rabin-karp'] = cnt;
    }

    if (useFuzzy) {
        const exactMatchedKeywords = new Set<string>();
        for (const m of matches) {
            if (m.algorithm === 'kmp' || m.algorithm === 'boyer-moore' || m.algorithm === 'aho-corasick' || m.algorithm === 'rabin-karp') {
                exactMatchedKeywords.add(m.keyword);
            }
        }
        const fuzzyKeywords = keywords.filter(k => !exactMatchedKeywords.has(k));
        const t0 = performance.now();

        const fuzzyResults = fuzzySearchAll(normalizedText, fuzzyKeywords);
        const elapsed = performance.now() - t0;
        let fuzzyCmp = fuzzyResults.length * fuzzyKeywords.length;
        let fuzzyCnt = 0;

        for (const r of fuzzyResults) {
            const alreadyMatched = matchedSet.has(r.startIndex);
            if (alreadyMatched) continue;
            addMatch(r.keyword, r.startIndex, 'fuzzy', elapsed, 1, r.word);
            fuzzyCnt++;
        }

        stats.algorithmStats.fuzzy = { time: elapsed, matches: fuzzyCnt, comparisons: fuzzyCmp };
        stats.matchesByAlgorithm.fuzzy = fuzzyCnt;
    }

    stats.totalMatches = matches.length;
    return { matches, stats };
}

export function deduplicateMatches(matches: PipelineMatch[]): PipelineMatch[] {
    const seen = new Set<number>();
    return matches.filter(m => {
        if (seen.has(m.index)) return false;
        seen.add(m.index);
        return true;
    });
}
