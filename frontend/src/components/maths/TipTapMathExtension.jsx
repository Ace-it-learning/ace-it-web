import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useEffect, useRef } from 'react';

const MathComponent = ({ node, updateAttributes, selected }) => {
    const mfRef = useRef(null);
    const hasFocused = useRef(false);

    useEffect(() => {
        const mf = mfRef.current;
        if (!mf) return;

        // Sync initial value using the DOM API
        if (mf.value !== node.attrs.latex) {
            mf.value = node.attrs.latex || '';
        }

        // Improved Autofocus Logic: 
        // Focus if it's the first render, empty, and currently selected by TipTap
        if (!node.attrs.latex && selected && !hasFocused.current) {
            hasFocused.current = true;
            setTimeout(() => {
                if (mfRef.current) {
                    mfRef.current.focus();
                    // Select all to ensure the virtual keyboard triggers and 
                    // the user can see the insertion point clearly
                    if (typeof mfRef.current.executeCommand === 'function') {
                        mfRef.current.executeCommand('selectAll');
                    }
                }
            }, 100); // Slightly longer delay for stability
        }

        const handleInput = (e) => {
            updateAttributes({ latex: e.target.value });
        };
        
        const handleKeyDown = (e) => {
            // Stop propagation to prevent TipTap from capturing math-related keystrokes
            e.stopPropagation();
        };

        mf.addEventListener('input', handleInput);
        mf.addEventListener('keydown', handleKeyDown);

        return () => {
            if (mf) {
                mf.removeEventListener('input', handleInput);
                mf.removeEventListener('keydown', handleKeyDown);
            }
        };
    }, []);

    useEffect(() => {
        // Sync if node attributes change externally (e.g. from cheat button)
        if (mfRef.current && mfRef.current.value !== node.attrs.latex) {
            mfRef.current.value = node.attrs.latex || '';
        }
    }, [node.attrs.latex]);

    return (
        <NodeViewWrapper className="inline-block align-middle px-1" contentEditable={false}>
            <math-field
                ref={mfRef}
                style={{
                    display: 'inline-block',
                    minWidth: '2.5rem',
                    minHeight: '1.8rem',
                    verticalAlign: 'middle',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '2px 8px',
                    fontSize: '1.25rem',
                    background: selected ? '#f5f3ff' : '#ffffff',
                    borderBottom: selected ? '2px solid #8b5cf6' : '1px solid #e2e8f0',
                    color: '#1e293b',
                    cursor: 'text'
                }}
            />
        </NodeViewWrapper>
    );
};

export const MathNode = Node.create({
    name: 'math',
    group: 'inline',
    inline: true,
    atom: true,

    addAttributes() {
        return {
            latex: {
                default: '',
            },
        };
    },

    parseHTML() {
        return [{ tag: 'span[data-type="math-node"]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'math-node' })];
    },

    addNodeView() {
        return ReactNodeViewRenderer(MathComponent);
    },

    addCommands() {
        return {
            insertMath: (latex = '') => ({ commands }) => {
                return commands.insertContent({
                    type: this.name,
                    attrs: { latex },
                });
            },
        };
    },
});
