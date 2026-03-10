import React, { useState } from 'react';
import { Play, Pause, FileText, Headphones, Mail, Clock, Image, Globe, File } from 'lucide-react';

const IntegratedListeningBoard = ({
    script,
    dataFile,
    questions,
    onAnswer,
    answers = {},
    isGenerating = false,
    onSubmit
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeDoc, setActiveDoc] = useState(0);

    // Normalize dataFile to array format (backward compatibility)
    const documents = Array.isArray(dataFile)
        ? dataFile
        : [{ id: 'legacy', title: 'Data File', type: 'document', content: dataFile }];

    const getDocIcon = (type) => {
        switch (type) {
            case 'email': return Mail;
            case 'minutes': return Clock;
            case 'poster': return Image;
            case 'webpage': return Globe;
            default: return FileText;
        }
    };

    const handleStart = () => {
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice =>
            voice.lang.includes('en-GB') && voice.name.includes('Female')
        ) || voices.find(voice =>
            voice.lang.includes('en-GB')
        ) || voices.find(voice =>
            voice.lang.includes('en-US') && voice.name.includes('Female')
        ) || voices.find(voice =>
            voice.lang.includes('en')
        );

        const utterance = new SpeechSynthesisUtterance(script);
        if (preferredVoice) utterance.voice = preferredVoice;
        utterance.rate = 1.0;
        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
    };

    const handlePlayPause = () => {
        if (window.speechSynthesis.speaking) {
            if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
                setIsPlaying(true);
            } else {
                window.speechSynthesis.pause();
                setIsPlaying(false);
            }
        } else {
            handleStart();
        }
    };

    return (
        <div className="flex flex-col h-[750px] max-h-[85vh] bg-gray-50 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            {/* Audio Control Bar */}
            <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handlePlayPause}
                        className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-sm"
                        title={isPlaying ? "Pause" : "Play Audio"}
                    >
                        {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-1" />}
                    </button>
                    <div>
                        <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                            <Headphones className="w-4 h-4 text-indigo-500" />
                            Audio Recording
                        </h3>
                        <p className="text-xs text-gray-500">{isPlaying ? "Playing..." : "Paused"}</p>
                    </div>
                </div>
                <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-wide">
                    Part B: Integrated Skills
                </div>
            </div>

            {/* Split View Content */}
            <div className="flex-1 overflow-hidden relative">
                <div className="absolute inset-0 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200">

                    {/* LEFT: Data File with Document Tabs */}
                    <div className="w-full md:w-1/2 flex flex-col h-1/2 md:h-full bg-white">
                        <div className="p-3 bg-gray-100 border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-600" />
                                <span className="text-xs font-bold text-gray-700 uppercase">Data File</span>
                            </div>
                            {documents.length > 1 && (
                                <span className="text-xs text-gray-500">{documents.length} documents</span>
                            )}
                        </div>

                        {/* Document Tabs */}
                        {documents.length > 1 && (
                            <div className="flex gap-1 p-2 bg-gray-50 border-b border-gray-200 overflow-x-auto">
                                {documents.map((doc, idx) => {
                                    const Icon = getDocIcon(doc.type);
                                    return (
                                        <button
                                            key={doc.id}
                                            onClick={() => setActiveDoc(idx)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeDoc === idx
                                                ? 'bg-indigo-600 text-white shadow-sm'
                                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                                }`}
                                        >
                                            <Icon size={12} />
                                            {doc.title}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Document Content */}
                        <div className="flex-1 overflow-y-auto p-6 prose prose-sm max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: documents[activeDoc]?.content || '' }} />
                        </div>
                    </div>

                    {/* RIGHT: Question Book */}
                    <div className="w-full md:w-1/2 flex flex-col h-1/2 md:h-full bg-gray-50">
                        <div className="p-3 bg-gray-100 border-b border-gray-200 flex items-center gap-2 sticky top-0 z-10">
                            <span className="text-xs font-bold text-gray-700 uppercase">Question Book</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {(questions || []).map((q, i) => (
                                <div key={q.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                    <p className="text-gray-900 font-medium text-sm mb-3">
                                        <span className="inline-block bg-gray-100 text-gray-600 rounded px-2 py-0.5 text-xs mr-2 font-bold">{i + 1}</span>
                                        {q.text}
                                    </p>
                                    {q.type === 'mc' ? (
                                        <div className="space-y-2">
                                            {q.options?.map((opt, idx) => (
                                                <label key={idx} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition-all">
                                                    <input
                                                        type="radio"
                                                        name={`q-${q.id}`}
                                                        value={opt}
                                                        checked={answers[q.id] === opt}
                                                        onChange={(e) => onAnswer(q.id, e.target.value)}
                                                        className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                                    />
                                                    <span className="text-sm text-gray-700">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <textarea
                                            disabled={isGenerating}
                                            className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors disabled:opacity-50 min-h-[80px] resize-y"
                                            placeholder="Write your answer here..."
                                            value={answers[q.id] || ''}
                                            onChange={(e) => onAnswer(q.id, e.target.value)}
                                        />
                                    )}
                                </div>
                            ))}

                            <div className="pt-4 pb-8">
                                <button
                                    onClick={onSubmit}
                                    disabled={isGenerating}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-wide"
                                >
                                    {isGenerating ? "Processing Analysis..." : "Submit Answers"}
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default IntegratedListeningBoard;
