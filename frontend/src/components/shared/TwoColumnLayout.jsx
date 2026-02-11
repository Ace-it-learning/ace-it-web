import React from 'react';

/**
 * Two-Column Layout for Diagnostic Tests
 * Left: Passage/Reference Material
 * Right: Questions
 */
const TwoColumnLayout = ({
    leftPanel,
    rightPanel,
    leftTitle = 'Passage',
    sticky = false
}) => {
    return (
        <div className="max-w-[1440px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
            {/* Left Panel - Passage/Reference */}
            <div className={`bg-gray-50 p-8 rounded-xl border-2 border-gray-200 ${sticky
                    ? 'lg:sticky lg:top-24 lg:self-start max-h-[calc(100vh-120px)] overflow-y-auto'
                    : 'h-fit'
                }`}>
                <h3 className="text-gray-600 text-sm font-bold uppercase tracking-wider mb-4">
                    {leftTitle}
                </h3>
                <div className="text-gray-800 leading-relaxed text-base">
                    {leftPanel}
                </div>
            </div>

            {/* Right Panel - Questions */}
            <div className="space-y-4">
                {rightPanel}
            </div>
        </div>
    );
};

export default TwoColumnLayout;
