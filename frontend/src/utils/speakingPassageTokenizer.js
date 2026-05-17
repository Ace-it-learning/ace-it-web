/**
 * Shared tokenizer for pronunciation quest passages and karaoke timings.
 * Must stay in sync with DeliveryScaffoldPassage word indices.
 */

export function tokenizePassage(text) {
    if (!text || typeof text !== 'string') return [];
    const rawTokens = text.split(/(\s+)/).filter((t) => t !== '');
    let wordCounter = 0;

    return rawTokens.map((token, idx) => {
        const isWhitespace = /^\s+$/.test(token);
        const index = isWhitespace ? -1 : wordCounter++;
        return {
            text: token,
            index,
            isWhitespace,
            id: `tk-${idx}`,
        };
    });
}

export function countPassageWords(text) {
    return tokenizePassage(text).filter((t) => !t.isWhitespace).length;
}

export function getPassageWords(text) {
    return tokenizePassage(text).filter((t) => !t.isWhitespace).map((t) => t.text);
}
