/**
 * Shared tokenizer for karaoke asset generation (mirrors frontend speakingPassageTokenizer.js).
 */

function tokenizePassage(text) {
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

function countPassageWords(text) {
    return tokenizePassage(text).filter((t) => !t.isWhitespace).length;
}

function getPassageWords(text) {
    return tokenizePassage(text).filter((t) => !t.isWhitespace).map((t) => t.text);
}

module.exports = { tokenizePassage, countPassageWords, getPassageWords };
