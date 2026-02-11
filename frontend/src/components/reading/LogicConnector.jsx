import React from 'react';

/**
 * LogicConnector - SVG arrow showing logical relationship between paragraphs
 * Types: LEADS_TO, HOWEVER, FOR_EXAMPLE, IN_ADDITION, THEREFORE, ELABORATES
 */
const CONNECTOR_CONFIG = {
    LEADS_TO: {
        label: 'Leads to',
        symbol: '→',
        color: '#10B981', // emerald-500
        description: 'Cause-effect relationship'
    },
    HOWEVER: {
        label: 'However',
        symbol: '⟲',
        color: '#F97316', // orange-500
        description: 'Contrast or opposing view'
    },
    FOR_EXAMPLE: {
        label: 'For example',
        symbol: '•',
        color: '#3B82F6', // blue-500
        description: 'Illustration or example'
    },
    IN_ADDITION: {
        label: 'In addition',
        symbol: '+',
        color: '#8B5CF6', // violet-500
        description: 'Adds more support'
    },
    THEREFORE: {
        label: 'Therefore',
        symbol: '∴',
        color: '#EC4899', // pink-500
        description: 'Conclusion drawn'
    },
    ELABORATES: {
        label: 'Elaborates',
        symbol: '↳',
        color: '#6B7280', // gray-500
        description: 'Explains in more detail'
    }
};

const LogicConnector = ({ type, signalWord }) => {
    const config = CONNECTOR_CONFIG[type] || CONNECTOR_CONFIG.LEADS_TO;

    return (
        <div className="flex items-center gap-2 py-2 px-3 my-1">
            {/* Vertical line with arrow */}
            <div className="flex flex-col items-center">
                <div
                    className="w-0.5 h-4"
                    style={{ backgroundColor: config.color }}
                />
                <div
                    className="w-3 h-3 flex items-center justify-center text-white text-xs font-bold rounded-full"
                    style={{ backgroundColor: config.color }}
                >
                    {config.symbol}
                </div>
                <div
                    className="w-0.5 h-4"
                    style={{ backgroundColor: config.color }}
                />
            </div>

            {/* Label */}
            <div
                className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                style={{
                    backgroundColor: `${config.color}20`,
                    color: config.color
                }}
            >
                {signalWord || config.label}
            </div>
        </div>
    );
};

export default LogicConnector;
export { CONNECTOR_CONFIG };
