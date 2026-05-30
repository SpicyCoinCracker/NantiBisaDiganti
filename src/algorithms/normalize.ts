const HOMOGLYPH_MAP: Map<string, string> = new Map([
    ['α', 'a'], ['а', 'a'], ['à', 'a'], ['á', 'a'], ['â', 'a'],
    ['ã', 'a'], ['ä', 'a'], ['å', 'a'], ['æ', 'a'],
    ['е', 'e'], ['è', 'e'], ['é', 'e'], ['ê', 'e'], ['ë', 'e'],
    ['і', 'i'], ['ì', 'i'], ['í', 'i'], ['î', 'i'], ['ï', 'i'],
    ['ο', 'o'], ['о', 'o'], ['ò', 'o'], ['ó', 'o'], ['ô', 'o'],
    ['õ', 'o'], ['ö', 'o'], ['ø', 'o'],
    ['ս', 'u'], ['ù', 'u'], ['ú', 'u'], ['û', 'u'], ['ü', 'u'],
    ['с', 'c'], ['ç', 'c'],
    ['в', 'b'],
    ['р', 'p'], ['н', 'h'], ['х', 'x'], ['к', 'k'], ['м', 'm'],
    ['ν', 'v'], ['η', 'n'],
    ['0', '0'], ['1', '1'], ['2', '2'], ['3', '3'],
    ['4', '4'], ['5', '5'], ['6', '6'], ['7', '7'],
    ['8', '8'], ['9', '9'],
]);

export function normalizeText(text: string): string {
    let result = '';
    for (const ch of text) {
        const mapped = HOMOGLYPH_MAP.get(ch.toLowerCase());
        result += mapped ?? ch;
    }
    return result;
}

export const HOMOGLYPH_KEYS = Array.from(HOMOGLYPH_MAP.keys());
