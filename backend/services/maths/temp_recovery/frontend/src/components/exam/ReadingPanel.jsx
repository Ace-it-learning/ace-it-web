import React from 'react';

const ReadingPanel = ({ resources, onTextSelect }) => {
    if (!resources || Object.values(resources).length === 0) {
        return (
            <div className="text-center py-20 text-gray-400 italic">
                Select a section to view reading materials.
            </div>
        );
    }

    return (
        <div className="max-w-prose mx-auto space-y-8">
            {Object.entries(resources)
                .sort(([keyA], [keyB]) => keyA.localeCompare(keyB, undefined, { numeric: true }))
                .map(([key, text]) => (
                    <article
                        key={key}
                        id={`passage-${key}`}
                        className="prose dark:prose-invert max-w-none bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
                        onMouseUp={onTextSelect} // For future notebook feature
                    >
                        <div className="mb-6 border-b pb-4">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{text.title}</h3>
                            {text.subheading && <p className="text-gray-500 italic text-lg">{text.subheading}</p>}
                        </div>
                        <div className="text-gray-800 leading-relaxed space-y-4 font-serif text-lg">
                            {Object.entries(text.content).map(([pKey, pVal]) => (
                                <p key={pKey} id={`p-${key}-${pKey}`}>{pVal}</p>
                            ))}
                        </div>
                    </article>
                ))}
        </div>
    );
};

export default ReadingPanel;
