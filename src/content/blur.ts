const BLUR_CLASS = 'judol-blurred';
let blurEnabled = false;
export function isBlurEnabled(): boolean {
    return blurEnabled;
}

export function setBlurEnabled(enabled: boolean): void {
    blurEnabled = enabled;
    chrome.storage.local.set({ judolBlurEnabled: enabled });
}



export function blurDetectedElements(): void {
    const highlights = document.querySelectorAll('.judol-highlight');
    for (const el of highlights) {
        const parent = el.parentNode as HTMLElement | null;
        if (!parent || parent.classList.contains(BLUR_CLASS)) continue;

        const block = findBlockContainer(el as HTMLElement);
        if (!block || block.classList.contains(BLUR_CLASS)) continue;

        if (block.tagName === 'BODY' || block.tagName === 'HTML' || block.tagName === 'MAIN' ||
            block.closest('form') || block.closest('header') || block.closest('nav') || 
            block.closest('[role="search"]') || block.closest('input') || block.closest('textarea')) {
            continue;
        }

        block.classList.add(BLUR_CLASS);
        block.style.setProperty('filter', 'blur(6px)', 'important');
        block.style.cursor = 'pointer';
        block.style.transition = 'filter 0.3s ease';

        const unblurOnClick = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            unblurBlock(block);
            block.removeEventListener('click', unblurOnClick);
        };
        block.addEventListener('click', unblurOnClick);
    }
}

function unblurBlock(block: HTMLElement) {
    block.classList.remove(BLUR_CLASS);
    block.style.removeProperty('filter');
    block.style.cursor = '';
    block.style.transition = '';
}

export function unblurAll(): void {
    const blurred = document.querySelectorAll(`.${BLUR_CLASS}`);
    for (const el of blurred) {
        unblurBlock(el as HTMLElement);
    }
}

function findBlockContainer(el: HTMLElement): HTMLElement | null {
    let current: HTMLElement | null = el;
    for (let i = 0; i < 6; i++) {
        if (!current) break;
        
        if (current.classList.contains('judol-highlight')) {
            current = current.parentElement;
            continue;
        }

        const tag = current.tagName.toLowerCase();
        if (
            tag === 'p' || tag === 'div' || tag === 'section' ||
            tag === 'article' || tag === 'li' || tag === 'td' ||
            tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4' || tag === 'h5' || tag === 'h6'
        ) {
            const rect = current.getBoundingClientRect();
            if (rect.width > 10 && rect.height >= 10) {
                return current;
            }
        }
        current = current.parentElement;
    }
    return el.parentElement;
}

chrome.storage.local.get('judolBlurEnabled', (result) => {
    blurEnabled = result.judolBlurEnabled === true;
});
