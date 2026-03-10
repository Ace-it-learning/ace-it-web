/**
 * SafeMath — Error-proof KaTeX rendering components.
 * 
 * These wrap react-katex's InlineMath/BlockMath with:
 * 1. Graceful error handling — shows cleaned plaintext instead of "KaTeX parse error"
 * 2. Additional sanitization as a last resort
 * 3. Consistent styling across all pages
 */
import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

/**
 * Strips LaTeX commands from a string to produce readable plaintext fallback.
 * Used when KaTeX parsing fails completely.
 */
const stripLatexToPlainText = (math) => {
    if (!math) return '';
    return math
        // Remove common commands but keep their content
        .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1/$2)')
        .replace(/\\sqrt\{([^}]*)\}/g, '√($1)')
        .replace(/\\text\{([^}]*)\}/g, '$1')
        .replace(/\\mathrm\{([^}]*)\}/g, '$1')
        .replace(/\\textbf\{([^}]*)\}/g, '$1')
        .replace(/\\mathbf\{([^}]*)\}/g, '$1')
        .replace(/\\begin\{[^}]+\}/g, '')
        .replace(/\\end\{[^}]+\}/g, '')
        .replace(/\\left\s*[()[\]|{}]?/g, '')
        .replace(/\\right\s*[()[\]|{}]?/g, '')
        .replace(/\\\\\\\\/g, ' \n ') // In case of 4 slashes
        .replace(/\\\\/g, ' \n ')
        .replace(/\\log/g, 'log')
        .replace(/\\ln/g, 'ln')
        .replace(/\\sin/g, 'sin')
        .replace(/\\cos/g, 'cos')
        .replace(/\\tan/g, 'tan')
        .replace(/\\times/g, '×')
        .replace(/\\div/g, '÷')
        .replace(/\\pm/g, '±')
        .replace(/\\le\b/g, '≤')
        .replace(/\\ge\b/g, '≥')
        .replace(/\\neq/g, '≠')
        .replace(/\\approx/g, '≈')
        .replace(/\\infty/g, '∞')
        .replace(/\\alpha/g, 'α')
        .replace(/\\beta/g, 'β')
        .replace(/\\pi/g, 'π')
        .replace(/\\theta/g, 'θ')
        .replace(/\\Delta/g, 'Δ')
        // Strip remaining backslash commands
        .replace(/\\[a-zA-Z]+\s*/g, '')
        // Clean up braces and formatting
        .replace(/[{}]/g, '')
        .replace(/\s{2,}/g, ' ')
        .replace(/\^(\w)/g, '^$1')
        .replace(/_(\w)/g, '₁') // simplified subscript
        .trim();
};

/**
 * SafeInlineMath — Renders inline math with graceful error fallback.
 * If KaTeX fails, it displays the expression as cleaned plaintext.
 */
export const SafeInlineMath = ({ math, className = '' }) => {
    const safeMathInput = typeof math === 'string' ? math : String(math || '');
    if (!safeMathInput.trim()) return null;

    // Version 1.5.5: THE NEWLINE NEUTRALIZER
    // KaTeX's InlineMath component crashes on literal newlines.
    // We replace them with spaces here as a final safety net.
    const finalMath = safeMathInput.replace(/\n/g, ' ');

    return (
        <span className={`inline-block ${className}`}>
            <InlineMath
                math={finalMath}
                renderError={(error) => (
                    <span
                        className="text-amber-700 font-mono text-sm bg-amber-50 px-1 rounded"
                        title={`Original: ${finalMath}\nError: ${error.message}`}
                    >
                        {stripLatexToPlainText(finalMath)}
                    </span>
                )}
            />
        </span>
    );
};

/**
 * SafeBlockMath — Renders display/block math with graceful error fallback.
 * Uses InlineMath with \displaystyle for consistent rendering.
 */
export const SafeBlockMath = ({ math, className = '' }) => {
    const safeMathInput = typeof math === 'string' ? math : String(math || '');
    if (!safeMathInput.trim()) return null;

    // Version 1.5.5: THE NEWLINE NEUTRALIZER
    const finalMath = safeMathInput.replace(/\n/g, ' ');

    return (
        <div className={`my-2 w-full overflow-x-auto text-left ${className}`}>
            <InlineMath
                math={`\\displaystyle ${finalMath}`}
                renderError={(error) => (
                    <span
                        className="text-amber-700 font-mono text-sm bg-amber-50 px-1 rounded"
                        title={`Original: ${finalMath}\nError: ${error.message}`}
                    >
                        {stripLatexToPlainText(finalMath)}
                    </span>
                )}
            />
        </div>
    );
};

export default { SafeInlineMath, SafeBlockMath };
