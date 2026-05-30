const TOOLTIP_CLASS = 'judol-tooltip';

let tooltipEl: HTMLElement | null = null;
const handlerMap = new WeakMap<HTMLElement, { enter: (e: Event) => void; leave: () => void }>();

function countKeywordOccurrences(keyword: string): number {
    const highlights = document.querySelectorAll('.judol-highlight');
    let count = 0;
    for (const el of highlights) {
        if ((el as HTMLElement).dataset.judolKeyword === keyword) count++;
    }
    return count;
}

function countAlgorithmOccurrences(algo: string): number {
    const highlights = document.querySelectorAll('.judol-highlight');
    let count = 0;
    for (const el of highlights) {
        if ((el as HTMLElement).dataset.judolAlgorithm === algo) count++;
    }
    return count;
}

function ensureTooltip(): HTMLElement {
    if (tooltipEl) return tooltipEl;

    tooltipEl = document.createElement('div');
    tooltipEl.className = TOOLTIP_CLASS;
    tooltipEl.style.cssText = `
        display: none;
        position: fixed;
        z-index: 2147483647;
        background: #1a1a2e;
        color: #eee;
        padding: 12px 16px;
        border-radius: 8px;
        font-family: 'Segoe UI', Arial, sans-serif;
        font-size: 13px;
        line-height: 1.5;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        border: 1px solid rgba(255,255,255,0.1);
        max-width: 320px;
        pointer-events: none;
    `;
    document.body.appendChild(tooltipEl);
    return tooltipEl;
}

function showTooltip(_e: MouseEvent, el: HTMLElement) {
    const keyword = el.dataset.judolKeyword || '';
    const algorithm = el.dataset.judolAlgorithm || '';
    const time = el.dataset.judolTime || '0';
    const comparisons = el.dataset.judolComparisons || '0';
    const matchText = el.dataset.judolMatchText || el.textContent || '';
    const totalOccurrences = countKeywordOccurrences(keyword);
    const algoOccurrences = countAlgorithmOccurrences(algorithm);

    const tooltip = ensureTooltip();
    tooltip.innerHTML = `
        <div style="font-weight:700;color:#ff6b6b;margin-bottom:6px;font-size:14px;">
            Judol Terdeteksi!
        </div>
        <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:2px 8px 2px 0;color:#aaa;">Keyword</td>
                <td style="padding:2px 0;color:#fff;font-weight:500;">${escapeHtml(keyword)}</td></tr>
            <tr><td style="padding:2px 8px 2px 0;color:#aaa;">Match</td>
                <td style="padding:2px 0;color:#ffd93d;">${escapeHtml(matchText)}</td></tr>
            <tr><td style="padding:2px 8px 2px 0;color:#aaa;">Algorithm</td>
                <td style="padding:2px 0;color:#6bcbff;">${escapeHtml(algorithm)}</td></tr>
            <tr><td style="padding:2px 8px 2px 0;color:#aaa;">Occurrences</td>
                <td style="padding:2px 0;color:#6bcbff;">${totalOccurrences} total / ${algoOccurrences} by algorithm</td></tr>
            <tr><td style="padding:2px 8px 2px 0;color:#aaa;">Time</td>
                <td style="padding:2px 0;color:#6bcbff;">${escapeHtml(time)} ms</td></tr>
            <tr><td style="padding:2px 8px 2px 0;color:#aaa;">Comparisons</td>
                <td style="padding:2px 0;color:#6bcbff;">${escapeHtml(comparisons)}</td></tr>
        </table>
    `;

    const rect = el.getBoundingClientRect();
    let top = rect.bottom + 8;
    let left = rect.left;

    if (top + tooltip.offsetHeight > window.innerHeight) {
        top = rect.top - tooltip.offsetHeight - 8;
    }
    if (left + tooltip.offsetWidth > window.innerWidth) {
        left = window.innerWidth - tooltip.offsetWidth - 8;
    }
    if (left < 8) left = 8;

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
    tooltip.style.display = 'block';
}

function hideTooltip() {
    if (tooltipEl) {
        tooltipEl.style.display = 'none';
    }
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export function attachTooltipEvents(): void {
    const highlights = document.querySelectorAll('.judol-highlight');
    for (const el of highlights) {
        const enter = (e: Event) => showTooltip(e as MouseEvent, el as HTMLElement);
        const leave = () => hideTooltip();
        el.addEventListener('mouseenter', enter);
        el.addEventListener('mouseleave', leave);
        handlerMap.set(el as HTMLElement, { enter, leave });
    }
}

export function detachTooltipEvents(): void {
    const highlights = document.querySelectorAll('.judol-highlight');
    for (const el of highlights) {
        const handlers = handlerMap.get(el as HTMLElement);
        if (handlers) {
            el.removeEventListener('mouseenter', handlers.enter);
            el.removeEventListener('mouseleave', handlers.leave);
            handlerMap.delete(el as HTMLElement);
        }
    }
}
