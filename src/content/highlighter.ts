export interface HighlightInfo {
    keyword: string;
    algorithm: string;
    executionTime: number;
    comparisons?: number;
    matchText?: string;
}

const HIGHLIGHT_CLASS = 'judol-highlight';
let highlightIdCounter = 0;

export function highlightMatch(
    textNode: Text,
    startOffset: number,
    endOffset: number,
    info: HighlightInfo
): HTMLElement | null {
    const parent = textNode.parentNode;
    if (!parent) return null;

    const fullText = textNode.textContent || '';

    const before = fullText.substring(0, startOffset);
    const match = fullText.substring(startOffset, endOffset);
    const after = fullText.substring(endOffset);

    const span = document.createElement('span');
    span.className = HIGHLIGHT_CLASS;
    span.dataset.judolKeyword = info.keyword;
    span.dataset.judolAlgorithm = info.algorithm;
    span.dataset.judolTime = String(info.executionTime);
    span.dataset.judolComparisons = String(info.comparisons ?? 0);
    span.dataset.judolMatchText = info.matchText || match;
    span.dataset.judolId = String(++highlightIdCounter);
    span.textContent = match;

    const fragment = document.createDocumentFragment();
    if (before) fragment.appendChild(document.createTextNode(before));
    fragment.appendChild(span);
    if (after) fragment.appendChild(document.createTextNode(after));

    parent.replaceChild(fragment, textNode);

    return span;
}

export function removeHighlights(): void {
    const highlights = document.querySelectorAll(`.${HIGHLIGHT_CLASS}`);
    for (const el of highlights) {
        const parent = el.parentNode;
        if (!parent) continue;
        const text = document.createTextNode(el.textContent || '');
        parent.replaceChild(text, el);
        parent.normalize();
    }
}

export function getHighlightCount(): number {
    return document.querySelectorAll(`.${HIGHLIGHT_CLASS}`).length;
}
