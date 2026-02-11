import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, X, Loader2, Eye } from 'lucide-react';
import DecoderCard from '../tutor/DecoderCard';
import ScaffoldToolbar from '../reading/ScaffoldToolbar';
import VocabSpotlight from '../reading/VocabSpotlight';
import ParagraphTag from '../reading/ParagraphTag';
import LogicConnector from '../reading/LogicConnector';

const ReadingPanel = ({ resources, onTextSelect }) => {
    const { user } = useAuth();

    // Scaffold State
    const [scaffoldSettings, setScaffoldSettings] = useState(() => {
        const saved = localStorage.getItem('readingScaffoldSettings');
        return saved ? JSON.parse(saved) : { vocab: false, structure: false, logic: false };
    });
    const [scaffoldData, setScaffoldData] = useState(null);
    const [isLoadingScaffold, setIsLoadingScaffold] = useState(false);

    // Decoder State (existing)
    const [selectedText, setSelectedText] = useState('');
    const [selectionPos, setSelectionPos] = useState({ x: 0, y: 0 });
    const [showDecodeBtn, setShowDecodeBtn] = useState(false);
    const [isDecoding, setIsDecoding] = useState(false);
    const [decodeResult, setDecodeResult] = useState(null);
    const containerRef = useRef(null);

    // Save scaffold settings to localStorage
    useEffect(() => {
        localStorage.setItem('readingScaffoldSettings', JSON.stringify(scaffoldSettings));
    }, [scaffoldSettings]);

    // Reset settings when resources (quest) change
    useEffect(() => {
        if (resources && Object.keys(resources).length > 0) {
            setScaffoldSettings({ vocab: false, structure: false, logic: false });
            setScaffoldData(null);
        }
    }, [resources]);

    // Fetch scaffold data when any toggle is enabled
    useEffect(() => {
        const anyEnabled = scaffoldSettings.vocab || scaffoldSettings.structure || scaffoldSettings.logic;

        if (anyEnabled && resources && !scaffoldData && !isLoadingScaffold) {
            fetchScaffoldData();
        }
    }, [scaffoldSettings, resources]);

    const fetchScaffoldData = async () => {
        if (!resources) return;

        setIsLoadingScaffold(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

            // Combine all passage text
            const allParagraphs = [];
            Object.values(resources).forEach(resource => {
                if (resource.content) {
                    Object.values(resource.content).forEach(p => allParagraphs.push(p));
                }
            });

            const passage = allParagraphs.join('\n\n');

            const res = await fetch(`${API_URL}/api/reading/scaffold`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    passage,
                    paragraphs: allParagraphs,
                    level: 3
                })
            });

            const data = await res.json();
            console.log('[ReadingPanel] Scaffold data:', data);
            setScaffoldData(data);
        } catch (err) {
            console.error('[ReadingPanel] Failed to fetch scaffold data:', err);
        } finally {
            setIsLoadingScaffold(false);
        }
    };

    const handleTextSelection = (e) => {
        if (onTextSelect) onTextSelect(e);

        const selection = window.getSelection();
        const text = selection.toString().trim();

        // Ensure selection is within this panel
        if (text.length > 5 && containerRef.current && containerRef.current.contains(selection.anchorNode)) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            setSelectionPos({
                x: rect.left + (rect.width / 2),
                y: rect.top - 10
            });
            setSelectedText(text);
            setShowDecodeBtn(true);
        } else {
            setShowDecodeBtn(false);
        }
    };

    const handleDecode = async () => {
        if (!selectedText) return;
        setIsDecoding(true);
        setShowDecodeBtn(false);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const token = await user.getIdToken();
            const res = await fetch(`${API_URL}/api/tutor/reading/decode`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    uid: user.uid,
                    text: selectedText
                })
            });
            const data = await res.json();
            setDecodeResult(data);
        } catch (err) {
            console.error("Decoding failed:", err);
            alert("Failed to decode text. Please try again.");
        } finally {
            setIsDecoding(false);
        }
    };

    // Get paragraph tag by index
    const getTagForParagraph = (globalIndex) => {
        if (!scaffoldData?.tags) return null;
        return scaffoldData.tags.find(t => t.index === globalIndex);
    };

    // Get connector between paragraphs
    const getConnector = (fromIndex) => {
        if (!scaffoldData?.connectors) return null;
        return scaffoldData.connectors.find(c => c.from === fromIndex);
    };

    if (!resources || Object.values(resources).length === 0) {
        return (
            <div className="text-center py-20 text-gray-400 italic">
                Select a section to view reading materials.
            </div>
        );
    }

    // Build flat list of paragraphs for global indexing
    let globalParagraphIndex = 0;

    return (
        <div ref={containerRef} className="max-w-prose mx-auto space-y-4 relative">
            {/* SCAFFOLD TOOLBAR */}
            <ScaffoldToolbar
                settings={scaffoldSettings}
                onChange={setScaffoldSettings}
            />

            {/* Loading indicator */}
            {isLoadingScaffold && (
                <div className="flex items-center justify-center gap-2 p-4 bg-slate-50 rounded-lg">
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                    <span className="text-sm text-slate-500">Loading reading scaffolds...</span>
                </div>
            )}

            {/* PASSAGE CONTENT */}
            {Object.entries(resources)
                .sort(([keyA], [keyB]) => keyA.localeCompare(keyB, undefined, { numeric: true }))
                .map(([key, text]) => (
                    <article
                        key={key}
                        id={`passage-${key}`}
                        className="prose dark:prose-invert max-w-none bg-white p-8 rounded-2xl shadow-sm border border-gray-100 selection:bg-emerald-100 selection:text-emerald-900"
                        onMouseUp={handleTextSelection}
                    >
                        <div className="mb-6 border-b pb-4">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{text.title}</h3>
                            {text.subheading && <p className="text-gray-500 italic text-lg">{text.subheading}</p>}
                        </div>

                        <div className="text-gray-800 leading-relaxed space-y-4 font-serif text-lg">
                            {Object.entries(text.content).map(([pKey, pVal], pIdx) => {
                                const currentGlobalIndex = globalParagraphIndex++;
                                const tag = getTagForParagraph(currentGlobalIndex);
                                const connector = getConnector(currentGlobalIndex);

                                return (
                                    <div key={pKey}>
                                        {/* Paragraph with optional tag */}
                                        <div className="flex gap-4">
                                            {/* Left margin: Paragraph Tag */}
                                            {scaffoldSettings.structure && (
                                                <div className="flex-shrink-0 w-28">
                                                    {tag && (
                                                        <ParagraphTag
                                                            tag={tag.tag}
                                                            explanation={tag.explanation}
                                                        />
                                                    )}
                                                </div>
                                            )}

                                            {/* Paragraph text with vocab highlights */}
                                            <p id={`p-${key}-${pKey}`} className="flex-1">
                                                {scaffoldSettings.vocab && scaffoldData?.vocab ? (
                                                    <VocabSpotlight
                                                        text={pVal}
                                                        vocabData={scaffoldData.vocab}
                                                        onWordClick={(word) => console.log('Word clicked:', word)}
                                                    />
                                                ) : (
                                                    pVal
                                                )}
                                            </p>
                                        </div>

                                        {/* Logic connector between paragraphs */}
                                        {scaffoldSettings.logic && connector && (
                                            <div className="ml-28 my-2">
                                                <LogicConnector
                                                    type={connector.type}
                                                    signalWord={connector.signal_word}
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </article>
                ))}

            {/* FLOATING DECODE BUTTON */}
            {showDecodeBtn && (
                <button
                    onClick={handleDecode}
                    style={{
                        position: 'fixed',
                        left: selectionPos.x,
                        top: selectionPos.y,
                        transform: 'translate(-50%, -100%)',
                    }}
                    className="z-50 bg-emerald-900 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 text-sm font-bold animate-in zoom-in slide-in-from-bottom-2 hover:scale-105 transition-transform border border-emerald-700"
                >
                    <Eye className="w-4 h-4 text-emerald-300" />
                    Decode with AI
                </button>
            )}

            {/* DECODER MODAL */}
            {(isDecoding || decodeResult) && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95">

                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 flex justify-between items-center text-white">
                            <div className="flex items-center gap-2">
                                <Eye className="w-5 h-5 text-emerald-200" />
                                <h3 className="font-bold text-lg">Reading Decoder</h3>
                            </div>
                            <button
                                onClick={() => {
                                    setDecodeResult(null);
                                    setIsDecoding(false);
                                }}
                                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 bg-gray-50 max-h-[70vh] overflow-y-auto">
                            {isDecoding ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                    <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
                                    <p className="text-gray-500 font-medium animate-pulse">Analyzing structure & logic...</p>
                                </div>
                            ) : (
                                <DecoderCard data={decodeResult} />
                            )}
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default ReadingPanel;
