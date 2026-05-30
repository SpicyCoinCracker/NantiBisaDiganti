import { loadKeywordsFromFile } from './keywordLoader';

let ocrEnabled = false;
let ocrKeywords: string[] | null = null;

export function isOcrEnabled(): boolean {
    return ocrEnabled;
}

export function setOcrEnabled(enabled: boolean): void {
    ocrEnabled = enabled;
    chrome.storage.local.set({ judolOcrEnabled: enabled });
}

export async function scanImages(): Promise<void> {
    if (!ocrEnabled) return;

    let Tesseract: any;
    try {
        Tesseract = await import('tesseract.js');
    } catch {
        console.warn('Tesseract.js not available, skipping OCR');
        return;
    }

    if (!ocrKeywords) {
        ocrKeywords = await loadKeywordsFromFile();
    }
    if (!ocrKeywords || ocrKeywords.length === 0) return;

    const images = document.querySelectorAll('img');
    for (const img of images) {
        if (img.dataset.judolScanned === 'true') continue;
        if (!img.src) continue;
        if (img.width < 50 || img.height < 50) continue;
        if (img.complete === false) continue;

        img.dataset.judolScanned = 'true';

        try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) continue;

            const clone = new Image();
            clone.crossOrigin = 'anonymous';
            
            await new Promise((resolve, reject) => {
                clone.onload = resolve;
                clone.onerror = reject;
                clone.src = img.src;
            });

            ctx.drawImage(clone, 0, 0);
            const dataUrl = canvas.toDataURL('image/png');

            const result: any = await Tesseract.recognize(dataUrl, 'eng', {
                logger: () => {},
            });

            const detectedText: string = (result?.data?.text || '').toUpperCase();
            let detected = false;

            for (const keyword of ocrKeywords) {
                const upperKw = keyword.toUpperCase();
                if (containsManual(detectedText, upperKw)) {
                    detected = true;
                    break;
                }
            }

            if (!detected) {
                const judolPattern = /[A-Z]{3,}\d{2,3}|\d{2,3}[A-Z]{3,}/;
                if (judolPattern.test(detectedText)) {
                    detected = true;
                }
            }

            if (detected) {
                img.style.filter = 'blur(8px)';
                img.dataset.judolBlocked = 'true';
            }
        } catch (e) {
            console.warn('OCR failed for image:', e);
        }
    }
}

function containsManual(text: string, pattern: string): boolean {
    if (pattern.length === 0) return false;
    for (let i = 0; i <= text.length - pattern.length; i++) {
        let match = true;
        for (let j = 0; j < pattern.length; j++) {
            if (text[i + j] !== pattern[j]) { match = false; break; }
        }
        if (match) return true;
    }
    return false;
}

chrome.storage.local.get('judolOcrEnabled', (result) => {
    ocrEnabled = result.judolOcrEnabled === true;
});
