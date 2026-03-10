import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Clock, ArrowRight, Check } from 'lucide-react';

const DiagnosticSpeaking = ({ assets, onSubmit, isSubmitting }) => {
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [phase, setPhase] = useState('select'); // select, prep, recording, done
    const [timeLeft, setTimeLeft] = useState(120); // 2 minutes prep
    const [recordingTime, setRecordingTime] = useState(0);
    const [transcript, setTranscript] = useState('');
    const [liveTranscript, setLiveTranscript] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recognitionRef = useRef(null);
    const streamRef = useRef(null);

    const handleTopicSelect = (topic) => {
        setSelectedTopic(topic);
        setPhase('prep');
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 48000
                }
            });
            streamRef.current = stream;

            // 1. Setup MediaRecorder for backend submission
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            audioChunksRef.current = [];
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                console.log('[Speaking] MediaRecorder stopped');
            };

            // 2. Setup Web Speech API for LIVE feedback
            if ('webkitSpeechRecognition' in window) {
                const recognition = new window.webkitSpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'en-US';

                recognition.onresult = (event) => {
                    let interimTranscript = '';
                    let finalTranscript = '';

                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript;
                        } else {
                            interimTranscript += event.results[i][0].transcript;
                        }
                    }

                    if (finalTranscript) {
                        setTranscript(prev => prev + ' ' + finalTranscript);
                    }
                    setLiveTranscript(interimTranscript);
                };

                recognition.onerror = (event) => {
                    console.error('[Speaking] Recognition error:', event.error);
                };

                recognitionRef.current = recognition;
                recognition.start();
            }

            mediaRecorder.start();
            mediaRecorderRef.current = mediaRecorder;
            setPhase('recording');
        } catch (err) {
            console.error('[Speaking] Recording failed:', err);
            alert("Could not access microphone. Please check permissions.");
        }
    };

    // Timer Logic
    useEffect(() => {
        let interval;
        if (phase === 'prep' && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
        } else if (phase === 'prep' && timeLeft === 0) {
            startRecording();
        } else if (phase === 'recording') {
            interval = setInterval(() => setRecordingTime(t => t + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [phase, timeLeft, recordingTime]);

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        setPhase('done');
    };

    const handleSubmit = async () => {
        setIsProcessing(true);
        try {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

            // Convert to base64
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = () => {
                const base64Audio = reader.result.split(',')[1];

                onSubmit({
                    topic: selectedTopic,
                    transcript: transcript.trim() || liveTranscript.trim() || `User spoke about "${selectedTopic}" for ${recordingTime} seconds.`,
                    duration: recordingTime,
                    audio: base64Audio,
                    audioType: 'audio/webm'
                });
            };
        } catch (err) {
            console.error("Submission failed:", err);
            setIsProcessing(false);
        }
    };

    const formatTime = (s) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!assets) return <div>Loading Speaking...</div>;

    // Topic Selection Phase
    if (phase === 'select') {
        return (
            <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Part 4: Speaking</h2>
                <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 shadow-sm">
                    <h3 className="text-gray-700 text-lg font-bold mb-4">Choose Your Topic</h3>
                    <p className="text-gray-600 mb-6">Select one topic to speak about for 1-2 minutes for a realistic grade:</p>
                    <div className="space-y-3">
                        {assets.topics.map((topic, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleTopicSelect(topic)}
                                className="w-full text-left p-4 bg-gray-50 hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-400 rounded-xl transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-100 group-hover:bg-blue-500 rounded-full flex items-center justify-center text-blue-600 group-hover:text-white font-bold transition-colors">
                                        {idx + 1}
                                    </div>
                                    <span className="text-gray-800 font-medium">{topic}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Prep, Recording, Done phases
    return (
        <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Part 4: Speaking</h2>
                <div className={`px-4 py-1 rounded-full font-mono font-bold ${phase === 'prep' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {phase === 'prep' ? `Prep: ${formatTime(timeLeft)}` : `Rec: ${formatTime(recordingTime)}`}
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 shadow-sm mb-8">
                <h3 className="text-gray-600 text-sm font-bold uppercase tracking-wider mb-4">Task</h3>
                <p className="text-xl text-gray-900 font-medium mb-8 leading-relaxed italic">
                    "{selectedTopic}"
                </p>

                {phase === 'prep' && (
                    <>
                        <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-xl text-left mb-6">
                            <h4 className="text-blue-700 font-bold text-sm mb-2 flex items-center gap-2"><Clock className="w-4 h-4" /> Prep Checklist</h4>
                            <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                                <li>Note down 3 key points you want to make.</li>
                                <li>Think of transition words (Furthermore, Consequently).</li>
                                <li>Try to aim for at least 1 minute of speech.</li>
                            </ul>
                        </div>
                        <button onClick={startRecording} className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg border-2 border-gray-300 transition-colors font-medium">
                            Skip Prep & Start Now
                        </button>
                    </>
                )}

                {phase === 'recording' && (
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center animate-pulse mb-4">
                            <Mic className="w-8 h-8 text-red-600" />
                        </div>

                        {/* Live Transcript Display */}
                        <div className="w-full min-h-[100px] p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl mb-6 text-left">
                            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-2">Live Transcript</span>
                            <p className="text-sm text-gray-700 leading-relaxed">
                                {transcript}
                                <span className="text-blue-500 font-medium">{liveTranscript}</span>
                                {!transcript && !liveTranscript && <span className="text-gray-400 italic">Listening... Start speaking now.</span>}
                            </p>
                        </div>

                        <button onClick={stopRecording} className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-full font-bold shadow-lg flex items-center gap-2 transition-transform hover:scale-105">
                            <Square className="w-4 h-4 fill-current" /> Stop Recording
                        </button>
                    </div>
                )}

                {phase === 'done' && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                            <Check className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-gray-900 font-medium mb-2">Recording captured!</p>
                        <p className="text-xs text-gray-500 mb-6">Duration: {recordingTime} seconds</p>

                        <button
                            onClick={handleSubmit}
                            disabled={isProcessing || isSubmitting}
                            className={`w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg transition-all ${isProcessing || isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
                        >
                            {isProcessing || isSubmitting ? 'Processing Analysis...' : 'Submit & See My Grade'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiagnosticSpeaking;
