/**
 * Ace-it! Unified TTS Service (Client-Side)
 * Centralizes logic for environment-gating and browser fallback.
 */

// Speaker to Voice Mapping for consistent character persona
const speakerVoiceMap = new Map();

/**
 * Normalizes text for better speech synthesis
 */
const normalizeText = (text) => {
    if (!text) return "";
    return text.trim()
        .replace(/\[PAUSE\]/g, ', ') // Replace custom pause tags with natural pauses
        .replace(/\s+/g, ' ');       // Collapse whitespace
};

/**
 * Heuristic to detect gender from names/titles
 */
const detectGender = (name = "") => {
    const n = name.toLowerCase();
    // Titles & Common Names
    if (n.includes("ms.") || n.includes("mrs.") || n.includes("miss") || n.includes("madam") || n.includes("annie") || n.includes("beatrice") || n.includes("brenda") || n.includes("sarah") || n.includes("judy") || n.includes("cecilia") || n.includes("choi") || n.includes("elena") || n.includes("linda") || n.includes("goudie") || n.includes("moss") || n.includes("clara") || n.includes("janice") || n.includes("julianne")) return "FEMALE";
    if (n.includes("mr.") || n.includes("dr.") || n.includes("sir") || n.includes("david") || n.includes("samuel") || n.includes("ben") || n.includes("justin") || n.includes("lawrence") || n.includes("vincent") || n.includes("cheng") || n.includes("tan") || n.includes("ho") || n.includes("adrian") || n.includes("jonathan") || n.includes("aris") || n.includes("marco") || n.includes("ng") || n.includes("marcus") || n.includes("benny") || n.includes("alex") || n.includes("vance") || n.includes("thorne") || n.includes("alan")) return "MALE";
    
    // Default fallback
    return "FEMALE";
};

/**
 * Selects a high-quality system voice based on criteria
 */
const getSystemVoice = (lang = 'en-GB', gender = 'FEMALE') => {
    const voices = window.speechSynthesis.getVoices();
    
    // Filter by language
    let filtered = voices.filter(v => v.lang.startsWith(lang));
    if (filtered.length === 0) filtered = voices.filter(v => v.lang.startsWith('en')); // Fallback to any English

    // Try to match gender by name heuristics (not perfect but better than nothing)
    const targetGender = gender.toUpperCase();
    const femaleKeywords = ['female', 'zira', 'samantha', 'victoria', 'hazel', 'google uk english female', 'catherine', 'alice', 'susan'];
    const maleKeywords = ['male', 'david', 'james', 'google uk english male', 'alex', 'daniel', 'arthur', 'mark', 'george'];

    let matched = filtered.filter(v => {
        const vName = v.name.toLowerCase();
        if (targetGender === 'FEMALE') return femaleKeywords.some(k => vName.includes(k));
        if (targetGender === 'MALE') return maleKeywords.some(k => vName.includes(k));
        return true;
    });

    return matched[0] || filtered[0] || voices[0];
};

/**
 * Main TTS Trigger
 */
export const speak = async (options) => {
    const {
        text,
        languageCode = 'en-GB',
        gender = 'FEMALE',
        speakerName = '',
        onEnd,
        onBoundary,
        rate = 1.0,
        pitch = 1.0,
        useBrowserOnly = true // FORCED: Use browser native TTS everywhere to eliminate API costs
    } = options;

    if (!text) return;

    // Use speakerName to persist voice if available
    const speakerKey = speakerName || 'default';
    const effectiveGender = speakerName ? detectGender(speakerName) : gender;

    // TRACK 1: Standard API (Production Only or if forced)
    if (!useBrowserOnly) {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/lab/tts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    languageCode,
                    gender: effectiveGender,
                    includeTimepoints: !!onBoundary // If we need word highlighting
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.audio) {
                    const audioObj = new Audio(`data:audio/mp3;base64,${data.audio}`);
                    
                    if (onEnd) audioObj.onended = onEnd;
                    
                    // Simple word highlighting estimation if no timepoints returned
                    if (onBoundary && !data.timepoints) {
                        const words = text.split(/\s+/);
                        audioObj.ontimeupdate = () => {
                            const progress = audioObj.currentTime / audioObj.duration;
                            const idx = Math.floor(progress * words.length);
                            onBoundary({ name: 'word', charIndex: idx, wordIndex: idx });
                        };
                    } else if (onBoundary && data.timepoints) {
                        // Handle timepoints (mapped to onBoundary call)
                        audioObj.ontimeupdate = () => {
                            const currentTimeMs = audioObj.currentTime * 1000;
                            const tp = data.timepoints.find(t => (t.timeSeconds || t.time_seconds || t.time || 0) * 1000 > currentTimeMs);
                            if (tp) {
                                const markLabel = tp.markName || tp.name || tp.mark_name || tp.label;
                                if (markLabel && markLabel.startsWith('w')) {
                                    onBoundary({ name: 'word', wordIndex: parseInt(markLabel.substring(1)) });
                                }
                            }
                        };
                    }

                    audioObj.play();
                    return { type: 'audio', controller: audioObj };
                }
            }
        } catch (err) {
            console.warn('[TTSService] API failed or blocked, falling back to Browser TTS:', err.message);
        }
    }

    // TRACK 2: Browser TTS (Development or Fallback)
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel(); // Stop current speech
        
        const normalizedStr = normalizeText(text);
        const utterance = new SpeechSynthesisUtterance(normalizedStr);
        utterance.lang = languageCode;
        utterance.rate = rate;
        utterance.pitch = pitch;

        // Persist voice for speaker
        if (!speakerVoiceMap.has(speakerKey)) {
            speakerVoiceMap.set(speakerKey, getSystemVoice(languageCode, effectiveGender));
        }
        utterance.voice = speakerVoiceMap.get(speakerKey);

        if (onEnd) utterance.onend = onEnd;
        if (onBoundary) {
            // Browser native onboundary – use normalizedStr (what the utterance actually speaks)
            // so charIndex maps correctly to word positions
            utterance.onboundary = (event) => {
                if (event.name === 'word') {
                    const textBefore = normalizedStr.substring(0, event.charIndex);
                    const wordIndex = textBefore.split(/\s+/).filter(s => s.length > 0).length;
                    onBoundary({ ...event, wordIndex });
                }
            };
        }

        window.speechSynthesis.speak(utterance);
        return { type: 'speechSynthesis', controller: utterance };
    }

    console.error('[TTSService] No TTS capability available.');
    return null;
};

/**
 * Explicitly destroys a TTS controller (Audio or Utterance) to free memory
 */
export const destroyController = (result) => {
    if (!result || !result.controller) return;

    const { type, controller } = result;

    if (type === 'audio' && controller instanceof Audio) {
        try {
            controller.pause();
            controller.onended = null;
            controller.ontimeupdate = null;
            controller.onerror = null;
            controller.src = "";
            controller.load(); // Forces clearing of buffer
        } catch (e) {
            console.warn('[TTSService] Failed to destroy audio controller:', e);
        }
    } else if (type === 'speechSynthesis' && controller instanceof SpeechSynthesisUtterance) {
        try {
            controller.onend = null;
            controller.onboundary = null;
            controller.onerror = null;
            controller.onstart = null;
            // Note: We don't cancel here because it's a global singleton, 
            // but we clear the listeners to allow GC of closures.
        } catch (e) {
            console.warn('[TTSService] Failed to destroy utterance controller:', e);
        }
    }
};

export const stopAll = () => {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
};

