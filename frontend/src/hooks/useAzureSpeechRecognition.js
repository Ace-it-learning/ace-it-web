import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useAzureSpeechRecognition
 * Replaces browser webkitSpeechRecognition with Azure OpenAI real-time STT.
 * Uses Web Audio API ScriptProcessorNode for direct PCM16 capture at 24kHz.
 *
 * @param {Object} options
 * @param {string} options.apiUrl - Backend WebSocket URL (e.g., ws://localhost:3001)
 * @param {number} options.silenceThresholdMs - Silence duration to trigger final (default: 1200)
 * @param {Function} options.onFinal - Callback when final transcript is ready
 * @param {Function} options.onPartial - Callback for partial transcripts
 * @param {Function} options.onError - Callback for errors
 */
export function useAzureSpeechRecognition(options = {}) {
    const {
        apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/^http/, 'ws'),
        onFinal,
        onPartial,
        onError
    } = options;

    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [isConnected, setIsConnected] = useState(false);

    const wsRef = useRef(null);
    const audioContextRef = useRef(null);
    const scriptProcessorRef = useRef(null);
    const sourceRef = useRef(null);
    const silenceTimerRef = useRef(null);
    const isListeningRef = useRef(false);
    const collectedTranscriptRef = useRef('');
    const streamRef = useRef(null);
    const pcmBufferRef = useRef([]);

    // Refs to always call the latest callbacks (prevents stale closures)
    const onFinalRef = useRef(onFinal);
    const onPartialRef = useRef(onPartial);
    const onErrorRef = useRef(onError);

    useEffect(() => { onFinalRef.current = onFinal; }, [onFinal]);
    useEffect(() => { onPartialRef.current = onPartial; }, [onPartial]);
    useEffect(() => { onErrorRef.current = onError; }, [onError]);

    const WS_URL = `${apiUrl}/api/speaking/stream/transcribe`;

    /**
     * Convert Float32Array to PCM16 base64
     */
    const float32ToPcm16Base64 = useCallback((float32Array) => {
        const pcm16 = new Int16Array(float32Array.length);
        for (let i = 0; i < float32Array.length; i++) {
            const s = Math.max(-1, Math.min(1, float32Array[i]));
            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        const bytes = new Uint8Array(pcm16.buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }, []);

    /**
     * Send accumulated PCM audio to backend
     */
    const sendPcmAudio = useCallback(() => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            pcmBufferRef.current = [];
            return;
        }

        const chunks = pcmBufferRef.current;
        if (chunks.length === 0) return;

        pcmBufferRef.current = [];

        // Concatenate all chunks
        const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const combined = new Float32Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
            combined.set(chunk, offset);
            offset += chunk.length;
        }

        // Convert to PCM16 base64
        const pcmBase64 = float32ToPcm16Base64(combined);

        // Send to backend WebSocket
        wsRef.current.send(JSON.stringify({
            type: 'audio',
            data: pcmBase64
        }));
    }, [float32ToPcm16Base64]);

    /**
     * Connect WebSocket to backend
     */
    const connectWebSocket = useCallback(() => {
        return new Promise((resolve, reject) => {
            try {
                console.log('[useAzureSpeechRecognition] Connecting to:', WS_URL);
                const ws = new WebSocket(WS_URL);
                wsRef.current = ws;
                let hasResolved = false;

                ws.onopen = () => {
                    console.log('[useAzureSpeechRecognition] WebSocket opened (handshaking with Azure...)');
                    setIsConnected(true);
                    // Don't resolve yet — wait for backend 'connected' message
                };

                ws.onmessage = (event) => {
                    try {
                        const msg = JSON.parse(event.data);

                        switch (msg.type) {
                            case 'connected':
                                console.log('[useAzureSpeechRecognition] Azure session ready:', msg.sessionId);
                                if (!hasResolved) {
                                    hasResolved = true;
                                    resolve();
                                }
                                break;

                            case 'partial': {
                                setInterimTranscript(msg.text || '');
                                const latestOnPartial = onPartialRef.current;
                                if (latestOnPartial) latestOnPartial(msg.text || '');
                                break;
                            }

                            case 'final': {
                                const finalText = msg.text || '';
                                if (finalText) {
                                    collectedTranscriptRef.current += (collectedTranscriptRef.current ? ' ' : '') + finalText;
                                    const fullText = collectedTranscriptRef.current;
                                    setTranscript(fullText);
                                    setInterimTranscript('');
                                    const latestOnFinal = onFinalRef.current;
                                    if (latestOnFinal) latestOnFinal(fullText);
                                }
                                // Clear the close timeout and close WebSocket now that we have final
                                if (ws._closeTimeout) {
                                    clearTimeout(ws._closeTimeout);
                                    ws._closeTimeout = null;
                                }
                                // Close WebSocket after receiving final to ensure fresh session on next start
                                setTimeout(() => {
                                    if (ws.readyState === WebSocket.OPEN) {
                                        ws.close(1000, 'Final received');
                                    }
                                    if (wsRef.current === ws) {
                                        wsRef.current = null;
                                    }
                                }, 300);
                                break;
                            }

                            case 'error': {
                                console.error('[useAzureSpeechRecognition] Server error:', msg.message);
                                const latestOnError = onErrorRef.current;
                                if (latestOnError) latestOnError(new Error(msg.message));
                                break;
                            }

                            case 'pong':
                                // Heartbeat response
                                break;

                            default:
                                break;
                        }
                    } catch {
                        console.warn('[useAzureSpeechRecognition] Invalid message:', event.data);
                    }
                };

                ws.onerror = (err) => {
                    console.error('[useAzureSpeechRecognition] WebSocket error:', err);
                    setIsConnected(false);
                    if (!hasResolved) {
                        hasResolved = true;
                        const latestOnError = onErrorRef.current;
                        if (latestOnError) latestOnError(new Error('WebSocket connection error'));
                        reject(err);
                    }
                };

                ws.onclose = (event) => {
                    console.log('[useAzureSpeechRecognition] WebSocket closed:', event.code, event.reason);
                    setIsConnected(false);
                    wsRef.current = null;
                    if (!hasResolved) {
                        hasResolved = true;
                        reject(new Error('WebSocket closed before Azure session ready'));
                    }
                };

                // Timeout: if no 'connected' message within 10s, fail
                setTimeout(() => {
                    if (!hasResolved) {
                        hasResolved = true;
                        const err = new Error('Timeout waiting for Azure STT session');
                        console.error('[useAzureSpeechRecognition]', err.message);
                        const latestOnError = onErrorRef.current;
                        if (latestOnError) latestOnError(err);
                        reject(err);
                    }
                }, 10000);
            } catch (err) {
                reject(err);
            }
        });
    }, [WS_URL]);

    /**
     * Pre-connect WebSocket to Azure STT (call before user starts speaking)
     * This eliminates the 1-2s connection delay when startListening is called.
     */
    const prepare = useCallback(async () => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            console.log('[useAzureSpeechRecognition] Already prepared.');
            return;
        }
        try {
            await connectWebSocket();
            console.log('[useAzureSpeechRecognition] Prepared — WebSocket ready.');
        } catch (err) {
            console.warn('[useAzureSpeechRecognition] Prepare failed:', err.message);
        }
    }, [connectWebSocket]);

    /**
     * Start listening
     */
    const startListening = useCallback(async () => {
        if (isListeningRef.current) return;

        try {
            // Reset state
            collectedTranscriptRef.current = '';
            setTranscript('');
            setInterimTranscript('');
            pcmBufferRef.current = [];

            // Reuse existing WebSocket if prepared, otherwise connect now
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
                await connectWebSocket();
            }

            // Get microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // Create AudioContext at 24kHz (Azure requirement)
            const audioContext = new AudioContext({ sampleRate: 24000 });
            audioContextRef.current = audioContext;

            // Create source from microphone stream
            const source = audioContext.createMediaStreamSource(stream);
            sourceRef.current = source;

            // Create ScriptProcessorNode for raw PCM capture
            // Buffer size: 4096 samples at 24kHz = ~170ms of audio
            const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (event) => {
                if (!isListeningRef.current) return;

                // Get raw PCM data from input channel
                const inputData = event.inputBuffer.getChannelData(0);
                
                // Clone the data (Float32Array) since it's reused by the browser
                pcmBufferRef.current.push(new Float32Array(inputData));
            };

            // Connect: source → scriptProcessor → destination
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContext.destination);

            // Send accumulated audio every 500ms
            const sendInterval = setInterval(() => {
                if (isListeningRef.current && pcmBufferRef.current.length > 0) {
                    sendPcmAudio();
                }
            }, 500);

            // Mark as started
            isListeningRef.current = true;
            setIsListening(true);
            console.log('[useAzureSpeechRecognition] Recording started (ScriptProcessorNode).');

            // Store interval for cleanup
            scriptProcessorRef.current._sendInterval = sendInterval;

        } catch (err) {
            console.error('[useAzureSpeechRecognition] Start failed:', err);
            setIsListening(false);
            isListeningRef.current = false;
            if (onError) onError(err);
        }
    }, [connectWebSocket, sendPcmAudio, onError]);

    /**
     * Stop listening
     */
    const stopListening = useCallback(() => {
        // Clear send interval first
        if (scriptProcessorRef.current && scriptProcessorRef.current._sendInterval) {
            clearInterval(scriptProcessorRef.current._sendInterval);
        }

        // Stop capturing new audio
        isListeningRef.current = false;
        setIsListening(false);

        // Send any remaining audio with a small delay to let the last buffer fill
        setTimeout(() => {
            if (pcmBufferRef.current.length > 0) {
                sendPcmAudio();
            }

            // Disconnect audio graph
            if (scriptProcessorRef.current) {
                scriptProcessorRef.current.disconnect();
                scriptProcessorRef.current = null;
            }
            if (sourceRef.current) {
                sourceRef.current.disconnect();
                sourceRef.current = null;
            }

            // Stop microphone stream
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
                streamRef.current = null;
            }

            // Close AudioContext
            if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }

            // Signal commit to Azure after audio is sent, then close WebSocket
            // Closing the WebSocket ensures a fresh Azure session on next startListening
            setTimeout(() => {
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    wsRef.current.send(JSON.stringify({ type: 'commit' }));
                    // Wait for final transcript before closing — Azure needs time to process
                    // We'll close in the onmessage handler when 'final' arrives, or timeout after 5s
                    const closeAfterFinal = () => {
                        if (wsRef.current) {
                            wsRef.current.close(1000, 'Session committed');
                            wsRef.current = null;
                        }
                    };
                    // Give Azure up to 5 seconds to return final transcript
                    const closeTimeout = setTimeout(closeAfterFinal, 5000);
                    // Store timeout so it can be cleared if final arrives sooner
                    wsRef.current._closeTimeout = closeTimeout;
                }
            }, 200);

            console.log('[useAzureSpeechRecognition] Recording stopped.');
        }, 300);
    }, [sendPcmAudio]);

    /**
     * Reset transcript
     */
    const resetTranscript = useCallback(() => {
        collectedTranscriptRef.current = '';
        setTranscript('');
        setInterimTranscript('');
    }, []);

    /**
     * Cleanup on unmount
     */
    useEffect(() => {
        return () => {
            stopListening();
            if (wsRef.current) {
                wsRef.current.close(1000, 'Component unmounted');
            }
        };
    }, [stopListening]);

    return {
        isListening,
        isConnected,
        transcript,
        interimTranscript,
        startListening,
        stopListening,
        resetTranscript,
        prepare
    };
}
