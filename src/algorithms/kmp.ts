export interface MatchResult {
    indices: number[];
    executionTime: number;
    comparisons: number;
}

export function failureFunction (pattern: string): number[] {
    const m = pattern.length;
    const failure: number[] = new Array(m).fill(0);

    let j = 0;
    let i = 1;
    
    while (i < m) {
        if (pattern[i] === pattern[j]) {
            j++;
            failure[i] = j;
            i++;
        } else {
            if (j !== 0) {
                j = failure[j - 1];
            } else {
                failure[i] = 0;
                i++;
            }
        }
    }
    return failure;
}

export function kmpSearch (text: string, pattern: string): MatchResult {
    const startTime = performance.now();
    const indices: number[] = [];
    let comparisons = 0;

    const n = text.length;
    const m = pattern.length;

    if (m === 0 || m > n) {
        return {
            indices: [],
            executionTime: performance.now() - startTime,
            comparisons: 0,
        };
    }

    const textUpper = text.toUpperCase();
    const patternUpper = pattern.toUpperCase();
    const failure = failureFunction(patternUpper);

    let i = 0;
    let j = 0;

    while (i < n) {
        comparisons++;
        
        if (textUpper[i] === patternUpper[j]) {
            i++;
            j++;

            if (j === m) {
                indices.push(i - m);
                j = failure[j - 1];
            }
        } else {
            if (j !== 0) {
                j = failure[j - 1];
            } else {
                i++;
            }
        }
    }
    return {
        indices,
        executionTime: performance.now() - startTime,
        comparisons,
    };
}

export function kmpSearchMultiple (
  text: string,
  keywords: string[]
): Map<string, MatchResult> {
  const results = new Map<string, MatchResult>();

  for (const keyword of keywords) {
    const result = kmpSearch(text, keyword);
    if (result.indices.length > 0) {
      results.set(keyword, result);
    }
  }

  return results;
}
