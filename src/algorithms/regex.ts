export interface RegexMatchResult {
    match: string;
    index: number;
    algorithm: 'regex';
    executionTime: number;
}

const JUDOL_WORDS = [
    'slot', 'gacor', 'maxwin', 'hoki', 'madu', 'petir', 'zeus',
    'dewa', 'jp', 'cuan', 'bonanza', 'wild', 'jackpot', 'scatter',
    'spin', 'rtp', 'pragmatic', 'habanero', 'judi', 'togel',
    'casino', 'taruhan', 'betting', 'megaways', 'starlight',
    'gates', 'olympus', 'sultan',
];

const IMPERIAL_WORDS = [
    'BET', 'WIN', 'LUCKY', 'VIP', 'BONUS', 'FREE', 'BIG', 'MEGA',
    'SUPER', 'ULTRA', 'HOT', 'COOL', 'BEST', 'TOP', 'JACKPOT',
    'JACK', 'POT', 'PAY', 'GIFT', 'CASH',
];

const JUDOL_WORDS_JOIN = JUDOL_WORDS.join('|');
const IMPERIAL_WORDS_JOIN = IMPERIAL_WORDS.join('|');

const WORD_PATTERNS: RegExp[] = [
    new RegExp(`\\b(?:${JUDOL_WORDS_JOIN})\\s*\\d{2,3}\\b`, 'gi'),
    new RegExp(`\\b\\d{2,3}\\s*(?:${JUDOL_WORDS_JOIN})\\b`, 'gi'),
    new RegExp(`\\b(?:${JUDOL_WORDS_JOIN})\\d{2,3}\\b`, 'gi'),
    new RegExp(`\\b\\d{2,3}(?:${JUDOL_WORDS_JOIN})\\b`, 'gi'),
    new RegExp(`\\b(?:${IMPERIAL_WORDS_JOIN})\\s*\\d{2,3}\\b`, 'gi'),
    new RegExp(`\\b\\d{2,3}\\s*(?:${IMPERIAL_WORDS_JOIN})\\b`, 'gi'),
    new RegExp(`\\b(?:${IMPERIAL_WORDS_JOIN})\\d{2,3}\\b`, 'gi'),
    new RegExp(`\\b\\d{2,3}(?:${IMPERIAL_WORDS_JOIN})\\b`, 'gi'),
    new RegExp(`\\b(?:${JUDOL_WORDS_JOIN})\\b`, 'gi'),
];

export function regexSearchAll(text: string, executionLimit: number = 2000): RegexMatchResult[] {
    const startTime = performance.now();
    const seen = new Set<string>();
    const results: RegexMatchResult[] = [];
    let matchCount = 0;

    for (const pattern of WORD_PATTERNS) {
        const regex = new RegExp(pattern.source, pattern.flags);
        let m: RegExpExecArray | null;

        while ((m = regex.exec(text)) !== null) {
            if (matchCount >= executionLimit) break;
            const key = m.index + ':' + m[0];
            if (!seen.has(key)) {
                seen.add(key);
                results.push({
                    match: m[0],
                    index: m.index,
                    algorithm: 'regex',
                    executionTime: 0,
                });
                matchCount++;
            }
            if (m.index === regex.lastIndex) regex.lastIndex++;
        }
        if (matchCount >= executionLimit) break;
    }

    const totalTime = performance.now() - startTime;
    for (const r of results) {
        r.executionTime = totalTime;
    }

    return results;
}
