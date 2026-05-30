import { MatchResult } from './kmp';

interface AhoNode {
    children: Map<string, AhoNode>;
    fail: AhoNode | null;
    output: string[];
    depth: number;
}

function buildTrie(patterns: string[]): AhoNode {
    const root: AhoNode = {
        children: new Map(),
        fail: null,
        output: [],
        depth: 0,
    };

    for (const pattern of patterns) {
        let node = root;
        for (const ch of pattern) {
            const upper = ch.toUpperCase();
            if (!node.children.has(upper)) {
                node.children.set(upper, {
                    children: new Map(),
                    fail: null,
                    output: [],
                    depth: node.depth + 1,
                });
            }
            node = node.children.get(upper)!;
        }
        node.output.push(pattern);
    }

    return root;
}

function buildFailureLinks(root: AhoNode): void {
    const queue: AhoNode[] = [];

    for (const [, child] of root.children) {
        child.fail = root;
        queue.push(child);
    }

    while (queue.length > 0) {
        const node = queue.shift()!;

        for (const [ch, child] of node.children) {
            let fail = node.fail;
            while (fail !== null && !fail.children.has(ch)) {
                fail = fail.fail;
            }
            child.fail = fail ? fail.children.get(ch)! : root;
            child.output.push(...child.fail.output);
            queue.push(child);
        }
    }
}

export function ahoCorasickSearch(text: string, patterns: string[]): Map<string, MatchResult> {
    const startTime = performance.now();
    const results = new Map<string, MatchResult>();
    const upperText = text.toUpperCase();

    for (const p of patterns) {
        results.set(p, { indices: [], executionTime: 0, comparisons: 0 });
    }

    const root = buildTrie(patterns);
    buildFailureLinks(root);

    let node = root;
    let comparisons = 0;

    for (let i = 0; i < upperText.length; i++) {
        const ch = upperText[i];

        while (node !== root && !node.children.has(ch)) {
            node = node.fail!;
            comparisons++;
        }
        comparisons++;

        if (node.children.has(ch)) {
            node = node.children.get(ch)!;
        } else {
            continue;
        }

        if (node.output.length > 0) {
            for (const matched of node.output) {
                const result = results.get(matched);
                if (result) {
                    result.indices.push(i - matched.length + 1);
                }
            }
        }
    }

    const elapsed = performance.now() - startTime;
    for (const [, result] of results) {
        result.executionTime = elapsed;
        result.comparisons = comparisons;
    }

    return results;
}

export interface AhoCorasickMatch {
    keyword: string;
    index: number;
    algorithm: 'aho-corasick';
    executionTime: number;
    comparisons: number;
}

export function ahoCorasickSearchFlat(text: string, patterns: string[]): AhoCorasickMatch[] {
    const startTime = performance.now();
    const upperText = text.toUpperCase();

    const root = buildTrie(patterns);
    buildFailureLinks(root);

    const matches: AhoCorasickMatch[] = [];
    let node = root;
    let comparisons = 0;

    for (let i = 0; i < upperText.length; i++) {
        const ch = upperText[i];

        while (node !== root && !node.children.has(ch)) {
            node = node.fail!;
            comparisons++;
        }
        comparisons++;

        if (node.children.has(ch)) {
            node = node.children.get(ch)!;
        } else {
            continue;
        }

        if (node.output.length > 0) {
            for (const matched of node.output) {
                matches.push({
                    keyword: matched,
                    index: i - matched.length + 1,
                    algorithm: 'aho-corasick',
                    executionTime: performance.now() - startTime,
                    comparisons,
                });
            }
        }
    }

    return matches;
}
