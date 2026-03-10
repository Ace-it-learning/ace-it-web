import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GeometryRenderer from '../components/maths/GeometryRenderer';
import {
    ArrowLeft,
    Zap,
    CheckCircle,
    XCircle,
    Flag,
    Image as ImageIcon,
    Layers,
    ChevronRight,
    ChevronLeft,
    Monitor,
    Database,
    Cpu,
    Loader2,
    Calendar,
    Target,
    BarChart3,
    BookOpen,
    RefreshCw,
    Sparkles,
    Volume2,
    Play,
    Pause,
    VolumeX,
    Info,
    Search,
    Eye,
    Trash2
} from 'lucide-react';
import { MICRO_SKILLS, getSkillsByPaper } from '../constants/microSkills';
import { MATH_MICRO_SKILLS } from '../constants/mathMicroSkills';
import { SafeInlineMath, SafeBlockMath } from '../components/maths/SafeMath';
import { formatNumbers, sanitizeMath, prepareMathText, splitContentByDelimiters, looksLikeMath } from '../utils/mathFormattingUtils';

const QuestFactoryPage = () => {
    const navigate = useNavigate();

    // Factory Configuration
    const [subject, setSubject] = useState('English');
    const [paper, setPaper] = useState('reading');
    const [topic, setTopic] = useState('reading_inference');
    const [selectedTiers, setSelectedTiers] = useState(['easy']);
    const [totalCount, setTotalCount] = useState(10);
    const [questMode, setQuestMode] = useState('general'); // 'general' | 'weekly'
    const [proposedThemes, setProposedThemes] = useState([]);
    const [selectedTheme, setSelectedTheme] = useState('');
    const [weeklyBatchIndex, setWeeklyBatchIndex] = useState(0);
    const [weeklyPassage, setWeeklyPassage] = useState(null);
    const [weeklyTotalGenerated, setWeeklyTotalGenerated] = useState(0);
    const [weeklyPaper, setWeeklyPaper] = useState('reading'); // 'reading' | 'writing'
    const [selectedClusterIds, setSelectedClusterIds] = useState(['PCT_01_COMPOUND_GROWTH']); // Math specific: supports multi-selection

    // Skill clusters — matches backend
    const SKILL_CLUSTERS = [
        { skills: ['reading_literalComprehension', 'reading_inference', 'reading_mainIdea'], label: 'Comprehension Core' },
        { skills: ['reading_detailRecognition', 'reading_sequencing', 'reading_synthesis'], label: 'Analysis & Structure' },
        { skills: ['reading_factVsOpinion', 'reading_authorPurpose', 'reading_toneAttitude'], label: 'Critical Evaluation' },
        { skills: ['reading_registerStyle', 'reading_metaphoricalLanguage', 'reading_textOrganization'], label: 'Language & Style' },
        { skills: ['reading_paraphrasing', 'reading_cohesionReference', 'reading_skimmingScanning'], label: 'Applied Skills' }
    ];

    // DSE-Compliant Theme Pool for Weekly Quest proposals
    const DSE_THEME_POOL = [
        "Technology in Education (e.g., AI tutors, VR classrooms)",
        "Urban Development vs. Nature (e.g., Green roofs, micro-parks)",
        "Cultural Preservation (e.g., Cantonese Opera, Neon signs)",
        "Mental Health & Well-being (e.g., Digital detox, Academic pressure)",
        "The Gig Economy & Future of Work (e.g., Slash careers, Remote work)",
        "Sustainable Living (e.g., Zero-waste, Fast fashion impact)",
        "Space Exploration & Science (e.g., Mars colonization, Ocean cleanup)",
        "Intergenerational Relationships (e.g., Elderly care, communication gaps)",
        "Smart Cities & IoT (e.g., Automated transport, data privacy)",
        "Global Citizenship (e.g., Voluntourism, ethical travel)",
        "Traditional Arts in Modern Society (e.g., Calligraphy revival)",
        "Food Culture & Identity (e.g., Evolution of Dim Sum, localized cuisines)",
        "Sports & Resilience (e.g., E-sports legitimacy, Paralympians)",
        "Consumer Psychology (e.g., Influencer marketing, online shopping habits)"
    ];

    const shuffleThemes = () => {
        const shuffled = [...DSE_THEME_POOL].sort(() => Math.random() - 0.5);
        const three = shuffled.slice(0, 3);
        setProposedThemes(three);
        setSelectedTheme(three[0]);
    };

    useEffect(() => {
        if (questMode === 'weekly') shuffleThemes();
    }, [questMode]);

    // Persist assembly line configuration
    useEffect(() => {
        const saved = localStorage.getItem('quest_factory_config');
        if (saved) {
            try {
                const config = JSON.parse(saved);
                if (config.subject) setSubject(config.subject);
                if (config.paper) setPaper(config.paper);
                if (config.topic) setTopic(config.topic);
                if (config.selectedTiers) setSelectedTiers(config.selectedTiers);
                if (config.totalCount) setTotalCount(config.totalCount);
                if (config.selectedClusterIds) setSelectedClusterIds(config.selectedClusterIds);
            } catch (e) {
                console.error("Failed to load factory config", e);
            }
        }
    }, []);

    useEffect(() => {
        const config = { subject, paper, topic, selectedTiers, totalCount, selectedClusterIds };
        localStorage.setItem('quest_factory_config', JSON.stringify(config));
    }, [subject, paper, topic, selectedTiers, totalCount, selectedClusterIds]);

    const [activeMode, setActiveMode] = useState('generator'); // 'generator' | 'audit'
    const [pendingQuests, setPendingQuests] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [auditResults, setAuditResults] = useState([]);
    const [auditSearch, setAuditSearch] = useState({ subject: 'Maths', topic: '', status: 'Pending', level: 'All' });
    const [selectedAuditIds, setSelectedAuditIds] = useState([]);
    const [isAuditLoading, setIsAuditLoading] = useState(false);
    const [showAuditPreview, setShowAuditPreview] = useState(null); // id of quest to preview
    const [adminSecret, setAdminSecret] = useState("ace-it-admin-secret-123");
    const [showChinese, setShowChinese] = useState(false);

    const subjects = ['English', 'Maths'];
    const papers = [
        { id: 'reading', label: 'P1: Reading' },
        { id: 'writing', label: 'P2: Writing' },
        { id: 'listening', label: 'P3: Listening' },
        { id: 'speaking', label: 'P4: Speaking' }
    ];

    const getEnglishTopicsByPaper = (p) => {
        const skills = getSkillsByPaper(p);
        // For writing, only show the 12 genres in the factory topics
        if (p === 'writing') {
            return skills.filter(id => id.startsWith('writing_genre_'));
        }
        // For listening, show factory topics
        if (p === 'listening') {
            return [
                'Campus Radio Proposal',
                'Complaint Hotline',
                'University Interview',
                'Technology Podcast',
                'Police Report',
                'School Heritage Tour Itinerary',
                'Student Union Election Campaign',
                'Library Renovation Proposal',
                'Drama Club Annual Production',
                'International Exchange Student Welcoming',
                'School Canteen Quality Survey',
                'Community Garden Project',
                'Heritage Building Conservation',
                'Sustainable Living Workshop',
                'Street Performance (Busking) Regulation',
                'Charity Marathon Logistics',
                'Summer Internship Orientation',
                'Career Fair Preparation',
                'Workplace Safety Training',
                'Staff Well-being Seminar',
                'Local Food Culture Documentary',
                'Music Festival Volunteer Info',
                'Modern Art Museum Audio Guide',
                'Travel Agency Itinerary Planning'
            ];
        }
        return skills;
    };

    const topics = subject === 'English'
        ? getEnglishTopicsByPaper(paper)
        : Object.keys(MATH_MICRO_SKILLS);

    // Reading & Listening & Writing = 1 passage/recording/situation + 5-8 questions or 4 model answers per quest
    const isPassageBased = (paper === 'reading' || paper === 'listening' || paper === 'writing') && subject === 'English';

    const availableTiers = [
        { id: 'easy', label: 'Easy', dse: '2-3', xp: 50 },
        { id: 'medium', label: 'Medium', dse: '4', xp: 75 },
        { id: 'standard', label: 'DSE Standard', dse: '5', xp: 100 },
        { id: 'elite', label: 'Elite', dse: '5*/5**', xp: 150 }
    ];

    useEffect(() => {
        console.log("[QuestFactory] Initializing...");
        console.log("[QuestFactory] VITE_API_URL:", import.meta.env.VITE_API_URL);
        fetchPending();
    }, []);

    const fetchPending = async () => {
        setIsLoading(true);
        console.log("[QuestFactory] Fetching pending quests...");
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "";
            const endpoint = `${apiUrl}/api/admin/quests/pending`;
            console.log(`[QuestFactory] Requesting: ${endpoint}`);

            const res = await fetch(endpoint, {
                headers: { 'x-admin-secret': adminSecret }
            });

            console.log("[QuestFactory] Response Status:", res.status);

            if (!res.ok) {
                throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
            }

            const data = await res.json();
            console.log(`[QuestFactory] Received ${Array.isArray(data) ? data.length : 'non-array'} items.`);

            if (Array.isArray(data)) {
                // Group Writing quests by passage for multi-level audit
                const groupWriting = (quests) => {
                    const final = [];
                    const writingGroups = new Map();

                    quests.forEach(q => {
                        const isWriting = q.topic?.startsWith('writing_');
                        if (isWriting && q.passage) {
                            if (!writingGroups.has(q.passage)) writingGroups.set(q.passage, []);
                            writingGroups.get(q.passage).push(q);
                        } else {
                            final.push(q);
                        }
                    });

                    writingGroups.forEach((subQuests, passage) => {
                        // Sort by levelLabel
                        subQuests.sort((a, b) => {
                            const order = { 'lvl_4': 1, 'lvl_5': 2, 'lvl_5s': 3, 'lvl_5ss': 4 };
                            return (order[a.levelLabel] || 99) - (order[b.levelLabel] || 99);
                        });
                        final.push({
                            ...subQuests[0],
                            isGroup: true,
                            modelAnswers: subQuests
                        });
                    });
                    return final;
                };

                const grouped = groupWriting(data);
                console.log(`[QuestFactory] Grouped into ${grouped.length} workstation items.`);
                setPendingQuests(grouped);
                setCurrentIndex(0);
            }
        } catch (e) {
            console.error("[QuestFactory] Fetch Pending Error:", e);
        } finally {
            console.log("[QuestFactory] Loading complete.");
            setIsLoading(false);
        }
    };

    const handleGenerate = async (batchOverride = null) => {
        if (questMode === 'general' && selectedTiers.length === 0) return alert("Please select at least one difficulty tier.");
        if (questMode === 'weekly' && !selectedTheme) return alert("Please select a theme for the Weekly Quest.");
        setIsGenerating(true);
        try {
            const currentBatch = batchOverride !== null ? batchOverride : weeklyBatchIndex;
            const body = questMode === 'weekly'
                ? {
                    subject: 'English',
                    topic: weeklyPaper === 'reading' ? 'reading_all' : 'writing_general',
                    tiers: ['standard'],
                    totalCount: 1, // Both Reading and Writing use 1 passage/situation unit per weekly click
                    questMode: 'weekly',
                    weeklyTheme: selectedTheme,
                    batchIndex: currentBatch,
                    existingPassage: weeklyPassage
                }
                : {
                    subject,
                    topic,
                    paper,
                    tiers: (subject === 'English' && paper === 'writing') ? ['standard'] : selectedTiers,
                    totalCount: isPassageBased ? 1 : parseInt(totalCount),
                    clusterIds: subject === 'Maths' ? selectedClusterIds : null,
                    isFactory: true
                };

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/quests/generate-batch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminSecret
                },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.success) {
                // Weekly: capture passage from batch 1 and track progress
                if (questMode === 'weekly') {
                    if (data.passage && !weeklyPassage) {
                        setWeeklyPassage(data.passage);
                    }
                    setWeeklyTotalGenerated(prev => prev + (data.count || 0));
                    setWeeklyBatchIndex(currentBatch + 1);
                }
                await fetchPending();
            } else {
                alert(`Generation failed: ${data.details || data.error}`);
            }
        } catch (e) {
            console.error("Generation failed:", e);
            alert("Generation failed. Check console/logs.");
        } finally {
            setIsGenerating(false);
        }
    };

    const [auditModelLevel, setAuditModelLevel] = useState(0); // 0 to 3 for lvl_4, 5, 5s, 5ss
    const [auditListeningTaskIndex, setAuditListeningTaskIndex] = useState(0); // 0-19 for missions
    const [currentlyPlayingAudioId, setCurrentlyPlayingAudioId] = useState(null);
    const [audioElement, setAudioElement] = useState(null);

    const [loadingAudioId, setLoadingAudioId] = useState(null);

    const playAudioSegment = async (segmentId, segmentData) => {
        // If already playing this segment, stop it
        if (currentlyPlayingAudioId === segmentId) {
            if (audioElement) {
                audioElement.pause();
                audioElement.currentTime = 0;
            }
            setCurrentlyPlayingAudioId(null);
            return;
        }

        // Stop any other playing audio
        if (audioElement) {
            audioElement.pause();
            audioElement.currentTime = 0;
        }

        let audioSource = segmentData.audio;

        // Lazy Fetch Logic
        if (!audioSource && segmentData.lazy) {
            try {
                setLoadingAudioId(segmentId);
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/lab/tts`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: segmentData.text,
                        gender: segmentData.gender,
                        accent: segmentData.lang === 'en-GB' ? 'UK' : 'US'
                    })
                });
                const data = await res.json();
                if (data.audio) {
                    audioSource = data.audio;
                    // Cache it locally so we don't fetch again
                    segmentData.audio = data.audio;
                }
            } catch (err) {
                console.error("Failed to fetch lazy audio:", err);
                alert("Audio fetch failed.");
                return;
            } finally {
                setLoadingAudioId(null);
            }
        }

        if (!audioSource) return;

        const audio = new Audio(`data:audio/mp3;base64,${audioSource}`);
        audio.onended = () => {
            setCurrentlyPlayingAudioId(null);
            setAudioElement(null);
        };

        setAudioElement(audio);
        setCurrentlyPlayingAudioId(segmentId);
        audio.play().catch(e => console.error("Play failed:", e));
    };

    const handleApprove = async () => {
        if (!pendingQuests[currentIndex]) return;
        const quest = pendingQuests[currentIndex];
        const questIds = quest.isGroup ? quest.modelAnswers.map(m => m.id) : [quest.id];

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/quests/approve-batch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminSecret
                },
                body: JSON.stringify({ questIds })
            });
            if (res.ok) {
                const updated = [...pendingQuests];
                updated.splice(currentIndex, 1);
                setPendingQuests(updated);
                if (currentIndex >= updated.length && updated.length > 0) {
                    setCurrentIndex(updated.length - 1);
                }
                setAuditModelLevel(0);
            }
        } catch (e) {
            console.error("Approval failed:", e);
        }
    };

    const handleReject = async () => {
        if (!pendingQuests[currentIndex]) return;
        const quest = pendingQuests[currentIndex];
        const questIds = quest.isGroup ? quest.modelAnswers.map(m => m.id) : [quest.id];

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/quests/reject-batch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminSecret
                },
                body: JSON.stringify({ questIds })
            });
            if (res.ok) {
                const updated = [...pendingQuests];
                updated.splice(currentIndex, 1);
                setPendingQuests(updated);
                if (currentIndex >= updated.length && updated.length > 0) {
                    setCurrentIndex(updated.length - 1);
                }
                setAuditModelLevel(0);
            }
        } catch (e) {
            console.error("Rejection failed:", e);
        }
    };

    const handleApproveAll = async () => {
        if (pendingQuests.length === 0) return;
        if (!window.confirm(`Are you sure you want to approve and release ALL ${pendingQuests.length} questions to the student bank?`)) return;

        setIsLoading(true);
        // Flat map to collect all IDs (including those inside groups)
        const questIds = pendingQuests.flatMap(q => q.isGroup ? q.modelAnswers.map(ma => ma.id) : [q.id]);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/quests/approve-batch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminSecret
                },
                body: JSON.stringify({ questIds })
            });
            const data = await res.json();
            if (data.success) {
                setPendingQuests([]);
                setCurrentIndex(0);
                alert(`Successfully approved and released ${data.count} questions.`);
            }
        } catch (e) {
            console.error("Batch approval failed:", e);
            alert("Batch approval failed. Check console.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAuditSearch = async () => {
        setIsAuditLoading(true);
        try {
            const params = new URLSearchParams({
                ...auditSearch,
                limit: 200 // Increase limit for audit view
            });
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/quests/search?${params.toString()}`, {
                headers: { 'x-admin-secret': adminSecret }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setAuditResults(data);
                setSelectedAuditIds([]);
            }
        } catch (e) {
            console.error("Audit search failed:", e);
        } finally {
            setIsAuditLoading(false);
        }
    };

    const handleAuditReleaseAll = async () => {
        const ids = selectedAuditIds.length > 0 ? selectedAuditIds : auditResults.filter(r => r.currentStatus !== 'Approved and Released').map(r => r.id);
        if (ids.length === 0) return alert("No questions to release.");
        if (!window.confirm(`Release ${ids.length} selected questions to students?`)) return;

        setIsAuditLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/quests/approve-batch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-admin-secret': adminSecret },
                body: JSON.stringify({ questIds: ids })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Successfully released ${data.count} questions.`);
                handleAuditSearch();
            }
        } catch (e) {
            console.error("Audit release failed:", e);
        } finally {
            setIsAuditLoading(false);
        }
    };

    const handleAuditRemoveAll = async () => {
        const ids = selectedAuditIds.length > 0 ? selectedAuditIds : auditResults.map(r => r.id);
        if (ids.length === 0) return alert("No questions to remove.");
        if (!window.confirm(`PERMANENTLY DELETE ${ids.length} selected questions? This cannot be undone.`)) return;

        setIsAuditLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/quests/delete-batch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-admin-secret': adminSecret },
                body: JSON.stringify({ questIds: ids })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Successfully removed ${data.count} questions.`);
                handleAuditSearch();
            }
        } catch (e) {
            console.error("Audit removal failed:", e);
        } finally {
            setIsAuditLoading(false);
        }
    };

    const handleDeleteCurrent = async () => {
        if (!pendingQuests[currentIndex]) return;
        const questId = pendingQuests[currentIndex].id;

        if (!window.confirm("Are you sure you want to remove THIS question from the generated pool? It will be permanently deleted.")) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/quests/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminSecret
                },
                body: JSON.stringify({ questId })
            });
            if (res.ok) {
                const updated = [...pendingQuests];
                updated.splice(currentIndex, 1);
                setPendingQuests(updated);
                if (currentIndex >= updated.length && updated.length > 0) {
                    setCurrentIndex(updated.length - 1);
                }
            }
        } catch (e) {
            console.error("Deletion failed:", e);
        }
    };

    const handleWipePending = async () => {
        if (!window.confirm("CRITICAL ACTION: This will permanently delete ALL unapproved questions from the database. This cannot be undone. Proceed?")) return;

        setIsLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/quests/wipe-pending`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminSecret
                }
            });
            const data = await res.json();
            if (data.success) {
                setPendingQuests([]);
                setCurrentIndex(0);
                alert(data.message || "All pending quests wiped successfully.");
            }
        } catch (e) {
            console.error("Wipe failed:", e);
            alert("Wipe failed. Check console.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTier = (tid) => {
        if (selectedTiers.includes(tid)) {
            setSelectedTiers(selectedTiers.filter(t => t !== tid));
        } else {
            setSelectedTiers([...selectedTiers, tid]);
        }
    };

    const getLevelLabel = (l) => {
        if (!l) return 'N/A';
        if (typeof l === 'string' && l.includes('Level')) {
            // Extract number/DSE string from "HKDSE Level 5 (Strong)" or "Level 5*"
            const match = l.match(/Level\s+([3-5]\*?\*?)/i);
            if (match) return match[1];
            return l.replace('HKDSE Level ', ''); // Fallback to simpler string
        }
        const val = parseInt(l);
        if (isNaN(val)) return l?.toString() || 'N/A';
        if (val === 6) return '5*';
        if (val === 7) return '5**';
        return val.toString();
    };

    const baseQuest = pendingQuests[currentIndex] || { id: '' };
    const currentQuest = (baseQuest.isGroup && baseQuest.modelAnswers)
        ? baseQuest.modelAnswers[auditModelLevel] || baseQuest
        : (baseQuest.type === 'listening_mission' && baseQuest.interactive_tasks)
            ? { ...baseQuest, ...baseQuest.interactive_tasks[auditListeningTaskIndex] }
            : baseQuest;

    const getTopicName = (tid) => {
        if (subject === 'English') return MICRO_SKILLS[tid]?.en?.name || tid;
        return MATH_MICRO_SKILLS[tid]?.en?.name || tid;
    };

    const renderMath = (displaySubtext) => {
        if (!displaySubtext) return null;

        // Safety: ensure it is a string
        if (typeof displaySubtext !== 'string') {
            if (typeof displaySubtext === 'number') displaySubtext = String(displaySubtext);
            else if (Array.isArray(displaySubtext)) displaySubtext = displaySubtext.join('\n');
            else displaySubtext = String(displaySubtext);
        }

        const cleanText = prepareMathText(displaySubtext);
        if (cleanText.includes('&')) {
            console.debug('[QuestFactory] Ampersand detected after prepareMathText! Input:', displaySubtext.substring(0, 100));
        }
        const parts = splitContentByDelimiters(cleanText);

        return (
            <span className="font-sans">
                {parts.map((part, i) => {
                    if (!part) return null;

                    const isBlock = (part.startsWith('\\[') && part.endsWith('\\]')) || (part.startsWith('$$') && part.endsWith('$$'));
                    const isInline = (part.startsWith('\\(') && part.endsWith('\\)')) || (part.startsWith('$') && part.endsWith('$'));

                    if (isBlock || isInline) {
                        let math = '';
                        if (part.startsWith('\\[')) math = part.slice(2, -2).trim();
                        else if (part.startsWith('\\(')) math = part.slice(2, -2).trim();
                        else if (part.startsWith('$$')) math = part.slice(2, -2).trim();
                        else math = part.slice(1, -1).trim();

                        const labeledMath = sanitizeMath(math);
                        const finalMath = formatNumbers(labeledMath, true);

                        // Version 1.5.5 Final Safeguard: Newline Neutralizer + Ampersand Purge
                        // We must ensure KaTeX never receives a literal newline in block mode.
                        let robustMath = finalMath.replace(/\n/g, ' ');
                        if (!robustMath.includes('\\begin{aligned}') && !robustMath.includes('\\begin{cases}') && !robustMath.includes('\\begin{array}')) {
                            robustMath = robustMath.replace(/\\?&/g, ' ');
                        }

                        if (isBlock) {
                            return (
                                <SafeBlockMath key={i} math={robustMath} className="my-2" />
                            );
                        } else {
                            return <SafeInlineMath key={i} math={robustMath} />;
                        }
                    }

                    return (
                        <span key={i}>
                            {part.split(/(?:\r?\n|(?=\.Step\s*\d+\s*:?))/).map((line, lineIdx, arr) => {
                                if (!line.trim() && arr.length > 1) {
                                    return <br key={lineIdx} />;
                                }
                                const trimmedLine = line.trim().replace(/^\./, '');
                                if (!trimmedLine) return null;

                                // Version 1.3.2: Only treat as math if it's NOT just the start of a parenthetical phrase or prose
                                const isMathLine = looksLikeMath(trimmedLine);

                                if (isMathLine) {
                                    const labeledMath = sanitizeMath(trimmedLine);
                                    const finalMath = formatNumbers(labeledMath, true);

                                    return (
                                        <SafeInlineMath key={lineIdx} math={finalMath} className="mx-1" />
                                    );
                                }

                                const restoredLine = line
                                    .replace(/\\text\{___HKD___\}/g, '___HKD___')
                                    .replace(/\\text\{___USD___\}/g, '___USD___')
                                    .replace(/___HKD___/g, 'HK$')
                                    .replace(/___USD___/g, '$')
                                    .replace(/\\,/g, ' ');

                                // Version 1.5.2: Strip naked AND escaped ampersands from prose path too.
                                const cleanProseLine = restoredLine
                                    .replace(/\\\[|\\\]|\\\(|\\\)/g, '')
                                    .replace(/(?<!\\)(?<!HK)\$/g, '')
                                    .replace(/\\?&/g, ' ');

                                return <span key={lineIdx} className="text-white">{formatNumbers(cleanProseLine)}</span>;
                            })}
                        </span>
                    );
                })}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-[#0f1115] text-white font-sans selection:bg-primary/30 text-white">
            {/* Top Navigation Bar */}
            <nav className="border-b border-white/10 bg-black sticky top-0 z-50 p-4 shadow-lg shadow-black/20">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate('/admin')} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-400" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold tracking-tight">Question Content Factory</h1>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Admin Manufacturing Plant • v2.1</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="password"
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs focus:outline-none focus:border-primary/50 text-white"
                            placeholder="Admin Secret"
                            value={adminSecret}
                            onChange={(e) => setAdminSecret(e.target.value)}
                        />
                        <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-bold text-gray-300">SYSTEM: ACTIVE</span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-[1400px] mx-auto p-6 lg:p-10">
                {/* Master Mode Toggle */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => setActiveMode('generator')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeMode === 'generator'
                            ? 'bg-primary text-black shadow-lg shadow-primary/20 scale-105'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                            }`}
                    >
                        <Cpu className="w-4 h-4" />
                        Generator Home
                    </button>
                    <button
                        onClick={() => {
                            setActiveMode('audit');
                            if (auditResults.length === 0) handleAuditSearch();
                        }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeMode === 'audit'
                            ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 scale-105'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                            }`}
                    >
                        <Search className="w-4 h-4" />
                        Quest Audit & Bank
                    </button>
                </div>

                {activeMode === 'generator' && (
                    <div className="grid grid-cols-12 gap-8">
                        {/* Left: Manufacturing Controls */}
                        <div className="col-span-12 lg:col-span-3 space-y-6">
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-primary" /> Assembly Line
                                </h3>

                                {/* Quest Mode Toggle */}
                                <div className="mb-6">
                                    <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl">
                                        <button
                                            onClick={() => setQuestMode('general')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${questMode === 'general'
                                                ? 'bg-white text-black shadow-lg'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            <Cpu className="w-3.5 h-3.5" />
                                            General Quest
                                        </button>
                                        <button
                                            onClick={() => setQuestMode('weekly')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${questMode === 'weekly'
                                                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            <BookOpen className="w-3.5 h-3.5" />
                                            Weekly Quest
                                        </button>
                                    </div>
                                </div>

                                {questMode === 'weekly' ? (
                                    /* Weekly Quest Configuration */
                                    <div className="space-y-5">
                                        <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Weekly Quest Mode</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 mt-3 mb-3">
                                                <button
                                                    onClick={() => { setWeeklyPaper('reading'); setWeeklyBatchIndex(0); setWeeklyPassage(null); setWeeklyTotalGenerated(0); }}
                                                    className={`py-1.5 rounded-lg text-[10px] font-black uppercase transition-all border ${weeklyPaper === 'reading' ? 'bg-indigo-500/20 border-indigo-500/40 text-white' : 'border-white/5 text-gray-500 hover:text-gray-300'}`}
                                                >
                                                    P1: Reading
                                                </button>
                                                <button
                                                    onClick={() => { setWeeklyPaper('writing'); setWeeklyBatchIndex(0); setWeeklyPassage(null); setWeeklyTotalGenerated(0); }}
                                                    className={`py-1.5 rounded-lg text-[10px] font-black uppercase transition-all border ${weeklyPaper === 'writing' ? 'bg-indigo-500/20 border-indigo-500/40 text-white' : 'border-white/5 text-gray-500 hover:text-gray-300'}`}
                                                >
                                                    P2: Writing
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-400 leading-relaxed">
                                                {weeklyPaper === 'reading'
                                                    ? <>Generates 1 DSE-standard passage + <span className="text-white font-bold">100 questions</span> across all 15 reading micro-skills. Level 5 locked.</>
                                                    : <>Generates a batch of <span className="text-white font-bold">Generic Writing Tasks</span> (Sentence practice, paragraph planning, tone adjustment). Level 5 locked.</>
                                                }
                                            </p>
                                        </div>

                                        {/* Theme Proposal */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2 px-1">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Passage Theme</label>
                                                <button
                                                    onClick={shuffleThemes}
                                                    className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                                                >
                                                    <RefreshCw className="w-3 h-3" />
                                                    Shuffle
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                {proposedThemes.map((theme, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setSelectedTheme(theme)}
                                                        className={`w-full p-3 rounded-xl text-left text-xs transition-all border ${selectedTheme === theme
                                                            ? 'bg-indigo-500/20 border-indigo-500/40 text-white shadow-sm'
                                                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-300'
                                                            }`}
                                                    >
                                                        <span className="font-bold">{i + 1}.</span> {theme}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-5">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 px-1">Subject</label>
                                            <select
                                                value={subject}
                                                onChange={(e) => {
                                                    const newSub = e.target.value;
                                                    setSubject(newSub);
                                                    if (newSub === 'Maths') {
                                                        setPaper(null); // Fix: clear paper so we don't pollute Maths with 'writing' state
                                                        setSelectedTiers(['easy', 'medium', 'standard', 'elite']); // Auto select all for easier control
                                                        setTopic('math_num_percentages');
                                                    } else {
                                                        const defaultPaper = 'reading';
                                                        setPaper(defaultPaper);
                                                        const filtered = getEnglishTopicsByPaper(defaultPaper);
                                                        setTopic(filtered[0] || 'reading_inference');
                                                    }
                                                }}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-primary text-white [&>option]:bg-[#1a1d23]"
                                            >
                                                {subjects.map(s => <option key={s} value={s} className="bg-[#1a1d23] text-white">{s}</option>)}
                                            </select>
                                        </div>

                                        {subject === 'English' && (
                                            <div>
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 px-1">DSE Paper</label>
                                                <select
                                                    value={paper}
                                                    onChange={(e) => {
                                                        const newPaper = e.target.value;
                                                        setPaper(newPaper);
                                                        const filtered = getEnglishTopicsByPaper(newPaper);
                                                        setTopic(filtered[0] || 'reading_inference');
                                                    }}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-primary text-white [&>option]:bg-[#1a1d23]"
                                                >
                                                    {papers.map(p => <option key={p.id} value={p.id} className="bg-[#1a1d23] text-white">{p.label}</option>)}
                                                </select>
                                            </div>
                                        )}

                                        <div>
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 px-1">Topic</label>
                                            <select
                                                value={topic}
                                                onChange={(e) => {
                                                    const newTopic = e.target.value;
                                                    setTopic(newTopic);
                                                    // Reset clusters when topic changes
                                                    if (newTopic === 'math_num_percentages') {
                                                        setSelectedClusterIds(['PCT_01_COMPOUND_GROWTH', 'PCT_02_COMMERCIAL']);
                                                    } else if (newTopic === 'math_alg_formulas') {
                                                        setSelectedClusterIds(['ALG_01_SUBSTITUTION', 'ALG_02_CHANGE_SUBJECT']);
                                                    } else {
                                                        setSelectedClusterIds([]);
                                                    }
                                                }}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-primary text-white [&>option]:bg-[#1a1d23]"
                                            >
                                                {topics.map(t => <option key={t} value={t} className="bg-[#1a1d23] text-white">{getTopicName(t)}</option>)}
                                            </select>
                                        </div>

                                        {subject === 'Maths' && (topic === 'math_num_percentages' || topic === 'math_alg_formulas') && (() => {
                                            const availableClusters = topic === 'math_num_percentages'
                                                ? [
                                                    { id: 'PCT_01_COMPOUND_GROWTH', label: 'Compound Interest & Growth' },
                                                    { id: 'PCT_02_COMMERCIAL', label: 'Profit, Loss & Discount' }
                                                ]
                                                : [
                                                    { id: 'ALG_01_SUBSTITUTION', label: 'Algebraic Substitution' },
                                                    { id: 'ALG_02_CHANGE_SUBJECT', label: 'Change of Subject' }
                                                ];

                                            const allIds = availableClusters.map(c => c.id);

                                            return (
                                                <div>
                                                    <div className="flex items-center justify-between mb-2 px-1">
                                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Specific Cluster</label>
                                                        <button
                                                            onClick={() => {
                                                                if (selectedClusterIds.length === allIds.length) {
                                                                    setSelectedClusterIds([]);
                                                                } else {
                                                                    setSelectedClusterIds(allIds);
                                                                }
                                                            }}
                                                            className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest"
                                                        >
                                                            {selectedClusterIds.length === allIds.length ? 'Deselect All' : 'Select All'}
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {availableClusters.map(c => (
                                                            <button
                                                                key={c.id}
                                                                onClick={() => {
                                                                    setSelectedClusterIds(prev =>
                                                                        prev.includes(c.id)
                                                                            ? prev.filter(id => id !== c.id)
                                                                            : [...prev, c.id]
                                                                    );
                                                                }}
                                                                className={`p-3 rounded-xl text-left text-xs transition-all border ${selectedClusterIds.includes(c.id)
                                                                    ? 'bg-orange-500/20 border-orange-500/40 text-white'
                                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <span>{c.label}</span>
                                                                    {selectedClusterIds.includes(c.id) && <CheckCircle className="w-3 h-3 text-orange-500" />}
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {paper !== 'writing' && (
                                            <div>
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 px-1">Quality Tier (Multi-Select)</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {availableTiers.map(t => (
                                                        <button
                                                            key={t.id}
                                                            onClick={() => toggleTier(t.id)}
                                                            className={`p-3 rounded-xl text-left transition-all border ${selectedTiers.includes(t.id)
                                                                ? 'bg-primary border-primary text-black shadow-[0_0_10px_rgba(255,102,0,0.2)]'
                                                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                                                                }`}
                                                        >
                                                            <div className="text-xs font-black">{t.label}</div>
                                                            <div className={`text-[10px] ${selectedTiers.includes(t.id) ? 'text-black/60' : 'text-gray-500'} font-bold`}>
                                                                DSE {t.dse} • {t.xp} XP
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {!isPassageBased && (
                                            <div>
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 px-1 flex justify-between text-white">
                                                    <span>Batch Quantity</span>
                                                    <span className="text-primary">{totalCount} Quests</span>
                                                </label>
                                                <div className="flex gap-3">
                                                    <input
                                                        type="range"
                                                        min="4"
                                                        max="40"
                                                        step="4"
                                                        value={totalCount}
                                                        onChange={(e) => setTotalCount(e.target.value)}
                                                        className="flex-1 accent-primary h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer mt-3"
                                                    />
                                                    <input
                                                        type="number"
                                                        value={totalCount}
                                                        onChange={(e) => setTotalCount(e.target.value)}
                                                        className="w-14 bg-white/5 border border-white/10 rounded-lg p-1 text-center text-xs focus:outline-none focus:border-primary text-white"
                                                    />
                                                </div>
                                                <p className="text-[10px] text-gray-500 mt-2 italic">Proportional distribution: {Math.max(1, Math.floor(totalCount / Math.max(1, selectedTiers.length)))} per tier.</p>
                                            </div>
                                        )}

                                        {isPassageBased && (
                                            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Monitor className="w-3.5 h-3.5 text-blue-400" />
                                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Atomic Mode</span>
                                                </div>
                                                <p className="text-xs text-gray-400 leading-relaxed">
                                                    1 Question = 1 {paper === 'reading' ? 'Passage' : 'Recording'} + 5-8 Tasks. Each click manufactures one complete question set.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Weekly Quest Progress Tracker */}
                                {questMode === 'weekly' && weeklyBatchIndex > 0 && (
                                    <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Weekly Generation Progress</span>
                                            <span className="text-xs font-bold text-white">{weeklyTotalGenerated} / 100 Qs</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-2">
                                            <div
                                                className="h-full bg-indigo-500 transition-all duration-500"
                                                style={{ width: `${(weeklyTotalGenerated / 100) * 100}%` }}
                                            />
                                        </div>
                                        <p className="text-[9px] text-gray-500 font-medium">
                                            Current Status: Batch {weeklyBatchIndex}/5 complete. Passage locked.
                                        </p>
                                    </div>
                                )}

                                <button
                                    disabled={isGenerating || (questMode === 'general' && selectedTiers.length === 0) || (questMode === 'weekly' && weeklyBatchIndex >= 5)}
                                    onClick={() => handleGenerate()}
                                    className={`w-full mt-8 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed ${questMode === 'weekly'
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-400 hover:to-purple-400 shadow-lg shadow-indigo-500/20'
                                        : 'bg-white text-black hover:bg-gray-200'
                                        }`}
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Manufacturing...</span>
                                        </>
                                    ) : (
                                        <>
                                            {questMode === 'weekly'
                                                ? (
                                                    <>
                                                        {weeklyBatchIndex === 0 ? <BookOpen className="w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
                                                        <span>
                                                            {weeklyBatchIndex === 0
                                                                ? `Manufacture Weekly ${weeklyPaper === 'writing' ? 'Writing' : 'Quest'} (Batch 1)`
                                                                : `Continue: ${weeklyPaper === 'writing' ? 'Writing Practice' : (SKILL_CLUSTERS[weeklyBatchIndex]?.label || 'Next Batch')} (${weeklyBatchIndex * 20 + 1}-${(weeklyBatchIndex + 1) * 20})`
                                                            }
                                                        </span>
                                                    </>
                                                )
                                                : <><Cpu className="w-5 h-5 group-hover:rotate-12 transition-transform" /><span>{isPassageBased ? 'Manufacture 1 Question' : 'Run Batch Generator'}</span></>
                                            }
                                        </>
                                    )}
                                </button>

                                {/* Reset Weekly Quest Button */}
                                {questMode === 'weekly' && weeklyBatchIndex > 0 && (
                                    <button
                                        onClick={() => {
                                            if (confirm("Restart from scratch? Current passage and progress will be cleared.")) {
                                                setWeeklyBatchIndex(0);
                                                setWeeklyPassage(null);
                                                setWeeklyTotalGenerated(0);
                                            }
                                        }}
                                        className="w-full mt-3 py-2 text-[10px] font-bold text-gray-500 hover:text-red-400 transition-colors uppercase tracking-widest"
                                    >
                                        Reset Generation Session
                                    </button>
                                )}
                                {isGenerating && (
                                    <p className="text-[10px] text-center text-primary mt-4 animate-pulse font-bold tracking-wider">
                                        ESTIMATED TIME: 45-90 SECONDS
                                    </p>
                                )}
                            </div>

                            <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                                {isGenerating && (
                                    <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                                )}
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        {isGenerating ? <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" /> : <Monitor className="w-3.5 h-3.5" />}
                                        {isGenerating ? 'Manufacturing...' : 'Pending Work'}
                                    </h3>
                                    <button onClick={fetchPending} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-white">
                                        <Monitor className={`w-4 h-4 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>
                                <div className="flex items-end gap-2 text-white relative z-10">
                                    <span className="text-4xl font-black text-white">
                                        {isGenerating ? totalCount : pendingQuests.length}
                                    </span>
                                    <span className="text-xs text-gray-500 mb-1.5 font-bold uppercase tracking-tighter">
                                        {isGenerating ? 'Target Units' : 'Units in Queue'}
                                    </span>
                                </div>
                                {pendingQuests.length > 0 && !isGenerating && (
                                    <div className="mt-4 pt-4 border-t border-white/5 space-y-2 relative z-10">
                                        <div className="flex justify-between text-[10px]">
                                            <span className="text-gray-500 px-1">Head of Queue</span>
                                            <span className="text-gray-300">ID: {pendingQuests[0].id.substring(0, 8)}</span>
                                        </div>
                                    </div>
                                )}
                                {isGenerating && (
                                    <div className="mt-4 pt-4 border-t border-white/10 space-y-2 relative z-10">
                                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary animate-shimmer w-[60%]" />
                                        </div>
                                        <p className="text-[10px] text-primary/70 font-bold italic">AI is drafting questions in sequential batches...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: The Reviewer Workstation */}
                        <div className="col-span-12 lg:col-span-9 space-y-6">
                            {pendingQuests.length === 0 && !isLoading ? (
                                <div className="bg-white/5 border border-white/10 rounded-[32px] h-[700px] flex flex-col items-center justify-center text-center p-10 border-dashed">
                                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5 ring-8 ring-white/[0.02]">
                                        <Database className="w-10 h-10 text-gray-700" />
                                    </div>
                                    <h2 className="text-2xl font-bold mb-3 tracking-tight">Factory Output Status: Empty</h2>
                                    <p className="text-gray-500 max-w-sm text-sm leading-relaxed">
                                        Use the control panel on the left to configure a new manufacturing batch. Approved content will be moved to the student question bank.
                                    </p>
                                </div>
                            ) : isLoading ? (
                                <div className="bg-white/5 border border-white/10 rounded-[32px] h-[700px] flex flex-col items-center justify-center">
                                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-6">Syncing Queue...</p>
                                    <button
                                        onClick={fetchPending}
                                        className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest transition-all"
                                    >
                                        Force Refresh
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-white/5 border border-white/10 rounded-[40px] overflow-hidden flex flex-col min-h-[750px] shadow-2xl">
                                    {/* Workstation Header */}
                                    <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/[0.02] backdrop-blur-md">
                                        <div className="flex items-center gap-6">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Batch Component</span>
                                                <div className="flex items-center gap-3">
                                                    <div className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold text-gray-300 border border-white/5 uppercase">
                                                        {currentQuest.subject || 'Legacy'}
                                                    </div>
                                                    <span className="text-sm font-bold text-white">ID: {(currentQuest?.id || '').substring(0, 8)}...</span>
                                                    <div className="w-1 h-1 rounded-full bg-gray-700" />
                                                    <span className="text-xs text-gray-400 font-mono">{currentQuest?.topic || 'N/A'}</span>
                                                    <div className="w-1 h-1 rounded-full bg-gray-700" />
                                                    <span className="text-xs font-black text-primary uppercase tracking-wider">Level {getLevelLabel(currentQuest?.level)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => setShowChinese(!showChinese)}
                                                className={`px-4 py-2 rounded-xl border font-black text-[10px] transition-all flex items-center gap-2 ${showChinese
                                                    ? 'bg-primary border-primary text-black'
                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                                                    }`}
                                            >
                                                <RefreshCw className={`w-3 h-3 ${showChinese ? 'rotate-180' : ''} transition-transform`} />
                                                {showChinese ? 'CHINESE (TRAD)' : 'ENGLISH (EN)'}
                                            </button>
                                            <div className="h-10 w-px bg-white/10" />
                                            <div className="flex items-center gap-2 bg-black/40 p-2 rounded-2xl border border-white/5">
                                                <button
                                                    disabled={currentIndex === 0}
                                                    onClick={() => setCurrentIndex(c => c - 1)}
                                                    className="p-3 hover:bg-white/10 rounded-xl transition-all text-gray-400 disabled:opacity-10 active:scale-95 hover:text-white"
                                                >
                                                    <ChevronLeft className="w-5 h-5" />
                                                </button>
                                                <div className="flex flex-col items-center w-24">
                                                    <span className="text-xs font-black text-white">{currentIndex + 1} / {pendingQuests.length}</span>
                                                    <span className="text-[8px] text-gray-500 uppercase font-bold tracking-tighter">
                                                        {baseQuest.type === 'listening_mission' ? 'MISSION BATCH' : 'QUESTION POSITION'}
                                                    </span>
                                                </div>
                                                <button
                                                    disabled={currentIndex === pendingQuests.length - 1}
                                                    onClick={() => setCurrentIndex(c => c + 1)}
                                                    className="p-3 hover:bg-white/10 rounded-xl transition-all text-gray-400 disabled:opacity-10 active:scale-95 hover:text-white"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Audit Split View */}
                                    <div className="flex-1 grid grid-cols-12 overflow-hidden">
                                        {/* Left: Quest Render */}
                                        <div className="col-span-12 xl:col-span-7 p-10 border-r border-white/10 flex flex-col overflow-y-auto custom-scrollbar">
                                            <div className="flex-1 space-y-10">
                                                {(currentQuest.passage || currentQuest.reading_passage) && (() => {
                                                    const pText = currentQuest.passage || currentQuest.reading_passage;
                                                    const wordCount = pText.trim().split(/\s+/).length;
                                                    const isWriting = currentQuest.topic?.startsWith('writing_');
                                                    const isListening = !!currentQuest.reading_passage;
                                                    const hasAudio = currentQuest.audio_segments && currentQuest.audio_segments.length > 0;

                                                    // Determine expected range based on level
                                                    const lvl = String(currentQuest.level || '').replace(/\D/g, '') || '5';
                                                    const ranges = isWriting
                                                        ? { '2': [30, 100], '3': [30, 100], '4': [50, 150], '5': [50, 150], '6': [80, 200], '7': [80, 200] }
                                                        : { '2': [250, 350], '3': [250, 350], '4': [350, 450], '5': [400, 600], '6': [500, 700], '7': [500, 700] };

                                                    const [min, max] = ranges[lvl] || (isWriting ? [50, 150] : [400, 600]);
                                                    const isInRange = wordCount >= min && wordCount <= max;
                                                    const isClose = wordCount >= min - 20 && wordCount <= max + 20;
                                                    const color = isInRange ? 'text-green-400 border-green-500/30' : isClose ? 'text-yellow-400 border-yellow-500/30' : 'text-red-400 border-red-500/30';

                                                    return (
                                                        <div className="space-y-6">
                                                            <div className="p-8 bg-white/[0.03] border border-white/5 rounded-3xl relative group">
                                                                <div className="absolute -top-3 left-6 px-3 py-1 bg-[#1a1d23] border border-white/10 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                                    {isWriting ? 'Writing Situation' : isListening ? 'Listening Script' : 'Reference Context'}
                                                                </div>

                                                                {hasAudio ? (
                                                                    <div className="space-y-4 pt-2">
                                                                        {(currentQuest?.audio_segments || []).map((seg, idx) => (
                                                                            <div key={idx} className="flex gap-4 group/seg p-3 hover:bg-white/5 rounded-2xl transition-all">
                                                                                <div className="shrink-0">
                                                                                    {seg.audio || seg.lazy ? (
                                                                                        <button
                                                                                            onClick={() => playAudioSegment(`seg-${idx}`, seg)}
                                                                                            disabled={loadingAudioId === `seg-${idx}`}
                                                                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${currentlyPlayingAudioId === `seg-${idx}`
                                                                                                ? 'bg-primary text-black scale-110'
                                                                                                : (loadingAudioId === `seg-${idx}` ? 'bg-white/5 cursor-wait' : 'bg-white/10 text-gray-400 hover:bg-primary/20 hover:text-primary')
                                                                                                }`}
                                                                                        >
                                                                                            {loadingAudioId === `seg-${idx}` ? (
                                                                                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                                                                            ) : currentlyPlayingAudioId === `seg-${idx}` ? (
                                                                                                <Pause className="w-4 h-4" />
                                                                                            ) : (
                                                                                                <Play className="w-4 h-4 ml-0.5" />
                                                                                            )}
                                                                                        </button>
                                                                                    ) : (seg.isLimitReached) ? (
                                                                                        /* Should not be reached with new lazy logic, but kept as fallback */
                                                                                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500/50" title="Audio omitted">
                                                                                            <Info className="w-4 h-4" />
                                                                                        </div>
                                                                                    ) : (seg.isStageDirection || (!seg.audio && seg.text?.trim().startsWith('[') && seg.text?.trim().endsWith(']'))) ? (
                                                                                        /* Stage direction: No icon, just a subtle placeholder to align text */
                                                                                        <div className="w-10 h-10" />
                                                                                    ) : (
                                                                                        /* Actual error/failure: Show a warning icon */
                                                                                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500/50" title="Audio generation failed">
                                                                                            <VolumeX className="w-4 h-4" />
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${seg.isStageDirection ? 'text-gray-500/50' : 'text-primary/60'}`}>{seg.speaker}</p>
                                                                                    <p className={`text-sm leading-relaxed font-serif italic ${seg.isStageDirection ? 'text-gray-500' : 'text-gray-300'}`}>{seg.text}</p>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-serif italic pt-2">{pText}</p>
                                                                )}

                                                                {currentQuest.audioLimitReached && (
                                                                    <div className="mt-4 p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3">
                                                                        <Info className="w-4 h-4 text-blue-400 shrink-0" />
                                                                        <p className="text-[10px] text-blue-300 leading-tight">
                                                                            <b>Audio Capped</b>: This mission script is very long. Some audio segments were omitted to stay within database size limits.
                                                                        </p>
                                                                    </div>
                                                                )}

                                                                <div className={`mt-4 pt-3 border-t border-white/5 flex items-center justify-between`}>
                                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${color}`}>
                                                                        📝 {wordCount} words
                                                                    </span>
                                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${color} font-bold`}>
                                                                        {isWriting ? 'Concise Target' : isListening ? 'Mission Audio Scale' : `Expected: ${min}-${max}`}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}

                                                {currentQuest.type === 'CATEGORIZATION' && currentQuest.buckets && (
                                                    <div className="space-y-4">
                                                        <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <div className="w-2 h-2 rounded-full bg-purple-500" />
                                                                <p className="text-[10px] text-purple-400 font-black uppercase tracking-widest">Categorization Strategy</p>
                                                            </div>

                                                            {/* Buckets Visual */}
                                                            <div className="grid grid-cols-2 gap-3 mb-4">
                                                                {(currentQuest?.buckets || []).map((b, i) => (
                                                                    <div key={i} className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/40 text-center flex flex-col items-center justify-center min-h-[60px]">
                                                                        <div className="opacity-50 mb-1">🗑️</div>
                                                                        <span className="text-xs font-bold text-purple-200">{b}</span>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            <div className="space-y-2">
                                                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest pl-1">Items to Sort</p>
                                                                {(currentQuest?.options || []).map((opt, i) => (
                                                                    <div key={i} className="flex gap-3 text-xs text-gray-300 p-2 bg-white/5 rounded-lg border border-white/5">
                                                                        <span className="font-mono text-gray-500 opacity-50">[{i}]</span>
                                                                        <span>{opt}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}


                                            </div>
                                        </div>

                                        {/* Right: Data Audit & Controls */}
                                        <div className="col-span-12 xl:col-span-5 p-10 bg-black/30 flex flex-col border-l border-white/5">
                                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8">
                                                {/* Relocated Questions & Options */}
                                                <div className="space-y-6">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <BarChart3 className="w-4 h-4 text-primary" />
                                                                <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Questions</h4>
                                                            </div>

                                                            {baseQuest.isGroup && (
                                                                <div className="flex gap-1 p-1 bg-white/5 rounded-lg border border-white/10">
                                                                    {['4', '5', '5*', '5**'].map((lvl, i) => (
                                                                        <button
                                                                            key={lvl}
                                                                            onClick={() => setAuditModelLevel(i)}
                                                                            className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${auditModelLevel === i
                                                                                ? 'bg-primary text-black'
                                                                                : 'text-gray-500 hover:text-gray-300'
                                                                                }`}
                                                                        >
                                                                            LVL {lvl}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {baseQuest.type === 'listening_mission' && baseQuest.interactive_tasks && (
                                                                <div className="flex flex-wrap gap-1 p-1 bg-white/5 rounded-lg border border-white/10 max-w-[300px]">
                                                                    {baseQuest.interactive_tasks.map((_, i) => (
                                                                        <button
                                                                            key={i}
                                                                            onClick={() => setAuditListeningTaskIndex(i)}
                                                                            className={`w-6 h-6 rounded text-[10px] font-bold transition-all ${auditListeningTaskIndex === i
                                                                                ? 'bg-indigo-500 text-white'
                                                                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                                                                }`}
                                                                        >
                                                                            {i + 1}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="text-lg leading-snug font-bold text-gray-100">
                                                            {renderMath(showChinese
                                                                ? (currentQuest.question_zh || currentQuest.text_zh || currentQuest.instruction_zh || currentQuest.question || currentQuest.text || currentQuest.instruction)
                                                                : (currentQuest.question || currentQuest.text || currentQuest.instruction))}
                                                        </p>

                                                        {/* Math Visual Preview (AI-generated) */}
                                                        {currentQuest.diagram_json && (
                                                            <div className="mt-4 p-4 bg-black/40 rounded-2xl border border-white/5 overflow-hidden">
                                                                <div className="flex items-center gap-2 mb-3 text-indigo-400">
                                                                    <Cpu className="w-4 h-4" />
                                                                    <span className="text-[10px] font-black uppercase tracking-widest">AI Graph Preview</span>
                                                                </div>
                                                                <div className="bg-white/5 rounded-xl border border-white/10 p-2">
                                                                    <GeometryRenderer data={typeof currentQuest.diagram_json === 'string' ? JSON.parse(currentQuest.diagram_json) : currentQuest.diagram_json} />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Static Image Visual Preview */}
                                                        {currentQuest.diagram_url && (
                                                            <div className="mt-4 p-4 bg-black/40 rounded-2xl border border-white/5 overflow-hidden">
                                                                <div className="flex items-center gap-2 mb-3 text-primary">
                                                                    <Monitor className="w-4 h-4" />
                                                                    <span className="text-[10px] font-black uppercase tracking-widest">Parametric Visual Preview</span>
                                                                </div>
                                                                <img
                                                                    src={currentQuest.diagram_url.startsWith('http') ? currentQuest.diagram_url : `${import.meta.env.VITE_API_URL}/${currentQuest.diagram_url}`}
                                                                    alt="Math Visual"
                                                                    className="w-full rounded-xl border border-white/10 shadow-2xl"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {currentQuest.type === 'ORDERING' && currentQuest.options && (
                                                        <div className="space-y-4">
                                                            <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl">
                                                                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-2">Items to Order</p>
                                                                <div className="space-y-2">
                                                                    {(currentQuest?.options || []).map((opt, i) => (
                                                                        <div key={i} className="flex gap-3 text-xs text-gray-300">
                                                                            <span className="font-black text-indigo-400">{i + 1}.</span>
                                                                            <span>{opt}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-xl w-fit">
                                                                <span className="text-[10px] text-green-400 font-black uppercase tracking-widest">Correct Sequence:</span>
                                                                <span className="text-xs font-bold text-white tracking-widest">
                                                                    {(currentQuest.answer || '').split('-').map(idx => parseInt(idx) + 1).join(' - ')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {(!currentQuest.type || (currentQuest.type !== 'ORDERING' && currentQuest.type !== 'CATEGORIZATION')) && currentQuest.options && (
                                                        <div className="grid grid-cols-1 gap-2">
                                                            {(currentQuest?.options || []).map((opt, i) => {
                                                                const labels = ['A', 'B', 'C', 'D'];
                                                                const label = labels[i] || '';
                                                                const optStr = typeof opt === 'string' ? opt : String(opt || '');
                                                                const cleanOpt = optStr.replace(/^[A-D]\s*[:.]\s*/i, '').trim();

                                                                const answerLetter = typeof currentQuest.answer_letter === 'string' ? currentQuest.answer_letter.trim().toUpperCase() : '';
                                                                const answerStr = typeof currentQuest.answer === 'string' ? currentQuest.answer : '';
                                                                const cleanedAnswer = answerStr.trim().toUpperCase();
                                                                const cleanedOption = optStr.trim().toUpperCase();

                                                                // Strictly rely on answer_letter if it's available to prevent multiple accidental matches
                                                                let isCorrect = false;
                                                                if (['A', 'B', 'C', 'D'].includes(answerLetter)) {
                                                                    isCorrect = (label === answerLetter);
                                                                } else {
                                                                    // Fallback for legacy quests without answer_letter
                                                                    isCorrect = answerStr && (
                                                                        cleanedAnswer === label ||
                                                                        cleanedOption === cleanedAnswer ||
                                                                        cleanedOption.startsWith(`${cleanedAnswer}.`) ||
                                                                        cleanedOption.startsWith(`${cleanedAnswer} `)
                                                                    );
                                                                }

                                                                return (
                                                                    <div
                                                                        key={i}
                                                                        className={`p-3 rounded-xl border text-xs transition-all ${isCorrect
                                                                            ? 'border-green-500/30 bg-green-500/10'
                                                                            : 'border-white/5 bg-white/[0.01] opacity-70'
                                                                            }`}
                                                                    >
                                                                        <div className="flex items-center justify-between">
                                                                            <span className={isCorrect ? 'text-green-400 font-bold' : 'text-gray-400'}>
                                                                                <span className="font-black mr-2 text-white/40">{label}.</span>
                                                                                {renderMath(showChinese && currentQuest.options_zh && typeof currentQuest.options_zh[i] === 'string'
                                                                                    ? currentQuest.options_zh[i].replace(/^[A-D]\s*[:.]\s*/i, '').trim()
                                                                                    : cleanOpt)}
                                                                            </span>
                                                                            {isCorrect && <CheckCircle className="w-3 h-3 text-green-500" />}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Enhanced Answer Key */}
                                                <div className="p-8 bg-gradient-to-br from-green-500/20 via-transparent to-transparent border border-green-500/20 rounded-[32px] relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                                        <CheckCircle className="w-32 h-32 text-green-500" />
                                                    </div>
                                                    <div className="relative z-10 space-y-4">
                                                        <div>
                                                            <h4 className="text-[10px] text-green-500 font-black uppercase tracking-widest italic mb-2">Model Answer</h4>
                                                            <p className="text-sm font-medium text-white">
                                                                {currentQuest.type === 'ORDERING' ? (
                                                                    <span className="text-3xl font-black">
                                                                        {(currentQuest.answer || '').split('-').map(idx => parseInt(idx) + 1).join('-')}
                                                                    </span>
                                                                ) : typeof currentQuest.answer === 'object' ? (
                                                                    <div className="flex flex-col gap-2 mt-1">
                                                                        {Object.entries(currentQuest.answer).map(([bucket, indices]) => (
                                                                            <div key={bucket} className="flex gap-2 text-[11px]">
                                                                                <span className="text-green-400 font-black shrink-0">{bucket}:</span>
                                                                                <span className="text-gray-300">
                                                                                    {(indices || []).map(idx => {
                                                                                        const text = currentQuest?.options ? currentQuest.options[idx] : `Item ${idx + 1}`;
                                                                                        return typeof text === 'string' && text.length > 20 ? text.substring(0, 20) + '...' : String(text || '');
                                                                                    }).join(', ')}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : currentQuest.type === 'MODEL_ANSWER' || (typeof currentQuest.answer === 'string' && currentQuest.answer.length > 100) ? (
                                                                    <div className="text-sm text-gray-300 leading-relaxed font-serif whitespace-pre-wrap bg-white/5 p-6 rounded-2xl border border-white/10">
                                                                        {renderMath(currentQuest.answer) || "No model answer provided."}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-2xl font-black">
                                                                        {renderMath(currentQuest.answer_letter || currentQuest.answer) || "MANUAL AUDIT"}
                                                                    </span>
                                                                )}
                                                            </p>
                                                        </div>

                                                        {currentQuest.explanation && (
                                                            <div className="pt-4 border-t border-green-500/20">
                                                                <h4 className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-2 px-1">Explanation</h4>
                                                                <div className={`text-[11px] text-gray-300 leading-relaxed italic`}>
                                                                    {renderMath(showChinese && currentQuest.explanation_zh
                                                                        ? currentQuest.explanation_zh
                                                                        : currentQuest.explanation)}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Logical Proof */}
                                                <div>
                                                    <h4 className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                        <Cpu className="w-3.5 h-3.5" /> Logical Proof (Chain of Thought)
                                                    </h4>
                                                    <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/5 text-xs text-gray-200 leading-relaxed font-mono whitespace-pre-wrap">
                                                        {renderMath(currentQuest.answer_logic || (currentQuest.solution_steps && (currentQuest?.solution_steps || []).join('\n'))) || "Vetting required: No automated proof generated."}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-8 border-t border-white/10 mt-auto flex flex-col gap-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <button
                                                        onClick={handleDeleteCurrent}
                                                        className="flex items-center justify-center gap-3 px-6 py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-black text-xs hover:bg-red-500 hover:text-white transition-all active:scale-95"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                        REMOVE QUESTION
                                                    </button>
                                                    <button
                                                        onClick={handleApprove}
                                                        className="flex items-center justify-center gap-3 px-6 py-4 bg-primary text-black rounded-2xl font-black text-xs hover:scale-[1.02] shadow-[0_10px_30px_rgba(255,107,0,0.1)] transition-all active:scale-95"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                        APPROVE & RELEASE
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <button
                                                        onClick={handleApproveAll}
                                                        className="flex items-center justify-center gap-3 px-8 py-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-2xl font-black text-xs hover:bg-green-500 hover:text-white transition-all active:scale-95 shadow-lg"
                                                    >
                                                        <Zap className="w-5 h-5" />
                                                        APPROVE ALL & RELEASE ({pendingQuests.length})
                                                    </button>
                                                    <button
                                                        onClick={handleWipePending}
                                                        className="flex items-center justify-center gap-3 px-8 py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-black text-xs hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-lg"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                        WIPE ALL PENDING
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <button className="py-4 bg-white/5 border border-white/10 text-gray-400 font-bold rounded-2xl hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 group">
                                                    <Flag className="w-4 h-4 group-hover:text-red-500 transition-colors" />
                                                    <span>REPORT</span>
                                                </button>
                                                <button
                                                    disabled={isGenerating}
                                                    onClick={async () => {
                                                        if (!currentQuest) return;
                                                        const questId = currentQuest.id;

                                                        // 1. Optimistic UI update
                                                        const updated = [...pendingQuests];
                                                        updated.splice(currentIndex, 1);
                                                        setPendingQuests(updated);
                                                        if (currentIndex >= updated.length && updated.length > 0) {
                                                            setCurrentIndex(updated.length - 1);
                                                        }

                                                        // 2. Perform Delete & Regenerate
                                                        try {
                                                            const baseQuest = pendingQuests[currentIndex];
                                                            const questIds = baseQuest.isGroup ? baseQuest.modelAnswers.map(m => m.id) : [baseQuest.id];

                                                            await fetch(`${import.meta.env.VITE_API_URL}/api/admin/quests/delete-batch`, {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json', 'x-admin-secret': adminSecret },
                                                                body: JSON.stringify({ questIds })
                                                            });

                                                            // 3. Trigger fresh generation for a replacement
                                                            handleGenerate();
                                                        } catch (e) {
                                                            // TEST COMMENT
                                                            console.error("Regeneration failed:", e);
                                                        }
                                                    }}
                                                    className="py-4 bg-transparent border border-white/10 text-gray-500 font-bold rounded-2xl hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    <Zap className="w-4 h-4 text-primary" />
                                                    <span>REGENERATE QUESTION</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeMode === 'audit' && (
                    <div className="space-y-6">
                        {/* Audit Search & Controls */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex flex-wrap items-end gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 px-1">Subject</label>
                                <select
                                    value={auditSearch.subject}
                                    onChange={(e) => setAuditSearch({ ...auditSearch, subject: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500 [&>option]:bg-[#1a1d23]"
                                >
                                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 px-1">Specific Topic</label>
                                <select
                                    value={auditSearch.topic}
                                    onChange={(e) => setAuditSearch({ ...auditSearch, topic: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500 [&>option]:bg-[#1a1d23]"
                                >
                                    <option value="All">All Topics</option>
                                    {auditSearch.subject === 'Maths' ? (
                                        Object.entries(MATH_MICRO_SKILLS).map(([id, data]) => (
                                            <option key={id} value={id}>{data.en.name}</option>
                                        ))
                                    ) : (
                                        Object.entries(MICRO_SKILLS)
                                            .filter(([_, data]) => {
                                                const sub = auditSearch.subject.toLowerCase();
                                                return _.startsWith(sub === 'english' ? 'reading' : sub);
                                            })
                                            .map(([id, data]) => (
                                                <option key={id} value={id}>{data.en.name}</option>
                                            ))
                                    )}
                                </select>
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 px-1">Status Filter</label>
                                <select
                                    value={auditSearch.status}
                                    onChange={(e) => setAuditSearch({ ...auditSearch, status: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500 [&>option]:bg-[#1a1d23]"
                                >
                                    <option value="All">All Stats</option>
                                    <option value="Pending">Pending Audit</option>
                                    <option value="ApprovedOnly">Approved (Awaiting Release)</option>
                                    <option value="Released">Released to Students</option>
                                </select>
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 px-1">Difficulty Level</label>
                                <select
                                    value={auditSearch.level}
                                    onChange={(e) => setAuditSearch({ ...auditSearch, level: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500 [&>option]:bg-[#1a1d23]"
                                >
                                    <option value="All">All Levels</option>
                                    <option value="1">Level 1</option>
                                    <option value="2">Level 2</option>
                                    <option value="3">Level 3</option>
                                    <option value="4">Level 4</option>
                                    <option value="5">Level 5</option>
                                    <option value="6">Level 5*</option>
                                    <option value="7">Level 5**</option>
                                </select>
                            </div>
                            <button
                                onClick={handleAuditSearch}
                                disabled={isAuditLoading}
                                className="px-6 py-3.5 bg-amber-500 text-black rounded-xl font-bold flex items-center gap-2 hover:bg-amber-400 transition-all disabled:opacity-50"
                            >
                                {isAuditLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                REFRESH VIEW
                            </button>

                            <div className="flex-1" />

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleAuditReleaseAll}
                                    disabled={isAuditLoading || auditResults.length === 0}
                                    className="px-6 py-3.5 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl font-bold text-xs hover:bg-green-500 hover:text-white transition-all disabled:opacity-50"
                                >
                                    RELEASE ALL IN VIEW
                                </button>
                                <button
                                    onClick={handleAuditRemoveAll}
                                    disabled={isAuditLoading || auditResults.length === 0}
                                    className="px-6 py-3.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl font-bold text-xs hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                                >
                                    REMOVE ALL IN VIEW
                                </button>
                            </div>
                        </div>

                        {/* Audit Results Table */}
                        <div className="bg-white/5 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-white/[0.03] border-b border-white/10">
                                        <th className="p-4 w-12"><input type="checkbox" className="accent-amber-500" /></th>
                                        <th className="p-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Question Bank Metadata</th>
                                        <th className="p-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Question Preview</th>
                                        <th className="p-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Current Status</th>
                                        <th className="p-4 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {auditResults.length === 0 && !isAuditLoading && (
                                        <tr>
                                            <td colSpan="5" className="p-20 text-center">
                                                <div className="flex flex-col items-center">
                                                    <Database className="w-12 h-12 text-gray-700 mb-4" />
                                                    <p className="text-gray-500 text-sm">No questions found matching your filter.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {auditResults.map((quest) => (
                                        <React.Fragment key={quest.id}>
                                            <tr className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="p-4 text-center">
                                                    <input
                                                        type="checkbox"
                                                        className="accent-amber-500"
                                                        checked={selectedAuditIds.includes(quest.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) setSelectedAuditIds(prev => [...prev, quest.id]);
                                                            else setSelectedAuditIds(prev => prev.filter(id => id !== quest.id));
                                                        }}
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-white font-bold text-xs truncate max-w-[200px]">{quest.topic}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] text-gray-500 font-mono">ID: {quest.id.substring(0, 8)}</span>
                                                            <div className="w-1 h-1 rounded-full bg-gray-700" />
                                                            <span className="text-[10px] text-gray-500">Lv {getLevelLabel(quest.level)}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-xs text-gray-400 line-clamp-2 italic max-w-sm">
                                                        {quest.text || quest.question || "No question text provided."}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${quest.currentStatus === 'Approved and Released'
                                                        ? 'bg-green-500/10 text-green-500'
                                                        : quest.currentStatus === 'Approved'
                                                            ? 'bg-blue-500/10 text-blue-500'
                                                            : 'bg-amber-500/10 text-amber-500'
                                                        }`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${quest.currentStatus === 'Approved and Released' ? 'bg-green-500' : quest.currentStatus === 'Approved' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                                                        {quest.currentStatus}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => setShowAuditPreview(showAuditPreview === quest.id ? null : quest.id)}
                                                            className={`p-2 rounded-lg transition-all ${showAuditPreview === quest.id ? 'bg-amber-500 text-black' : 'hover:bg-amber-500/20 text-amber-400'}`}
                                                            title="Toggle Preview"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                if (!window.confirm("Delete this quest permanently?")) return;
                                                                await fetch(`${import.meta.env.VITE_API_URL}/api/admin/quests/delete`, {
                                                                    method: 'DELETE',
                                                                    headers: { 'Content-Type': 'application/json', 'x-admin-secret': adminSecret },
                                                                    body: JSON.stringify({ questId: quest.id })
                                                                });
                                                                handleAuditSearch();
                                                            }}
                                                            className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {showAuditPreview === quest.id && (
                                                <tr className="bg-black/20">
                                                    <td colSpan="5" className="p-8">
                                                        <div className="grid grid-cols-2 gap-8">
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <span className="text-[10px] font-black text-amber-500/50 uppercase tracking-widest block mb-2">Question Context & Passage</span>
                                                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-xs text-gray-300 leading-relaxed font-serif whitespace-pre-wrap max-h-60 overflow-y-auto">
                                                                        {quest.passage || quest.reading_passage || "None"}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <span className="text-[10px] font-black text-amber-500/50 uppercase tracking-widest block mb-1">Answer Options (MC)</span>
                                                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                                                        {quest.options ? Object.entries(quest.options).map(([k, v]) => (
                                                                            <div key={k} className={`p-3 rounded-xl border text-xs ${quest.answer === k ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-white/5 border-white/5 text-gray-400'}`}>
                                                                                <span className="font-bold mr-2">{k})</span> {v}
                                                                            </div>
                                                                        )) : <p className="text-gray-600 text-[10px] italic">No MC options (Short Answer)</p>}
                                                                    </div>

                                                                    <span className="text-[10px] font-black text-amber-500/50 uppercase tracking-widest block mb-1">Visual Aid (AI-Generated)</span>
                                                                    {quest.diagram_json ? (
                                                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center">
                                                                            <GeometryRenderer data={typeof quest.diagram_json === 'string' ? JSON.parse(quest.diagram_json) : quest.diagram_json} />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-[10px] text-gray-400 italic text-center">
                                                                            No AI-generated visual available.
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {quest.diagram_url && (
                                                                    <div>
                                                                        <span className="text-[10px] font-black text-primary/50 uppercase tracking-widest block mb-1">Static Visual Preview</span>
                                                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 overflow-hidden">
                                                                            <img
                                                                                src={quest.diagram_url.startsWith('http') ? quest.diagram_url : `${import.meta.env.VITE_API_URL}/${quest.diagram_url}`}
                                                                                alt="Math Visual"
                                                                                className="w-full h-auto rounded-xl shadow-lg border border-white/10"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <span className="text-[10px] font-black text-amber-500/50 uppercase tracking-widest block mb-1">Model Answer & Marking Logic</span>
                                                                    <div className="bg-green-500/5 p-6 rounded-3xl border border-green-500/10">
                                                                        <div className="flex items-center gap-2 mb-3">
                                                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                                                            <span className="text-xs font-black text-green-500 uppercase tracking-widest">Verified Solution</span>
                                                                        </div>
                                                                        <div className="text-sm text-green-100 font-medium leading-relaxed">
                                                                            {renderMath(quest.answer || quest.correct_answer || quest.model_answer)}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <span className="text-[10px] font-black text-amber-500/50 uppercase tracking-widest block mb-1">Pedagogical Explanation</span>
                                                                    <div className="text-xs text-gray-400 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5">
                                                                        {renderMath(quest.explanation)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default QuestFactoryPage;
