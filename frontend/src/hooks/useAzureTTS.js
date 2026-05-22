import { useState, useRef, useCallback } from 'react';

/**
 * useAzureTTS
 * Reusable hook for speech synthesis with tier-gated Azure Neural TTS.
 * Premium users get Azure Neural voices; Pro/Free users get browser TTS fallback.
 *
 * @param {Object} options
 * @param {string} options.uid - User ID for tier lookup
 * @param {Function} options.onStart - Called when speech starts
 * @param {Function} options.onEnd - Called when speech ends
 */
export function useAzureTTS(options = {}) {
    const { uid, onStart, onEnd } = options;
    const [isSpeaking, setIsSpeaking] = useState(false);
    const activeAudio = useRef(null);
    const abortController = useRef(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    /**
     * Play speech using Azure TTS (Premium) or browser TTS fallback (Pro/Free)
     * @param {string} text - Text to speak
     * @param {string} role - Voice role for Azure TTS: 'Examiner' | 'Candidate_A' | 'Candidate_B' | 'Candidate_C'
     *                        For lab pages, 'Tutor' maps to 'Examiner', 'Annie' maps to 'Candidate_A'
     * @param {Object} voiceOpts - Browser TTS voice options { pitch, rate, voice, onEnd }
     * @returns {Promise<void>}
     */
    const speak = useCallback(async (text, role = 'Examiner', voiceOpts = {}) => {
        if (!text || !text.trim()) return;

        // Cancel any ongoing speech
        stop();

        // Map lab roles to exam roles for Azure voice selection
        const roleMap = {
            'Tutor': 'Examiner',
            'Annie': 'Candidate_A',
            'Ben': 'Candidate_B',
            'Charlie': 'Candidate_C'
        };
        const azureRole = roleMap[role] || role;

        // Extract per-call onEnd callback if provided
        const callOnEnd = voiceOpts?.onEnd;

        // Try Azure TTS first (Premium tier only)
        try {
            const res = await fetch(`${API_URL}/api/speaking/tts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text.trim(), role: azureRole, uid }),
                signal: AbortSignal.timeout(10000)
            });

            if (!res.ok) throw new Error(`TTS HTTP ${res.status}`);
            const data = await res.json();

            if (data.audio && !data.fallback) {
                // Azure TTS audio received — play it
                const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
                activeAudio.current = audio;

                audio.onplay = () => {
                    setIsSpeaking(true);
                    if (onStart) onStart();
                };
                audio.onended = () => {
                    setIsSpeaking(false);
                    activeAudio.current = null;
                    if (callOnEnd) callOnEnd();
                    else if (onEnd) onEnd();
                };
                audio.onerror = () => {
                    setIsSpeaking(false);
                    activeAudio.current = null;
                    // Fall through to browser TTS
                    speakBrowser(text, voiceOpts);
                };

                await audio.play();
                return;
            }
        } catch (e) {
            // Azure failed or user is not Premium — fall back to browser TTS
        }

        // Browser TTS fallback
        speakBrowser(text, voiceOpts);
    }, [uid, onStart, onEnd]);

    /**
     * Browser TTS fallback using SpeechSynthesis
     */
    const speakBrowser = useCallback((text, voiceOpts = {}) => {
        if (!window.speechSynthesis) return;

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const callOnEnd = voiceOpts?.onEnd;

        // Apply voice options
        if (voiceOpts.voice) utterance.voice = voiceOpts.voice;
        if (voiceOpts.pitch !== undefined) utterance.pitch = voiceOpts.pitch;
        if (voiceOpts.rate !== undefined) utterance.rate = voiceOpts.rate;

        utterance.onstart = () => {
            setIsSpeaking(true);
            if (onStart) onStart();
        };
        utterance.onend = () => {
            setIsSpeaking(false);
            if (callOnEnd) callOnEnd();
            else if (onEnd) onEnd();
        };
        utterance.onerror = () => {
            setIsSpeaking(false);
            if (callOnEnd) callOnEnd();
            else if (onEnd) onEnd();
        };

        window.speechSynthesis.speak(utterance);
    }, [onStart, onEnd]);

    /**
     * Stop any ongoing speech
     */
    const stop = useCallback(() => {
        if (activeAudio.current) {
            activeAudio.current.pause();
            activeAudio.current = null;
        }
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
    }, []);

    return {
        speak,
        stop,
        isSpeaking
    };
}
