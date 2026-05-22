const express = require('express');
const router = express.Router();
const SpeakingQuestService = require('../services/SpeakingQuestService');
const { deliveryGradingAgent, flowGradingAgent, interactionGradingAgent } = require('../prompts/speakingGradingAgent');
const speakingFlowAgent = require('../prompts/speakingFlowAgent');
const speakingAgent = require('../prompts/speakingAgent');
const speakingAgentFast = require('../prompts/speakingAgentFast');
const GenerativeAIService = require('../services/GenerativeAIService');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const UserProfileService = require('../services/UserProfileService');
const SpeakingMockGradingService = require('../services/SpeakingMockGradingService');
const { uploadBuffer } = require('../storage/blobStorage');
const AzureTTSService = require('../services/AzureTTSService');

// Each router owns its sub-paths (e.g. /chat, /history, /stats)

/**
 * @route   GET /api/speaking/drills/:pillar
 * @desc    Fetch pre-written drills for a specific pillar from Cosmos DB
 */
router.get('/drills/:pillar', async (req, res) => {
    try {
        const { pillar } = req.params;
        const QuestionBankStore = require('../services/QuestionBankStore');
        
        // Query speaking drills from Cosmos DB
        const drills = await QuestionBankStore.querySpeakingDrillsByCriterion(pillar, 100);
        
        if (!drills || drills.length === 0) {
            // Fallback to local JSON file if no data in Cosmos DB
            const fs = require('fs');
            const path = require('path');
            const drillsPath = path.join(__dirname, '../data/speaking_drills.json');
            
            if (fs.existsSync(drillsPath)) {
                const data = JSON.parse(fs.readFileSync(drillsPath, 'utf8'));
                const pillarData = data[pillar];
                if (pillarData) {
                    return res.json(pillarData);
                }
            }
            return res.status(404).json({ error: `No drills found for pillar: ${pillar}` });
        }
        
        // Transform Cosmos DB format back to the expected frontend format
        const formattedDrills = drills.map(d => ({
            id: d.id,
            title: d.title || d.topic || d.scenario,
            scenario: d.scenario,
            level: d.level_raw || d.level,
            level_label: d.level_label,
            master_script: d.master_script,
            vocabulary: d.vocabulary,
            prosody: d.prosody,
            focus_phonemes: d.focus_phonemes,
            segments: d.segments,
            power_words: d.power_words,
            mind_map: d.mind_map,
            discussion_points: d.discussion_points,
            criteria: d.criteria
        }));

        res.json(formattedDrills);
    } catch (error) {
        console.error('[Speaking Drills] Fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch drills' });
    }
});

/**
 * @route   GET /api/speaking/quest/generate
 * @desc    Generate a speaking quest for a specific module
 * @query   module (delivery|flow|interaction), level (1-5), uid
 */
router.get('/quest/generate', async (req, res) => {
    try {
        const { module, level = '3', uid = 'guest', focus } = req.query;

        if (!module || !['delivery', 'flow', 'interaction', 'language_patterns', 'ideas_organisation'].includes(module)) {
            return res.status(400).json({ error: 'Invalid module. Must be delivery, flow, interaction, language_patterns, or ideas_organisation.' });
        }

        const quest = await SpeakingQuestService.generateQuest(uid, module, parseInt(level), focus);

        res.json(quest);
    } catch (error) {
        console.error('[Speaking Quest] Generation error:', error);
        res.status(500).json({ error: 'Failed to generate quest', details: error.message });
    }
});

/**
 * @route   POST /api/speaking/quest/submit
 * @desc    Submit a speaking quest for grading (Delivery, Flow, or Interaction)
 */
/**
 * Helper: Store student audio in Azure Blob for replay/verification.
 * Returns the blob URL or null if storage fails.
 */
async function storeStudentAudio(audioBuffer, audioType, uid, module, questId) {
    try {
        const timestamp = Date.now();
        const ext = audioType.includes('webm') ? 'webm' : (audioType.includes('wav') ? 'wav' : 'bin');
        const blobName = `speaking/${uid}/${module}/${timestamp}_${questId || 'unknown'}.${ext}`;
        const blobUrl = await uploadBuffer({
            containerName: 'student-recordings',
            blobName,
            buffer: audioBuffer,
            contentType: audioType
        });
        console.log(`[AudioStorage] Stored audio: ${blobUrl}`);
        return blobUrl;
    } catch (err) {
        console.warn(`[AudioStorage] Failed to store audio: ${err.message}`);
        return null;
    }
}

router.post('/quest/submit', upload.single('audio'), async (req, res) => {
    try {
        const { module, quest_id, master_script, level, uid, focus, messages, power_words } = req.body;
        const resolvedUid = uid || req.uid || req.query?.uid || 'guest';
        const audioFile = req.file;

        let prompt = "";
        let mockTranscript = "";
        let transcribedText = "";
        let historyToGrade = [];
        let audioUrl = null;

        if (module === 'delivery') {
            if (!audioFile) return res.status(400).json({ error: 'No audio file provided for delivery quest' });

            const PronunciationService = require('../services/PronunciationService');

            // Real Audio Analysis with Pronunciation Assessment
            console.log(`[Speaking Delivery] Analyzing audio for ${uid}...`);
            const analysis = await PronunciationService.analyzePronunciation(
                audioFile.buffer.toString('base64'),
                audioFile.mimetype,
                master_script  // reference text for pronunciation assessment
            );

            mockTranscript = analysis.transcript || "";
            const wordsSpoken = mockTranscript.split(/\s+/).filter(w => w.length > 0).length;

            // SILENCE / MINIMAL SPEECH CHECK
            if (wordsSpoken < 3) {
                console.warn(`[Speaking Delivery] Minimal speech detected (${wordsSpoken} words). Awarding zero marks.`);
                return res.json({
                    scores: { pronunciation: 0, intonation: 0, pacing: 0, grammar: 0, total: 0 },
                    feedback: {
                        summary: "Incomplete recording: Little or no speech was detected.",
                        rhythm_score: "N/A - Insufficient audio for rhythmic analysis.",
                        improvement_advice: "Please record yourself reading the full passage to receive a detailed assessment. Ensure your microphone is working correctly."
                    },
                    transcript: mockTranscript,
                    xp_awarded: 0
                });
            }

            // Build waveform data: use real pronunciation metrics if available, else fallback to confidence
            const pm = analysis.pronunciationMetrics;
            let waveformData;
            if (pm && pm.accuracyScore > 0) {
                waveformData = `Accuracy: ${pm.accuracyScore}/100 | Fluency: ${pm.fluencyScore}/100 | Completeness: ${pm.completenessScore}/100 | Prosody: ${pm.prosodyScore}/100`;
            } else {
                const confidenceScore = Math.round(analysis.overallConfidence * 100);
                const wordConfidenceData = (analysis.wordDetails || []).map(w => `${w.word}: ${Math.round(w.confidence * 100)}%`).join(', ');
                waveformData = `Overall Confidence: ${confidenceScore}%. Details: ${wordConfidenceData}`;
            }

            // Build word analysis for phoneme-level feedback
            const wordAnalysisData = (analysis.wordDetails || []).map(w => {
                const phonemeInfo = w.phonemes ? ` [phonemes: ${w.phonemes.map(p => `${p.phoneme}=${p.accuracyScore}`).join(', ')}]` : '';
                return `${w.word} (confidence: ${Math.round(w.confidence * 100)}%, error: ${w.errorType})${phonemeInfo}`;
            }).join('; ');

            // Store audio for replay/verification
            audioUrl = await storeStudentAudio(audioFile.buffer, audioFile.mimetype, resolvedUid, module, quest_id);

            prompt = deliveryGradingAgent
                .replace('{MASTER_SCRIPT}', master_script)
                .replace('{STUDENT_TRANSCRIPT}', mockTranscript)
                .replace('{WAVEFORM_DATA}', waveformData)
                .replace('{WORD_ANALYSIS}', wordAnalysisData || 'No word-level analysis available.')
                .replace('{STUDENT_LEVEL}', level)
                .replace('{FOCUS_AREA}', focus || 'General Delivery');
        } else if (module === 'flow') {
            const history = typeof messages === 'string' ? JSON.parse(messages) : (messages || []);
            const studentMessages = history.filter(m => m.role === 'user');

            if (studentMessages.length === 0) {
                console.warn(`[Speaking Flow] Empty submission for ${uid}. Returning zero scores.`);
                return res.json({
                    scores: { spontaneity: 0, confidence: 0, vocabulary: 0, latency_score: 0, total: 0 },
                    feedback: {
                        summary: "The interview was ended before you started speaking.",
                        improvement_advice: "Please participate in the interview by responding to the AI's questions to receive an assessment."
                    }
                });
            }

            const aiQuestions = history.filter(m => m.role === 'ai').map(m => m.text).join('\n');
            const studentResponses = studentMessages.map(m => m.text).join('\n');
            const latencyData = history.map(m => `Latency: ${m.latency || 0}s`).join(', ');
            const usedWords = power_words ? (typeof power_words === 'string' ? JSON.parse(power_words).join(', ') : power_words.join(', ')) : "None";

            prompt = flowGradingAgent
                .replace('{AI_PERSONA}', 'Interviewer')
                .replace('{SCENARIO}', 'Interview')
                .replace('{TOPIC}', 'General Flow')
                .replace('{LEVEL}', level)
                .replace('{AI_QUESTIONS}', aiQuestions)
                .replace('{STUDENT_RESPONSES}', studentResponses)
                .replace('{LATENCY_DATA}', latencyData)
                .replace('{POWER_WORDS_DETECTED}', usedWords);
        } else if (module === 'interaction' || module === 'strategies' || module === 'delivery') {
            const userLabel = (module === 'interaction' || module === 'strategies' || req.body.mode === 'lab') ? 'Student' : 'Candidate_D';
            const rawMessages = messages || req.body.transcript || [];
            const history = Array.isArray(rawMessages) ? rawMessages : (typeof rawMessages === 'string' ? JSON.parse(rawMessages) : []);
            
            // DEBUG: Log history structure to diagnose zero-score issues
            console.log(`[Speaking Quest Submit] History length: ${history.length}, sample:`, history.slice(0, 3).map(m => ({ speaker: m.speaker, role: m.role, text: m.text?.substring(0, 30) })));
            
            const studentMessages = history.filter(m =>
                m.speaker === 'Student' ||
                m.role === 'user' ||
                m.speaker === 'Jack Tam' ||
                m.role === 'Student' ||
                m.speaker === userLabel
            );
            
            console.log(`[Speaking Quest Submit] Student messages found: ${studentMessages.length}`);

            // transcription of the latest recorded response
            let pronunciationMetrics = null;
            if (audioFile) {
                const PronunciationService = require('../services/PronunciationService');
                const referenceText = master_script || req.body.topic || 'General Discussion';
                const analysis = await PronunciationService.analyzePronunciation(
                    audioFile.buffer.toString('base64'),
                    audioFile.mimetype,
                    referenceText
                );
                transcribedText = analysis.transcript;
                pronunciationMetrics = analysis.pronunciationMetrics;
                console.log(`[Interaction Submission] Transcribed: "${transcribedText.substring(0, 50)}..." Metrics:`, pronunciationMetrics);

                // Store audio for replay/verification
                audioUrl = await storeStudentAudio(audioFile.buffer, audioFile.mimetype, resolvedUid, module, quest_id);
            }

            if (!transcribedText && studentMessages.length === 0) {
                console.warn(`[Speaking Quest Submit] ZERO SCORE PATH: No transcribedText and no studentMessages. History has ${history.length} items.`);
                return res.json({
                    scores: { facilitation: 0, listening: 0, turn_taking: 0, bridging: 0, total: 0 },
                    feedback: {
                        summary: "Incomplete session: No student interaction detected.",
                        improvement_advice: "Join the conversation to earn marks on facilitation and active listening!"
                    }
                });
            }

            // Inject the transcribed text into the history if it was a Lab turn
            historyToGrade = [...history];
            if (transcribedText) {
                // Find the latest user message to update its content from placeholder to real text
                const lastUserIdx = [...historyToGrade].reverse().findIndex(m => m.speaker === 'Student' || m.role === 'user' || m.speaker === userLabel);
                if (lastUserIdx !== -1) {
                    const actualIdx = (historyToGrade.length - 1) - lastUserIdx;
                    historyToGrade[actualIdx] = { ...historyToGrade[actualIdx], text: transcribedText };
                }
            }

            const historyText = historyToGrade.map(m => `${m.speaker || m.role || userLabel}: ${m.text}`).join('\n');

            const prosodyData = req.body.prosody_metrics ? (typeof req.body.prosody_metrics === 'string' ? JSON.parse(req.body.prosody_metrics) : req.body.prosody_metrics) : [];
            const prosodyText = prosodyData.length > 0
                ? prosodyData.map((p, i) => `Turn ${i+1}: Pacing=${p.pacing}, Intonation=${p.intonation}, Confidence=${p.confidence}, Clarity=${p.clarity}, Vibe="${p.vibe}"`).join('\n')
                : "No granular prosody data available for this session.";

            // Add pronunciation metrics from audio analysis if available
            const pronunciationText = pronunciationMetrics
                ? `Pronunciation Assessment (from audio): Accuracy=${pronunciationMetrics.accuracyScore}/100, Fluency=${pronunciationMetrics.fluencyScore}/100, Completeness=${pronunciationMetrics.completenessScore}/100, Prosody=${pronunciationMetrics.prosodyScore}/100`
                : "No pronunciation assessment data available.";

            prompt = interactionGradingAgent
                .replace(/{TOPIC}/g, master_script || 'General Discussion')
                .replace(/{HISTORY}/g, historyText)
                .replace(/{LEVEL}/g, level || '3')
                .replace(/{USER_LABEL}/g, userLabel)
                .replace(/{FOCUS_AREA}/g, focus || 'General Interaction')
                .replace(/{PROSODY_METRICS}/g, `${prosodyText}\n${pronunciationText}`);

        } else if (module === 'language_patterns') {
            const history = typeof messages === 'string' ? JSON.parse(messages) : (messages || []);
            const practiceResults = req.body.practice_results ? (typeof req.body.practice_results === 'string' ? JSON.parse(req.body.practice_results) : req.body.practice_results) : [];
            const studentResponses = history.filter(m => m.role === 'user').map(m => m.text).join('\n') || "N/A";
            const { languagePatternsGradingAgent } = require('../prompts/speakingGradingAgent');

            // Check if student actually spoke anything
            const hasAnyTranscript = history.some(m => m.role === 'user' && m.text && m.text.trim().length > 0);
            if (!hasAnyTranscript && practiceResults.length > 0) {
                console.warn(`[Speaking Language] No student transcripts detected. Returning fallback scores.`);
                return res.json({
                    scores: { vocabulary: 0, grammar_range: 0, pronunciation: 0, intonation: 0, total: 0 },
                    feedback: {
                        summary: "No speech detected. Please allow microphone access and speak clearly to receive a vocabulary assessment.",
                        vocabulary_highlights: [],
                        improvement_advice: "Click the microphone button and repeat each sentence after Annie. Make sure your microphone is working."
                    },
                    word_analysis: [],
                    transcript: history,
                    xp_awarded: 0
                });
            }

            // Format results for AI — 2-phase: repeat + create
            const resultsText = practiceResults.length > 0
                ? practiceResults.map((r, i) => {
                    // Robust lookup for transcript across different possible structures
                    const msg = history[i];
                    const repeatText = msg?.repeat_transcript || msg?.text || msg?.transcript || "No repeat transcript";
                    const createText = msg?.create_transcript || "No original sentence";
                    
                    return `[SENTENCE ${i + 1}]
- [TARGET SENTENCE]: ${r.sentence}
- [POWER WORD]: ${r.target_word}
- [PHASE A — REPEAT]: ${repeatText}
- [PHASE B — ORIGINAL]: ${createText}`;
                }).join('\n\n')
                : `Student Direct Responses:\n${studentResponses}`;

            console.log(`[Speaking Language] Final Assessment Data constructed for ${practiceResults.length} sentences (2-phase).`);
            
            prompt = languagePatternsGradingAgent
                .replace(/{PRACTICE_RESULTS}/g, resultsText)
                .replace(/{LEVEL}/g, level || '3');
        } else if (module === 'ideas_organisation') {
            const history = typeof messages === 'string' ? JSON.parse(messages) : (messages || []);
            // Robust extractor: handle 'user', 'Student', or the current user label
            const userLabel = req.body.user_label || 'Student';
            const studentResponses = history
                .filter(m => m.role === 'user' || m.speaker === 'Student' || m.speaker === userLabel)
                .map(m => m.text)
                .join('\n') || "No spoken responses recorded.";

            const organisationData = req.body.organisation_data || "N/A";
            const { ideasOrganisationGradingAgent } = require('../prompts/speakingGradingAgent');

            prompt = ideasOrganisationGradingAgent
                .replace(/{STUDENT_RESPONSES}/g, studentResponses)
                .replace(/{ORGANISATION_DATA}/g, organisationData);
        } else {
            return res.status(400).json({ error: 'Invalid or unsupported module for submission' });
        }

        const GamificationService = require('../services/GamificationService');

        console.log(`[Speaking Quest] Grading ${module} Quest ${quest_id} for ${uid}`);

        let result;
        try {
            console.log(`[SpeakingQuest] Prompt Construction Source - Level: ${level}, Focus: ${focus}`);
            console.log(`[SpeakingQuest] Final Prompt for AI:`, prompt.substring(0, 500) + '...');

            result = await GenerativeAIService.generateJson(prompt, {
                generationConfig: { temperature: 0.3 }
            });

            console.log(`[SpeakingQuest] Raw Response Object Received:`, JSON.stringify(result.data, null, 2));
        } catch (aiError) {
            console.error(`[Speaking ${module}] AI Grading failed:`, aiError);
            // Module-specific fallback scores
            const isInteraction = module === 'interaction' || module === 'strategies' || req.body.mode === 'lab';
            result = {
                data: {
                    scores: isInteraction
                        ? { total: 16, facilitation: 4, listening: 4, turn_taking: 4, bridging: 4 }
                        : { 
                            total: 16, 
                            development: 4,
                            relevance: 4,
                            signposting: 4,
                            organisation: 4,
                            pronunciation: 4, 
                            intonation: 4, 
                            vocabulary: 4, 
                            grammar_range: 4,
                            grammar: 4 
                        },
                    feedback: { 
                        summary: "AI analysis is currently congested, but your effort is noted.", 
                        pros: ["You completed the speaking session."],
                        cons: ["AI grading was unavailable for this attempt."],
                        improvement_advice: "Focus on adding one concrete example to every main point you make in your next session." 
                    }
                }
            };
        }

        // Standardize result structure (ensure result.scores exists)
        const finalResult = result.data || result;
        console.log(`[SpeakingQuest] Standardized Final Result:`, JSON.stringify(finalResult, null, 2));

        // Normalize interaction module scores to match frontend expectations
        // Backend grading agent outputs: facilitation, listening, turn_taking, bridging
        // Frontend review page expects: delivery, strategies, language, organisation
        if (module === 'interaction' && finalResult.scores) {
            const scores = finalResult.scores;
            // Only remap if the old field names exist and new ones don't
            if (scores.facilitation !== undefined && scores.strategies === undefined) {
                scores.strategies = scores.facilitation;
            }
            if (scores.listening !== undefined && scores.delivery === undefined) {
                scores.delivery = scores.listening;
            }
            if (scores.turn_taking !== undefined && scores.language === undefined) {
                scores.language = scores.turn_taking;
            }
            if (scores.bridging !== undefined && scores.organisation === undefined) {
                scores.organisation = scores.bridging;
            }
            console.log(`[SpeakingQuest] Normalized interaction scores:`, JSON.stringify(scores));
        }

        // Normalize feedback to match SpeakingResultPage expectations
        const normalizedFeedback = {
            summary: finalResult.feedback?.summary || 'Great effort in your speaking practice!',
            strengths: finalResult.feedback?.strengths || [
                finalResult.feedback?.peel_analysis || 'Good structural organization'
            ].filter(Boolean),
            weaknesses: finalResult.feedback?.weaknesses || [
                finalResult.feedback?.improvement_advice || 'Continue practicing fluency'
            ].filter(Boolean),
            improvement_advice: finalResult.feedback?.improvement_advice || 'Keep practicing to improve your speaking skills.'
        };

        // PERSIST RESULT FOR HISTORICAL REVIEW
        let resultId = null;
        if (resolvedUid && resolvedUid !== 'guest') {
            resultId = await UserProfileService.saveQuestResult(resolvedUid, {
                module,
                quest_id,
                scores: finalResult.scores,
                feedback: normalizedFeedback,
                word_analysis: finalResult.word_analysis || [],
                transcript: historyToGrade || [],
                level: parseInt(level),
                focus,
                subject: 'english',
                paper: 'Speaking',
                missionName: req.body.missionName || `${module.charAt(0).toUpperCase() + module.slice(1)} Quest`,
                audioUrl: audioUrl || null
            });
        }

        // AWARD XP
        let xpResult = { earned: 0 };
        if (finalResult.scores && finalResult.scores.total > 0 && resolvedUid && resolvedUid !== 'guest') {
            // New standardized XP logic — all modules use tier table
            const GamificationService = require('../services/GamificationService');
            let baseXP = GamificationService.getTieredXP(level || '4');

            let questBonus = 0;
            // Handle Weekly Quest award
            if (req.body.isWeeklyQuest) {
                const weeklyResult = await GamificationService.awardWeeklyQuestCompletion(resolvedUid);
                if (weeklyResult.success) {
                    questBonus = weeklyResult.earned;
                    baseXP = 250; // Set base to weekly standard
                }
            }

            const scoreRatio = Math.min(finalResult.scores.total / 28, 1);
            const rewardAmount = Math.round(scoreRatio * baseXP);

            xpResult = await GamificationService.awardXP(resolvedUid, rewardAmount, 'speaking', {
                title: req.body.missionName || `${module.charAt(0).toUpperCase() + module.slice(1)} Practice`,
                score: `${finalResult.scores.total}/28`,
                subject: 'english',
                paper: 'Speaking',
                questName: req.body.missionName || `${module.charAt(0).toUpperCase() + module.slice(1)} Quest`,
                resultId: resultId
            }) || { earned: 0 };
            
            xpResult.earned += questBonus;

            // Check Weekly Focus bonus (Mon-Sat quests)
            const hkNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Hong_Kong' }));
            const hkDay = hkNow.getDay();
            const daysSinceMonday = hkDay === 0 ? 6 : hkDay - 1;
            const mondayDate = new Date(hkNow);
            mondayDate.setDate(hkNow.getDate() - daysSinceMonday);
            const weekKey = mondayDate.getFullYear() + '-' + String(mondayDate.getMonth() + 1).padStart(2, '0') + '-' + String(mondayDate.getDate()).padStart(2, '0');
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const dayOfWeek = dayNames[hkDay];
            const weeklyFocusResult = await GamificationService.awardWeeklyFocusBonus(resolvedUid, weekKey, dayOfWeek);
            if (weeklyFocusResult.bonusAwarded) {
                console.log(`[SpeakingRoutes] Weekly Focus bonus awarded: +${weeklyFocusResult.earned} XP to ${resolvedUid}`);
            }
            xpResult.earned += (weeklyFocusResult.earned || 0);
        }

        // UPDATE MICRO-SKILL MASTERY
        if (finalResult.scores && resolvedUid && resolvedUid !== 'guest') {
            const masteryScore = (finalResult.scores.total / 28) * 100;
            const skillMappings = {
                'delivery': ['speaking_delivery'],
                'flow': ['speaking_language', 'speaking_organization'],
                'interaction': ['speaking_pronunciationClarity', 'speaking_activeListening', 'speaking_vocabularyInSpeech', 'speaking_organisation'],
                'language_patterns': ['speaking_vocabularyInSpeech', 'speaking_grammaticalAccuracy'],
                'ideas_organisation': ['speaking_logicalDevelopment', 'speaking_organisation']
            };

            const targetSkills = skillMappings[module] || [];
            const skillPromises = targetSkills.map(skillId =>
                UserProfileService.updateMicroSkillLevel(resolvedUid, 'english', skillId, masteryScore, {
                    type: 'Quest',
                    difficulty: parseInt(level) || 3
                })
            );
            await Promise.all(skillPromises);
            await UserProfileService.saveProgressSnapshot(resolvedUid, 'english');
            console.log(`[SpeakingRoutes] Persisted mastery for skills: ${targetSkills.join(', ')}`);
        }

        res.json({
            scores: finalResult.scores,
            feedback: finalResult.feedback,
            word_analysis: finalResult.word_analysis || [],
            transcript: historyToGrade || [],
            xp_awarded: xpResult?.earned || 0,
            xp_breakdown: xpResult?.breakdown,
            audioUrl: audioUrl || null
        });
    } catch (error) {
        console.error('[Speaking Quest] Submission error:', error);
        res.status(500).json({ error: 'Failed to grade submission', details: error.message });
    }
});

/**
 * @route   POST /api/speaking/flow/respond
 * @desc    Get AI interviewer response for Flow module
 */
router.post('/flow/respond', async (req, res) => {
    try {
        const { quest_id, history = [], user_response, level, uid, focus } = req.body;

        // Build conversation context
        const conversationHistory = history.map(msg =>
            `${msg.role === 'ai' ? 'Interviewer' : 'Student'}: ${msg.text}`
        ).join('\n');

        const prompt = speakingFlowAgent
            .replace('{AI_PERSONA}', 'Interviewer')
            .replace('{SCENARIO}', 'Interview')
            .replace('{TOPIC}', 'General Flow')
            .replace('{LEVEL}', level)
            .replace('{POWER_WORDS}', 'N/A')
                .replace('{HISTORY}', conversationHistory)
                .replace('{LAST_RESPONSE}', user_response);

        console.log(`[Speaking Flow] Generating response for ${uid}`);

        const result = await GenerativeAIService.generateContent(prompt, {
            generationConfig: {
                maxOutputTokens: 250,
                temperature: 0.7 // Phase 48: Increased from 0.2 to reduce robotic repetition
            }
        });

        const parsedResult = typeof result.text === 'string' ? JSON.parse(result.text) : (result.data || result);

        const topicFallback = focus || topic || "this topic";
        res.json({
            feedback_text: parsedResult.feedback_text || "Good attempt. Try to elaborate more using the mind map.",
            question: parsedResult.question || `Could you elaborate on how your point relates to ${topicFallback}?`,
            structural_hints: parsedResult.structural_hints || [],
            is_follow_up: parsedResult.is_follow_up || false
        });
    } catch (error) {
        console.error('[Speaking Flow] Response error:', error);
        res.status(500).json({ error: 'Failed to generate response', details: error.message });
    }
});

/**
 * @route   POST /api/speaking/interaction/turn
 * @desc    Get AI candidate response for Interaction module
 */
router.post('/interaction/turn', upload.single('audio'), async (req, res) => {
    try {
        const { history: historyStr, current_speaker, topic, level, uid, focus, user_transcript: clientTranscript, user_name } = req.body;
        const history = typeof historyStr === 'string' ? JSON.parse(historyStr) : (historyStr || []);
        const audioFile = req.file;
        
        console.log(`[Speaking Interaction Turn] Request received: speaker=${current_speaker}, topic="${topic}", level=${level}, historyLength=${history.length}`);

        // Build conversation history string
        const userLabel = req.body.mode === 'lab' ? 'Student' : 'Candidate_D';
        // Use the student's actual display name if available, otherwise fallback to userLabel
        const userDisplayName = (user_name && user_name.trim() && user_name !== 'Student') ? user_name.trim() : userLabel;

        let conversationHistory = history.map(turn => {
            const speakerLabel = (turn.speaker === 'Student' || turn.role === 'user') ? userDisplayName : (turn.speaker || 'Candidate_A').replace(' ', '_');
            return `${speakerLabel}: ${turn.text}`;
        }).join('\n');
        
        // Ensure the latest transcript is in the history string for the AI to see (De-duplication logic)
        if (clientTranscript && !conversationHistory.toLowerCase().includes(clientTranscript.toLowerCase().substring(0, 15))) {
            conversationHistory += `\n${userDisplayName}: ${clientTranscript}`;
        }

        // Use fast prompt for lab mode (shorter, no JSON required)
        const isLabMode = req.body.mode === 'lab';
        let prompt;
        
        if (isLabMode) {
            prompt = speakingAgentFast
                .replace(/{TOPIC}/g, topic)
                .replace(/{HISTORY}/g, conversationHistory)
                .replace(/{MY_IDENTITY}/g, current_speaker || 'Candidate_A')
                .replace(/{USER_LABEL}/g, userDisplayName)
                .replace(/{LEVEL}/g, level || '3');
        } else {
            // Instruction to ensure JSON adherence (Reasoning length now handled by prompt template)
            const formatMandate = `\nIMPORTANT: Return your response as a valid json object. No extra text outside the json.`;

            prompt = speakingAgent
                .replace(/{TOPIC}/g, topic)
                .replace(/{HISTORY}/g, conversationHistory)
                .replace(/{MY_IDENTITY}/g, current_speaker || 'Candidate_A')
                .replace(/{USER_LABEL}/g, userDisplayName)
                .replace(/{LEVEL}/g, level || '3');

            // Inject format mandate at the end of the context
            prompt += formatMandate;
        }

        // NAME ENFORCEMENT: Re-inject at the end of the prompt to override any confusion from history
        prompt += `\n\n=== FINAL NAME CHECK ===\n`;
        prompt += `Your name: ${current_speaker || 'Candidate_A'}\n`;
        prompt += `Student's name (EXCLUSIVELY): "${userDisplayName}"\n`;
        prompt += `FORBIDDEN: Never call the student "Annie", "Candidate_A", "Ben", "Charlie", or any name other than "${userDisplayName}".\n`;
        prompt += `If the history shows "Annie:" or "Candidate_A:", that is ANOTHER PERSON — NOT the student.\n`;
        prompt += `Remember to return your response in valid json format.\n`;
        prompt += `========================\n`;

        // Phase 48: Anti-Hallucination - If history is empty OR student hasn't spoken yet, forbid referencing them
        const hasStudentSpoken = history.some(m => 
            m.role === 'user' || m.role === 'Student' || m.speaker === 'Student' || m.speaker === 'Candidate_D' || m.speaker === userLabel
        );

        if (!hasStudentSpoken) {
            prompt += "\nIMPORTANT: The student has NOT spoken yet. Do NOT mention, quote, or agree with them. Focus on your own points and engaging with other candidates.";
        } else if (!conversationHistory || conversationHistory.trim().length === 0) {
            prompt += "\nIMPORTANT: This is the very beginning of the discussion. Do NOT reference what other candidates said yet. Start by stating your own initial perspective on the topic.";
        }
        
        console.log(`[Speaking Interaction Turn] Prompt built: length=${prompt.length}, topic="${topic}", speaker=${current_speaker}, hasStudentSpoken=${hasStudentSpoken}`);
        console.log(`[Speaking Interaction Turn] Prompt contains 'json': ${prompt.toLowerCase().includes('json')}`);
        console.log(`[Speaking Interaction Turn] Conversation history:\n${conversationHistory || '(empty)'}`);

        // Voice mapping based on role
        const voiceMap = {
            'Candidate_A': 'Achird', // Annie: Sophisticated Female
            'Candidate_B': 'Puck',   // Ben: Competent Male
            'Candidate_C': 'Charon', // Charlie: Hesitant Male
            'Examiner': 'Achird'     // Miss Janie
        };
        const voiceName = voiceMap[current_speaker] || 'Achird';

        const speechConfig = {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } }
        };

        const genAIConfig = {
            model: 'ace-it-flash',
            audioOutput: req.body.audioOutput === true || req.body.audioOutput === 'true', // Hard Boolean Check
            speechConfig: speechConfig,
            generationConfig: { 
                temperature: 0.7,
                // Don't force JSON mime type for speaking — DeepSeek requires 'json' in prompt
                // which can be unreliable. Instead rely on prompt instructions + manual parsing.
                responseMimeType: isLabMode ? "text/plain" : null
            }
        };

        let result;
        // FAST PATH: If client provided transcription, use it to bypass or speed up multimodal STT
        if (clientTranscript) {
             console.log(`[Interaction Turn] Fast Path Triggered. Client provided transcript: ${clientTranscript.substring(0, 30)}...`);
             const fastPrompt = isLabMode 
                ? `${prompt}\n\n[USER JUST SAID]: ${clientTranscript}\n\nREPLY WITH ONLY YOUR SPOKEN RESPONSE.`
                : `${prompt}\n\n[USER JUST SAID]: ${clientTranscript}\n\nREPLY IN JSON FORMAT. Your response must be a valid json object.`;
             
             if (audioFile) {
                const parts = [
                    { text: fastPrompt },
                    {
                        inlineData: {
                            data: audioFile.buffer.toString('base64'),
                            mimeType: audioFile.mimetype
                        }
                    }
                ];
                result = isLabMode 
                    ? await GenerativeAIService.generateContent(parts, genAIConfig)
                    : await GenerativeAIService.generateJson(parts, genAIConfig);
             } else {
                result = isLabMode
                    ? await GenerativeAIService.generateContent(fastPrompt, genAIConfig)
                    : await GenerativeAIService.generateJson(fastPrompt, genAIConfig);
             }
        } else if (audioFile) {
            console.log(`[Interaction Turn] Multimodal Audio detected. Fusing Text + Voice pass...`);
            
            // For JSON mode (non-lab), don't send audio to DeepSeek — it can't process audio
            // and the JSON mode fails when content is an array. Just send text prompt.
            if (isLabMode) {
                const parts = [
                    { text: prompt },
                    {
                        inlineData: {
                            data: audioFile.buffer.toString('base64'),
                            mimeType: audioFile.mimetype
                        }
                    }
                ];
                result = await GenerativeAIService.generateContent(parts, genAIConfig);
            } else {
                // JSON mode: send text-only prompt to ensure DeepSeek can enforce JSON output
                result = await GenerativeAIService.generateJson(prompt, genAIConfig);
            }
        } else {
            result = isLabMode
                ? await GenerativeAIService.generateContent(prompt, genAIConfig)
                : await GenerativeAIService.generateJson(prompt, genAIConfig);
        }

        let aiContent;
        let transcribedUserText;
        let prosodyMetrics;
        
        if (isLabMode) {
            // Fast mode: response is plain text
            aiContent = result?.data?.content || result?.response?.text?.() || null;
            transcribedUserText = clientTranscript || "";
            prosodyMetrics = null;
        } else {
            // Full mode: response is JSON
            aiContent = result?.data?.content || null;
            transcribedUserText = clientTranscript || result?.data?.user_transcript || "";
            prosodyMetrics = result?.data?.prosody_metrics || null;
        }
        
        const aiAudio = result?.audio;

        // POST-PROCESS: Replace any "Annie" references to the student with the correct name
        if (aiContent && userDisplayName && userDisplayName !== 'Annie') {
            const originalContent = aiContent;
            // Replace "Annie" when it appears to refer to the student (not at start of sentence referring to self)
            // Pattern: "Annie, you..." or "I agree with Annie" or "Annie said..." etc.
            aiContent = aiContent.replace(/\bAnnie\b/g, userDisplayName);
            if (aiContent !== originalContent) {
                console.log(`[Speaking Interaction] Name fix applied: replaced "Annie" with "${userDisplayName}"`);
            }
        }

        if (!aiContent && !aiAudio) {
            console.error(`[Speaking Interaction] CRITICAL: AI returned null content and audio. Result Info:`, JSON.stringify({ model: result?.usedModel, data: result?.data }));
        }

        console.log(`[Speaking Interaction] AI Respond: "${aiContent ? aiContent.substring(0, 80) : 'NULL'}..." | Audio: ${aiAudio ? 'YES' : 'NO'} | Prosody: ${prosodyMetrics ? 'YES' : 'NO'}`);

        if (!aiContent) {
            console.error(`[Speaking Interaction] CRITICAL: AI returned null content for topic="${topic}", speaker=${current_speaker}`);
        }

        res.json({
            content: aiContent || `I see what you mean. However, we should also consider different perspectives on this topic, particularly how it affects various groups in our society.`,
            speaker: current_speaker,
            user_transcript: transcribedUserText,
            prosody_metrics: prosodyMetrics,
            audio: aiAudio
        });

    } catch (error) {
        console.error('[Speaking Interaction] Turn error:', error);
        res.status(500).json({ error: 'Failed to generate turn', details: error.message });
    }
});

/**
 * @route   POST /api/speaking/interaction/batch
 * @desc    Generate multiple AI candidate turns at once for natural group discussion flow
 */
router.post('/interaction/batch', async (req, res) => {
    try {
        const { history: historyStr, topic, level, uid, user_name } = req.body;
        const history = typeof historyStr === 'string' ? JSON.parse(historyStr) : (historyStr || []);
        
        const userLabel = 'Candidate_D';
        const userDisplayName = (user_name && user_name.trim() && user_name !== 'Student') ? user_name.trim() : userLabel;
        
        // Build conversation history string
        const conversationHistory = history.map(turn => {
            const speakerLabel = (turn.speaker === 'Student' || turn.role === 'user') ? userDisplayName : (turn.speaker || 'Candidate_A').replace(' ', '_');
            return `${speakerLabel}: ${turn.text}`;
        }).join('\n');
        
        console.log(`[Speaking Batch] Generating batch turns for topic="${topic}", historyLength=${history.length}`);
        
        // Generate all 3 candidates' next turns in a single prompt
        const batchPrompt = `You are generating the next round of a group discussion about "${topic}".

CONVERSATION HISTORY:
${conversationHistory || '(No previous conversation)'}

YOUR TASK:
Generate the NEXT 3 turns of discussion, one for each candidate. Each candidate must respond to the PREVIOUS speaker's specific point with a NEW, insightful angle. Do NOT just agree — always add something fresh.

CANDIDATE PERSONAS:
- Annie (Candidate_A): Spirited, intellectually curious, loves debate. British accent. She should be the most competitive.
- Ben (Candidate_B): Competent, clear structure. Neutral accent. He bridges different viewpoints.
- Charlie (Candidate_C): Hesitant but willing to participate. He asks thoughtful questions and brings practical concerns.

RULES:
1. Each turn must reference the SPECIFIC point made by the previous speaker (quote or paraphrase it).
2. Each turn must add a COMPLETELY NEW angle, example, or contrasting viewpoint.
3. Use different vocabulary — never repeat words from previous turns.
4. Stay focused on "${topic}". No drifting to unrelated subjects.
5. Sound like natural 17-year-old Hong Kong students in a DSE exam.
6. Length: 2-3 sentences per turn (max 40 words each).

OUTPUT FORMAT — Return a valid json object with a "turns" array:
{
  "turns": [
    {"speaker": "Candidate_A", "content": "Annie's response referencing the previous point and adding a new angle"},
    {"speaker": "Candidate_B", "content": "Ben's response referencing Candidate_A's point and adding a new angle"},
    {"speaker": "Candidate_C", "content": "Charlie's response referencing Candidate_B's point and adding a new angle"}
  ]
}`;

        const genAIConfig = {
            model: 'ace-it-flash',
            generationConfig: { 
                temperature: 0.8,
                responseMimeType: "application/json"
            }
        };
        
        const result = await GenerativeAIService.generateJson(batchPrompt, genAIConfig);
        const turns = result?.data || [];
        
        // Validate the response
        const validTurns = Array.isArray(turns) ? turns : (turns.turns || []);
        
        console.log(`[Speaking Batch] Generated ${validTurns.length} turns`);
        validTurns.forEach((t, i) => {
            console.log(`[Speaking Batch] Turn ${i + 1} (${t.speaker}): "${t.content?.substring(0, 60)}..."`);
        });
        
        res.json({ turns: validTurns });
        
    } catch (error) {
        console.error('[Speaking Batch] Error:', error);
        res.status(500).json({ error: 'Failed to generate batch turns', details: error.message });
    }
});

/**
 * @route   POST /api/speaking/mock/submit
 * @desc    Submit full Speaking Mock (Discussion + Individual) for grading
 */
router.post('/mock/submit', async (req, res) => {
    try {
        const { uid, mockData, chatHistory, individualQuestion, individualResponse } = req.body;

        if (!uid || !mockData || !chatHistory) {
            return res.status(400).json({ error: 'Missing required data for grading' });
        }

        // FETCH USER TIER
        let tier = 'free';
        if (uid) {
            const UserProfileService = require('../services/UserProfileService');
            const profile = await UserProfileService.getProfile(uid);
            tier = profile?.subscription_tier || 'free';
        }

        // Extract accumulated pronunciation metrics from chat history if present
        const pronunciationMetrics = req.body.pronunciationMetrics
            ? (typeof req.body.pronunciationMetrics === 'string' ? JSON.parse(req.body.pronunciationMetrics) : req.body.pronunciationMetrics)
            : null;

        console.log(`[SpeakingMock] Submitting full mock for user: ${uid} (Tier: ${tier})`);
        const result = await SpeakingMockGradingService.gradeFullMock(
            uid, mockData, chatHistory, individualQuestion, individualResponse, tier, pronunciationMetrics
        );

        // Save quest result for mock unlock tracking
        if (uid && uid !== 'guest') {
            try {
                const UserProfileService = require('../services/UserProfileService');
                await UserProfileService.saveQuestResult(uid, {
                    ...result,
                    type: 'SPEAKING',
                    topic: mockData.topic || 'Speaking Mock',
                    paper: 'Speaking',
                    mockId: mockData.mockId || mockData.id || `speaking_mock_${Date.now()}`
                });
            } catch (e) {
                console.warn('[SpeakingMock] saveQuestResult failed:', e.message);
            }
        }

        res.json(result);
    } catch (error) {
        console.error('[SpeakingMock] Submission error:', error);
        res.status(500).json({ error: 'Failed to process Speaking Mock result', details: error.message });
    }
});

/**
 * @route   POST /api/speaking/tts
 * @desc    Synthesize speech using Azure Neural TTS (Premium tier only)
 */
router.post('/tts', async (req, res) => {
    try {
        const { text, role, uid } = req.body;
        
        if (!text || !text.trim()) {
            return res.status(400).json({ error: 'Text is required' });
        }
        
        // Check user tier — Azure Neural TTS is Premium-only
        let tier = 'free';
        if (uid && uid !== 'guest') {
            try {
                const profile = await UserProfileService.getProfile(uid);
                tier = profile?.subscription_tier || 'free';
            } catch (e) {
                console.warn('[Azure TTS] Could not fetch user tier, defaulting to free:', e.message);
            }
        }
        
        const isPremium = tier === 'premium';
        const validRoles = ['Examiner', 'Candidate_A', 'Candidate_B', 'Candidate_C'];
        const speakerRole = validRoles.includes(role) ? role : 'Examiner';
        
        if (!isPremium) {
            console.log(`[Azure TTS] User ${uid} tier=${tier} — Azure TTS is Premium-only. Returning fallback signal.`);
            return res.json({
                audio: null,
                role: speakerRole,
                format: 'audio/mp3',
                fallback: true,
                reason: 'premium_required',
                message: 'Azure Neural TTS requires Premium subscription. Using browser TTS fallback.'
            });
        }
        
        console.log(`[Azure TTS] Premium user ${uid} — Synthesizing for ${speakerRole}: "${text.substring(0, 50)}..."`);
        const audioBase64 = await AzureTTSService.synthesize(text, speakerRole);
        
        res.json({
            audio: audioBase64,
            role: speakerRole,
            format: 'audio/mp3',
            fallback: false
        });
    } catch (error) {
        console.error('[Azure TTS] Error:', error.message);
        res.status(500).json({ 
            error: 'TTS synthesis failed', 
            details: error.message,
            fallback: true 
        });
    }
});

/**
 * @route   GET /api/speaking/tts/voices
 * @desc    List available Azure Neural voices
 */
router.get('/tts/voices', async (req, res) => {
    try {
        const voices = await AzureTTSService.listVoices();
        res.json({ voices });
    } catch (error) {
        console.error('[Azure TTS] List voices error:', error.message);
        res.status(500).json({ error: 'Failed to list voices', details: error.message });
    }
});

module.exports = router;
