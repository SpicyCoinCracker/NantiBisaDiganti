import { scanPage, clearHighlights } from './context';
import { blurDetectedElements, unblurAll, setBlurEnabled as updateBlurState } from './blur';
import { setOcrEnabled as updateOcrState, scanImages } from './ocr';

let scanTimeout: ReturnType<typeof setTimeout> | null = null;

function init() {
    chrome.storage.local.get(
        ['judolBlurEnabled', 'judolOcrEnabled', 'judolAutoScan'],
        () => {
            scheduleScan(500);
        }
    );
}

function scheduleScan(delay: number = 300) {
    if (scanTimeout) clearTimeout(scanTimeout);
    scanTimeout = setTimeout(() => {
        performScan();
    }, delay);
}

async function performScan() {
    const stats = await scanPage();

    chrome.storage.local.get(['judolBlurEnabled', 'judolOcrEnabled'], (result) => {
        if (result.judolBlurEnabled) blurDetectedElements();
        if (result.judolOcrEnabled) scanImages();
    });

    chrome.runtime.sendMessage({ type: 'JUDOL_SCAN_COMPLETE', stats });
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    switch (msg.type) {
        case 'JUDOL_SCAN':
            performScan().then(() => sendResponse({ success: true }));
            return true;

        case 'JUDOL_CLEAR':
            clearHighlights();
            unblurAll();
            sendResponse({ success: true });
            return true;

        case 'JUDOL_TOGGLE_BLUR':
            updateBlurState(msg.enabled);
            if (msg.enabled) {
                blurDetectedElements();
            } else {
                unblurAll();
            }
            sendResponse({ success: true });
            return true;

        case 'JUDOL_TOGGLE_OCR':
            updateOcrState(msg.enabled);
            if (msg.enabled) {
                scanImages();
            }
            sendResponse({ success: true });
            return true;

        case 'JUDOL_GET_STATS': {
            chrome.storage.local.get('judolStats', (result) => {
                sendResponse({ stats: result.judolStats || null });
            });
            return true;
        }

        case 'JUDOL_PING':
            sendResponse({ pong: true });
            return true;
    }
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
