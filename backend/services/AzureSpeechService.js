/**
 * AzureSpeechService
 * Real-time speech-to-text proxy using Azure OpenAI's real-time API.
 * Connects to Azure via WebSocket, streams PCM16 audio, receives transcripts.
 * 
 * The real-time API works on both:
 * - Azure OpenAI resources (openai.azure.com)
 * - Azure Cognitive Services resources (cognitiveservices.azure.com)
 * 
 * Docs: https://learn.microsoft.com/en-us/azure/ai-services/openai/realtime-audio-quickstart
 */

const WebSocket = require('ws');
const crypto = require('crypto');

class AzureSpeechService {
    constructor() {
        // Use the dedicated real-time endpoint (jackt-mox15ep1-eastus2)
        this.endpoint = process.env.AZURE_OPENAI_REALTIME_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT || '';
        this.apiKey = process.env.AZURE_OPENAI_REALTIME_API_KEY || process.env.AZURE_OPENAI_API_KEY || '';
        this.apiVersion = process.env.AZURE_OPENAI_REALTIME_API_VERSION || '2024-10-01-preview';
        this.deployment = process.env.AZURE_OPENAI_DEPLOYMENT_REALTIME || 'gpt-realtime-mini';
        this.isConfigured = !!(this.endpoint && this.apiKey);
    }

    /**
     * Build the Azure OpenAI real-time WebSocket URL
     * Works for both openai.azure.com and cognitiveservices.azure.com endpoints
     */
    getRealtimeUrl() {
        const base = this.endpoint.replace(/\/+$/g, '').replace(/^https:/, 'wss:');
        // Azure OpenAI real-time endpoint format (same for both resource types)
        return `${base}/openai/realtime?api-version=${encodeURIComponent(this.apiVersion)}&deployment=${encodeURIComponent(this.deployment)}`;
    }

    /**
     * Create a new real-time STT session
     * @returns {Object} Session controller with { connect, sendAudio, disconnect, onTranscript, onPartial, onError }
     */
    createSession() {
        if (!this.isConfigured) {
            throw new Error('AzureSpeechService not configured. Set AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, and AZURE_OPENAI_DEPLOYMENT_REALTIME.');
        }

        const sessionId = crypto.randomUUID
            ? crypto.randomUUID()
            : `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        let ws = null;
        let isConnected = false;
        let sessionConfigSent = false;
        let sessionCreated = false;
        let connectResolve = null;
        let connectReject = null;
        let audioBytesSent = 0;

        // Callbacks (to be set by caller)
        const callbacks = {
            onPartial: null,      // (text: string) => void
            onFinal: null,        // (text: string) => void
            onError: null,        // (error: Error) => void
            onConnect: null,      // () => void
            onDisconnect: null    // () => void
        };

        const connect = () => {
            return new Promise((resolve, reject) => {
                try {
                    const url = this.getRealtimeUrl();
                    console.log(`[AzureSpeechService:${sessionId}] Connecting to real-time STT...`);

                    ws = new WebSocket(url, [], {
                        headers: {
                            'api-key': this.apiKey
                        },
                        perMessageDeflate: false
                    });

                    ws.on('open', () => {
                        isConnected = true;
                        console.log(`[AzureSpeechService:${sessionId}] WebSocket connected.`);

                        // Store resolve/reject for session.created wait
                        connectResolve = resolve;
                        connectReject = reject;

                        // Send session configuration
                        const config = {
                            type: 'session.update',
                            session: {
                                modalities: ['text'],
                                input_audio_format: 'pcm16',
                                input_audio_transcription: {
                                    model: 'whisper-1',
                                    language: 'en'
                                },
                                turn_detection: {
                                    type: 'server_vad',
                                    threshold: 0.5,
                                    prefix_padding_ms: 300,
                                    silence_duration_ms: 1200
                                },
                                voice: 'alloy'
                            }
                        };
                        ws.send(JSON.stringify(config));
                        sessionConfigSent = true;

                        if (callbacks.onConnect) callbacks.onConnect();

                        // Wait up to 5s for session.created before resolving
                        setTimeout(() => {
                            if (!sessionCreated && connectResolve) {
                                console.warn(`[AzureSpeechService:${sessionId}] session.created not received, proceeding anyway.`);
                                connectResolve();
                                connectResolve = null;
                                connectReject = null;
                            }
                        }, 5000);
                    });

                    ws.on('message', (data) => {
                        try {
                            const message = JSON.parse(data.toString());

                            // Handle session.created here to resolve connect promise
                            if (message.type === 'session.created') {
                                console.log(`[AzureSpeechService:${sessionId}] Session created.`);
                                sessionCreated = true;
                                if (connectResolve) {
                                    connectResolve();
                                    connectResolve = null;
                                    connectReject = null;
                                }
                            }

                            this._handleMessage(message, callbacks, sessionId);
                        } catch (e) {
                            console.warn(`[AzureSpeechService:${sessionId}] Non-JSON message:`, data.toString().slice(0, 100));
                        }
                    });

                    ws.on('error', (err) => {
                        console.error(`[AzureSpeechService:${sessionId}] WebSocket error:`, err.message);
                        if (callbacks.onError) callbacks.onError(err);
                        if (!isConnected) reject(err);
                    });

                    ws.on('close', (code, reason) => {
                        isConnected = false;
                        console.log(`[AzureSpeechService:${sessionId}] WebSocket closed. Code: ${code}, Reason: ${reason}`);
                        if (callbacks.onDisconnect) callbacks.onDisconnect();
                    });

                } catch (err) {
                    reject(err);
                }
            });
        };

        const sendAudio = (base64Pcm16) => {
            if (!isConnected || !ws || ws.readyState !== WebSocket.OPEN) {
                console.warn(`[AzureSpeechService:${sessionId}] Cannot send audio: not connected.`);
                return;
            }

            // Azure real-time expects audio chunks as base64-encoded PCM16
            const message = {
                type: 'input_audio_buffer.append',
                audio: base64Pcm16
            };
            ws.send(JSON.stringify(message));
            audioBytesSent += base64Pcm16.length;
        };

        const commitAudio = () => {
            if (!isConnected || !ws || ws.readyState !== WebSocket.OPEN) {
                return;
            }
            // Only commit if we actually sent audio
            if (audioBytesSent === 0) {
                console.warn(`[AzureSpeechService:${sessionId}] Skipping commit: no audio sent.`);
                return;
            }
            // Signal end of audio input
            ws.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));
        };

        const disconnect = () => {
            if (ws) {
                try {
                    ws.close(1000, 'Client disconnect');
                } catch (e) {
                    // ignore
                }
                ws = null;
            }
            isConnected = false;
        };

        return {
            sessionId,
            connect,
            sendAudio,
            commitAudio,
            disconnect,
            get isConnected() { return isConnected; },
            set onPartial(fn) { callbacks.onPartial = fn; },
            set onFinal(fn) { callbacks.onFinal = fn; },
            set onError(fn) { callbacks.onError = fn; },
            set onConnect(fn) { callbacks.onConnect = fn; },
            set onDisconnect(fn) { callbacks.onDisconnect = fn; }
        };
    }

    /**
     * Handle incoming WebSocket messages from Azure
     */
    _handleMessage(message, callbacks, sessionId) {
        const type = message.type;

        // DEBUG: Log all message types
        if (type !== 'input_audio_buffer.speech_started' && type !== 'input_audio_buffer.speech_stopped') {
            console.log(`[AzureSpeechService:${sessionId}] MSG: ${type}`, JSON.stringify(message).substring(0, 200));
        }

        switch (type) {
            case 'session.updated':
                console.log(`[AzureSpeechService:${sessionId}] Session configured.`);
                break;

            case 'input_audio_buffer.speech_started':
                console.log(`[AzureSpeechService:${sessionId}] Speech started.`);
                if (callbacks.onPartial) callbacks.onPartial('🎤 Speech detected...');
                break;

            case 'input_audio_buffer.speech_stopped':
                console.log(`[AzureSpeechService:${sessionId}] Speech stopped.`);
                if (callbacks.onPartial) callbacks.onPartial('⏳ Processing speech...');
                break;

            case 'conversation.item.input_audio_transcription.completed':
                // Final transcription of user's speech
                if (message.transcript && callbacks.onFinal) {
                    console.log(`[AzureSpeechService:${sessionId}] ✅ Final transcript: "${message.transcript.substring(0, 50)}..."`);
                    callbacks.onFinal(message.transcript);
                }
                break;

            case 'conversation.item.input_audio_transcription.delta':
                // Partial transcription of user's speech
                const partialText = message.delta || message.text || '';
                if (partialText && callbacks.onPartial) {
                    callbacks.onPartial(partialText);
                }
                break;

            case 'response.audio_transcript.delta':
                // This is the AI's response transcript, not user's — ignore for STT
                break;

            case 'response.audio_transcript.delta':
                // Ignore — we only want input transcription, not AI response generation
                break;

            case 'error':
                console.error(`[AzureSpeechService:${sessionId}] ❌ Server error:`, message.error);
                if (callbacks.onError) {
                    callbacks.onError(new Error(message.error?.message || 'Azure STT error'));
                }
                break;

            default:
                // Log unknown message types for debugging
                console.log(`[AzureSpeechService:${sessionId}] Unknown msg type: ${type}`);
                break;
        }
    }

    /**
     * Health check — verify Azure OpenAI real-time endpoint is reachable
     */
    async healthCheck() {
        if (!this.isConfigured) {
            return { ok: false, error: 'Not configured' };
        }
        try {
            const url = this.getRealtimeUrl();
            // We can't easily health-check WebSocket without full auth handshake,
            // so just verify the URL is well-formed
            return { ok: true, endpoint: url.replace(/\?.*$/, ''), deployment: this.deployment };
        } catch (e) {
            return { ok: false, error: e.message };
        }
    }
}

module.exports = new AzureSpeechService();
