import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; // CRITICAL: This imports the math styling!

/**
 * A wrapper component that takes AI-generated markdown containing LaTeX 
 * and renders it beautifully for the students.
 */
const MathRenderer = ({ content }) => {
  return (
    <div className="prose prose-blue max-w-none text-gray-800 leading-relaxed">
      <ReactMarkdown
        children={content}
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Custom styling for tags to match Ace it! design
          strong: ({node, ...props}) => <strong className="font-bold text-blue-700" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4" {...props} />,
          p: ({node, ...props}) => <p className="mb-4" {...props} />
        }}
      />
    </div>
  );
};

export default MathRenderer;
