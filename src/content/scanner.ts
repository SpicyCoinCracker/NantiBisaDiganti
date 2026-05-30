export interface TextSegment {
    text: string;
    node: Text;
    startOffset: number;
}

export function scanDOM(root: Node = document.body): TextSegment[] {
    const segments: TextSegment[] = [];
    const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode(node) {
                const parent = (node as Text).parentElement;
                if (!parent) return NodeFilter.FILTER_REJECT;
                const tag = parent.tagName.toLowerCase();
                if (
                    tag === 'script' || tag === 'style' || tag === 'noscript' ||
                    tag === 'iframe' || tag === 'svg' || tag === 'canvas' ||
                    tag === 'textarea' || tag === 'option'
                ) {
                    return NodeFilter.FILTER_REJECT;
                }
                const text = (node as Text).textContent || '';
                if (text.trim().length === 0) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            },
        }
    );

    let node: Text | null;
    while ((node = walker.nextNode() as Text | null) !== null) {
        const text = node.textContent || '';
        if (text.trim().length > 0) {
            segments.push({ text, node, startOffset: 0 });
        }
    }

    return segments;
}
