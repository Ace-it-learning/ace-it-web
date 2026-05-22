import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { useAvatar } from '../context/AvatarContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ArrowRight, Paperclip, Send, Volume2, VolumeX, Edit3, Type, Maximize2, Minimize2, X, MessageSquare, CircleX, Trophy, Lock, Zap, Target, BookOpen, Plus, Settings2, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Sparkles, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn'; // Reusing cn utility
import { readAndPrepareImageFile } from '../utils/prepareImageForOcr';
import EssayUploader from './EssayUploader';
import QrHandoffPanel from './handoff/QrHandoffPanel';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import LaunchCard from './LaunchCard';
import AuthForm from './AuthForm';
// Mastery modals removed - now dedicated pages
// Dream Programs now uses dedicated page at /dream-subjects
import { Compass } from 'lucide-react';
import { MathsLab, MathsDiagnostic } from './maths';
import { SafeInlineMath, SafeBlockMath } from './maths/SafeMath';
import PolisherCard from './tutor/PolisherCard';
import DecoderCard from './tutor/DecoderCard';
import VocabCard from './tutor/VocabCard';
// RoadmapModal import removed - hoisted to Dashboard

const DISPOSABLE_DOMAINS = [
    "yopmail.com", "temp-mail.org", "guerrillamail.com", "10minutemail.com",
    "sharklasers.com", "mailinator.com", "throwawaymail.com", "getnada.com",
    "dispostable.com", "fakeinbox.com", "maildrop.cc"
];

// AuthForm removed - moved to separate file

/**
 * Robust chat message formatter that handles:
 * - Markdown bold (**text**)
 * - LaTeX inline math: $...$ and \(...\)
 * - LaTeX block math: $$...$$ and \[...\]
 * - Markdown headers: ### heading
 * - Cleans stray backslashes from legacy AI messages
 */
const parseSuggestions = (content) => {
    if (typeof content !== 'string') return { text: content, suggestions: [] };
    const suggestionsMatch = content.match(/\[SUGGESTIONS:\s*([^\]]+)\]/);
    if (suggestionsMatch) {
        const suggestions = splitSuggestionText(suggestionsMatch[1]);
        const cleanedText = content.replace(suggestionsMatch[0], '').trim();
        return { text: cleanedText, suggestions };
    }
    return { text: content, suggestions: [] };
};

const splitSuggestionText = (value) => String(value || '')
    .split(/\s*(?:,|，|;|；|\||\n)\s*/g)
    .map(s => s.replace(/^\s*(?:[-*]|\d+[.)、])\s*/, '').trim())
    .filter(Boolean)
    .filter((item, index, arr) => arr.indexOf(item) === index);

/** On reload, end the thread on the tutor's last reply — not a trailing student turn. */
const trimTrailingUserTurnsForDisplay = (history) => {
    if (!Array.isArray(history) || history.length === 0) return history;
    const hasAssistant = history.some((m) => m.role === 'assistant');
    if (!hasAssistant) return history;
    const result = [...history];
    while (result.length > 0 && result[result.length - 1].role === 'user') {
        result.pop();
    }
    return result;
};

const normalizeChips = (chips) => {
    const source = Array.isArray(chips) ? chips : (chips ? [chips] : []);
    return source.flatMap((chip) => {
        if (!chip) return [];
        if (typeof chip === 'string') {
            return splitSuggestionText(chip).map(label => ({ label, value: label }));
        }
        if (typeof chip === 'object') {
            const label = chip.label || chip.text || chip.value;
            if (!label) return [];
            return [{ ...chip, label, value: chip.value || label }];
        }
        return [];
    }).slice(0, 4);
};

const looksLikeSeparatorRow = (line) => {
    const normalized = line.replace(/\s/g, '');
    return /^[-:|]+$/.test(normalized) && normalized.includes('-');
};

const parseMarkdownTableRows = (lines) => {
    const parseRow = (line) =>
        line
            .trim()
            .replace(/^\|/, '')
            .replace(/\|$/, '')
            .split('|')
            .map((cell) => cell.trim());

    if (lines.length < 2 || !looksLikeSeparatorRow(lines[1])) {
        return null;
    }

    const headers = parseRow(lines[0]);
    const rawRows = lines.slice(2)
        .map(parseRow)
        .filter((row) => row.some(Boolean));

    if (!headers.length || !rawRows.length) return null;

    const colCount = headers.length;
    const merged = [];
    for (let r = 0; r < rawRows.length; r += 1) {
        const row = rawRows[r];
        const onlyRank = row.length === 1 && /^\d+$/.test(row[0]);
        if (onlyRank && r + 1 < rawRows.length) {
            const next = rawRows[r + 1];
            merged.push([row[0], ...next]);
            r += 1;
            continue;
        }
        merged.push(row);
    }

    const padded = merged.map((row) => {
        if (row.length >= colCount) return row.slice(0, colCount);
        return [...row, ...Array(colCount - row.length).fill('')];
    });

    return { headers, rows: padded };
};

/** Pull contiguous GFM-style pipe tables out of the raw string before ** / $ splitting (bold in cells was breaking tables). */
const extractTableSegments = (text) => {
    if (!text || !text.includes('\n')) return [{ type: 'text', content: text }];
    const lines = text.split('\n');
    const segments = [];
    let buf = [];

    const flushBuf = () => {
        if (!buf.length) return;
        segments.push({ type: 'text', content: buf.join('\n') });
        buf = [];
    };

    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        const next = lines[i + 1];
        const isTableStart = line?.includes('|') && typeof next === 'string' && looksLikeSeparatorRow(next);

        if (!isTableStart) {
            buf.push(line);
            i += 1;
            continue;
        }

        flushBuf();

        const tableLines = [line, next];
        i += 2;
        while (i < lines.length) {
            const L = lines[i];
            if (L.includes('|')) {
                tableLines.push(L);
                i += 1;
                continue;
            }
            if (/^\s*\d+\s*$/.test(L) && i + 1 < lines.length && lines[i + 1]?.includes('|')) {
                tableLines.push(L);
                i += 1;
                continue;
            }
            break;
        }

        segments.push({ type: 'table', lines: tableLines });
    }

    flushBuf();
    return segments.length ? segments : [{ type: 'text', content: text }];
};

const TABLE_CELL_SPLIT_REGEX = /(\$\$[\s\S]*?\$\$|(?<!\$)\$(?!\$)(?:[^$\\]|\\.)*?\$(?!\$)|\*\*(?:.*?)\*\*)/g;

const formatTableCellFragment = (part, key) => {
    if (!part && part !== '') return null;
    if (part.startsWith('$$') && part.endsWith('$$') && part.length > 4) {
        const mathStr = part.slice(2, -2).trim();
        return <SafeBlockMath key={key} math={mathStr} />;
    }
    if (part.startsWith('$') && part.endsWith('$') && !part.startsWith('$$') && part.length > 2) {
        const mathStr = part.slice(1, -1).trim();
        if (mathStr.length > 0) return <SafeInlineMath key={key} math={mathStr} />;
    }
    if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={key} className="font-bold">{part.slice(2, -2)}</strong>;
    }
    return <span key={key}>{part}</span>;
};

const formatTableCellContent = (cell, keyPrefix) => {
    if (cell == null || cell === '') return '\u00a0';
    const bits = String(cell).split(TABLE_CELL_SPLIT_REGEX);
    return bits.map((bit, j) => formatTableCellFragment(bit, `${keyPrefix}-c${j}`)).filter(Boolean);
};

const renderParsedMarkdownTable = (parsedTable, tableKey) => (
    <div key={tableKey} className="my-3 overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
        <table className="min-w-full text-sm">
            <thead className="bg-black/5 dark:bg-white/10">
                <tr>
                    {parsedTable.headers.map((header, index) => (
                        <th key={`${tableKey}-th-${index}`} className="px-3 py-2 text-left font-semibold">
                            {formatTableCellContent(header, `${tableKey}-h${index}`)}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {parsedTable.rows.map((row, rowIndex) => (
                    <tr key={`${tableKey}-row-${rowIndex}`} className="border-t border-black/10 dark:border-white/10">
                        {row.map((cell, cellIndex) => (
                            <td key={`${tableKey}-cell-${rowIndex}-${cellIndex}`} className="px-3 py-2 align-top">
                                {formatTableCellContent(cell, `${tableKey}-d${rowIndex}-${cellIndex}`)}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const renderTextWithTables = (part, keyPrefix) => {
    if (!part || !part.includes('|') || !part.includes('\n')) {
        return <span key={keyPrefix}>{part}</span>;
    }

    const lines = part.split('\n');
    const nodes = [];
    let textBuffer = [];

    const flushTextBuffer = (idx) => {
        if (textBuffer.length === 0) return;
        nodes.push(
            <span key={`${keyPrefix}-text-${idx}`} className="whitespace-pre-wrap">
                {textBuffer.join('\n')}
            </span>
        );
        textBuffer = [];
    };

    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        const next = lines[i + 1];
        const isTableStart = line?.includes('|') && typeof next === 'string' && looksLikeSeparatorRow(next);

        if (!isTableStart) {
            textBuffer.push(line);
            continue;
        }

        flushTextBuffer(i);

        const tableLines = [line, next];
        let cursor = i + 2;
        while (cursor < lines.length) {
            const L = lines[cursor];
            if (L.includes('|')) {
                tableLines.push(L);
                cursor += 1;
                continue;
            }
            if (/^\s*\d+\s*$/.test(L) && cursor + 1 < lines.length && lines[cursor + 1]?.includes('|')) {
                tableLines.push(L);
                cursor += 1;
                continue;
            }
            break;
        }

        const parsedTable = parseMarkdownTableRows(tableLines);
        if (!parsedTable) {
            textBuffer.push(...tableLines);
            i = cursor - 1;
            continue;
        }

        nodes.push(renderParsedMarkdownTable(parsedTable, `${keyPrefix}-table-${i}`));

        i = cursor - 1;
    }

    flushTextBuffer('end');
    return nodes.length > 0 ? <>{nodes}</> : <span key={keyPrefix}>{part}</span>;
};

const UNIFIED_MESSAGE_REGEX = /(\$\$[\s\S]*?\$\$|\\?\\\[[\s\S]*?\\?\\\]|\\?\\\([\s\S]*?\\?\\\)|(?<!\$)\$(?!\$)(?:[^$\\]|\\.)*?\$(?!\$)|\*\*(?:.*?)\*\*|^###\s+(?:.+)$|\[SYSTEM:[^\]]+\]|\[CTA:[^\]]+\])/gm;

const formatRichTextSegment = (cleanSegment, handleTutorAction, activeAgentId, keyBase) => {
    if (typeof cleanSegment !== 'string' || !cleanSegment) return [];
    const parts = cleanSegment.split(UNIFIED_MESSAGE_REGEX);
    return parts.map((part, idx) => {
        if (!part && part !== '') return null;
        if (part === undefined) return null;
        const key = `${keyBase}-${idx}`;

        if (part.startsWith('[SYSTEM:') && part.endsWith(']')) {
            return null;
        }

        if (part.startsWith('[CTA:') && part.endsWith(']')) {
            const ctaContent = part.slice(5, -1).split('|');
            const label = ctaContent[0]?.trim() || "Start Now";
            const value = ctaContent[1]?.trim() || label;
            const legacyIntent = `${label} ${value}`.toLowerCase();
            let actionType; let actionPayload;
            if (value.toLowerCase().startsWith('open_lab:')) {
                actionType = 'open_lab';
                const paramsStr = value.slice('open_lab:'.length);
                const params = new URLSearchParams(paramsStr);
                let level = params.get('level') || '3';
                const validLevels = ['3', '4', '5', '7'];
                if (!validLevels.includes(level)) {
                    const num = parseInt(level, 10);
                    if (num <= 3) level = '3';
                    else if (num === 4) level = '4';
                    else if (num >= 5 && num < 7) level = '5';
                    else if (num >= 7) level = '7';
                    else level = '3';
                }
                actionPayload = { topic: params.get('topic') || '', level: level };
            } else if (value.toLowerCase().startsWith('open_quest') || legacyIntent.includes('start practice') || legacyIntent.includes('quest')) {
                actionType = 'open_quest';
                actionPayload = { value, agentId: activeAgentId };
            } else if (value.toLowerCase().startsWith('open_mock')) {
                actionType = 'open_mock';
                actionPayload = { value };
            } else {
                actionType = 'send_text';
                actionPayload = { value };
            }

            return (
                <div key={key} className="my-4">
                    <button
                        type="button"
                        onClick={() => handleTutorAction({ type: actionType, label, payload: actionPayload })}
                        className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        {label}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            );
        }

        if (part.startsWith('$$') && part.endsWith('$$') && part.length > 4) {
            const mathStr = part.slice(2, -2).trim();
            return <SafeBlockMath key={key} math={mathStr} />;
        }

        if (/^\\?\\\[/.test(part) && /\\?\\\]$/.test(part)) {
            const mathStr = part.replace(/^\\?\\\[/, '').replace(/\\?\\\]$/, '').trim();
            return <SafeBlockMath key={key} math={mathStr} />;
        }

        if (/^\\?\\\(/.test(part) && /\\?\\\)$/.test(part)) {
            let mathStr = part.replace(/^\\?\\\(/, '').replace(/\\?\\\)$/, '').trim();
            mathStr = mathStr.replace(/\\+$/, '').trim();
            return <SafeInlineMath key={key} math={mathStr} />;
        }

        if (part.startsWith('$') && part.endsWith('$') && !part.startsWith('$$') && part.length > 2) {
            const mathStr = part.slice(1, -1).trim();
            if (mathStr.length > 0) {
                return <SafeInlineMath key={key} math={mathStr} />;
            }
        }

        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={key} className="font-bold">{part.slice(2, -2)}</strong>;
        }

        if (part.startsWith('### ')) {
            return <div key={key} className="font-bold text-base mt-3 mb-1">{part.slice(4)}</div>;
        }

        return <React.Fragment key={key}>{renderTextWithTables(part, key)}</React.Fragment>;
    }).filter(Boolean);
};

const formatMessageContent = (content, handleTutorAction, activeAgentId = 'english') => {
    if (typeof content !== 'string') return content;

    const { text: cleanForDisplay } = parseSuggestions(content);
    const cleanContent = cleanForDisplay.replace(/\n{3,}/g, '\n\n');

    const segments = extractTableSegments(cleanContent);
    const nodes = segments.flatMap((seg, sIdx) => {
        if (seg.type === 'table') {
            const parsed = parseMarkdownTableRows(seg.lines);
            if (!parsed) {
                return formatRichTextSegment(seg.lines.join('\n'), handleTutorAction, activeAgentId, `fmt-fallback-${sIdx}`);
            }
            return [renderParsedMarkdownTable(parsed, `fmt-table-${sIdx}`)];
        }
        if (!seg.content) return [];
        return formatRichTextSegment(seg.content, handleTutorAction, activeAgentId, `fmt-${sIdx}`);
    });
    return nodes.length ? nodes : null;
};

const ChatInterface = ({ onOpenQuest }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        activeAgent, activeAgentId, setActiveAgentId,
        avatarState, setAvatarState,
        studentState, setStudentState,
        isFocusMode, setIsFocusMode,
        equipment, syncEquipment
    } = useAvatar();
    const { user, profile, loginWithGoogle, logout, verifyEmail, reloadUser } = useAuth(); // Destructure all needed methods
    const { t, toggleLanguage, language } = useLanguage();

    console.log("[ChatInterface] Render triggered. User:", user?.email, "Verified:", user?.emailVerified);

    // State definitions moved to top
    const [hasDiagnostic, setHasDiagnostic] = useState(false);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);

    // Helper function to save a single message to backend (Firestore) - Memoized to ensure fresh state
    const saveMessageToBackend = React.useCallback(async (message) => {
        console.log("[ChatInterface] DEBUG: saveMessageToBackend (API) called for role:", message.role);
        
        if (!user || user.uid === 'guest') {
            console.log("[ChatInterface] Skipping save: Not authenticated user or Guest mode.");
            return;
        }

        try {
            const token = await user.getIdToken();
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const targetUrl = `${API_URL}/api/history/${activeAgentId}`;
            
            console.log(`[ChatInterface] >>> INITIATING SAVE: [${message.role}] to ${targetUrl} (UID: ${user.uid})`);
            
            const response = await fetch(targetUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    uid: user.uid,
                    role: message.role === 'user' ? 'user' : 'model',
                    content: message.content
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                console.error("[ChatInterface] Backend rejected history save:", response.status, errData);
            } else {
                console.log("[ChatInterface] <<< SAVE SUCCESSFUL");
            }
        } catch (error) {
            console.error(`[ChatInterface] CRITICAL: Error in saveMessageToBackend:`, error);
        }
    }, [user, activeAgentId]);

    const saveChipsToBackend = React.useCallback(async (chips) => {
        if (!user || user.uid === 'guest') return;
        try {
            const token = await user.getIdToken();
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            await fetch(`${API_URL}/api/history/${activeAgentId}/chips`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    uid: user.uid,
                    chips: Array.isArray(chips) ? chips : []
                })
            });
        } catch (error) {
            console.warn("[ChatInterface] Failed to save chips cache:", error?.message || error);
        }
    }, [user, activeAgentId]);

    const clearChipsCacheOnBackend = React.useCallback(async () => {
        if (!user || user.uid === 'guest') return;
        try {
            const token = await user.getIdToken();
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            await fetch(`${API_URL}/api/history/${activeAgentId}/chips?uid=${user.uid}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.warn("[ChatInterface] Failed to clear chips cache:", error?.message || error);
        }
    }, [user, activeAgentId]);


    // Always derive dreamSubject from first dream program (JUPAS programmes are source of truth)
    const resolvedDreamSubject = (() => {
        if (profile?.dreamPrograms && Array.isArray(profile.dreamPrograms) && profile.dreamPrograms.length > 0) {
            const first = profile.dreamPrograms[0];
            return first.name || first.title || first.label || first.programmeName || '';
        }
        return '';
    })();

    // Dynamic Chips Logic based on User State
    const suggestionChips = (() => {
        if (activeAgentId === 'ace') {
            const subject = resolvedDreamSubject || "夢想學科";
            return [
                { label: "精算我的 Best 5 目標", value: "我想要精算我嘅 Best 5 成績估計同目標差距", emoji: "📊" },
                { label: `解構 ${subject} 加權比重`, value: `我想知 ${subject} 嘅收生加權比重 (Weighting) 同 Career Path`, emoji: "🎓" },
                { label: "5** 奪星攻勢策略", value: "話俾我聽點樣可以攞到 5* 甚至 5** 嘅攻勢策略？", emoji: "💡" }
            ];
        }
        if (!hasDiagnostic) {
            return [
                { label: t('chat.what_is_ace_it'), value: "What is Ace It?", emoji: "🤔" },
                { label: t('chat.start_mock'), value: "I want to try a mock exam", emoji: "📝" }
            ];
        } else {
            return [
                { label: "What should I focus on?", value: "Analyze my recent performance and tell me what to focus on today.", emoji: "🧠" }
            ];
        }
    })();

    const [dynamicChips, setDynamicChips] = useState([]);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [selectedImage, setSelectedImage] = useState(null); // { data: base64, type: mimeType, preview: url }
    // isQuestOpen removed - controlled by parent
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);
    const messagesEndRef = useRef(null);
    const chipScrollRef = useRef(null);
    const [isAtLeft, setIsAtLeft] = useState(true);
    const [isAtRight, setIsAtRight] = useState(false);
    const chatContainerRef = useRef(null);
    const sectionRef = useRef(null);
    const lastUserMessageRef = useRef(null);
    const isHistoryScrolledRef = useRef(false);

    const handleChipScroll = (direction) => {
        if (!chipScrollRef.current) return;
        const scrollAmount = 200;
        chipScrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    const updateScrollState = () => {
        if (!chipScrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = chipScrollRef.current;
        setIsAtLeft(scrollLeft <= 5);
        setIsAtRight(scrollLeft + clientWidth >= scrollWidth - 5);
    };

    useEffect(() => {
        const el = chipScrollRef.current;
        if (el) {
            el.addEventListener('scroll', updateScrollState);
            // Initial check after content loads
            setTimeout(updateScrollState, 500);
            return () => el.removeEventListener('scroll', updateScrollState);
        }
    }, [dynamicChips, messages.length]);
    const [showChips, setShowChips] = useState(false);
    const [isUploaderOpen, setIsUploaderOpen] = useState(false);
    const [mockExams, setMockExams] = useState([]);

    const [writingExams, setWritingExams] = useState([]);
    const [listeningExams, setListeningExams] = useState([]);
    const [speakingExams, setSpeakingExams] = useState([]);
    const [examState, setExamState] = useState({
        isActive: false,
        paperId: null,
        currentQuestionId: 1,
        paperMetadata: null
    });
    const [isEnlarged, setIsEnlarged] = useState(false);
    const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
    const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
    const [isImageConfirmOpen, setIsImageConfirmOpen] = useState(false);
    const [isChatQrImageOpen, setIsChatQrImageOpen] = useState(false);
    const [imagePrompt, setImagePrompt] = useState("");
    const [hasStartedTyping, setHasStartedTyping] = useState(false); // Tracks if user modified the default prompt
    const [isMuted, setIsMuted] = useState(true);
    const isMutedRef = useRef(true);
    const [gender, setGender] = useState(null);
    const [isToolsOpen, setIsToolsOpen] = useState(false);
    const toolsRef = useRef(null);
    const verbifyChip = (chip) => {
        // No longer auto-prefixing chips with verbs/subjects.
        // The backend already sends chips with natural, context-aware labels.
        return chip;
    };



    // Close tools menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (toolsRef.current && !toolsRef.current.contains(event.target)) {
                setIsToolsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    const [isNewStudent, setIsNewStudent] = useState(true); // Default to true until fetched
    const idleTimerRef = useRef(null);

    // Mastery Compass State - Redirects to dedicated pages
    // Dream Programs page navigation

    // Auto-expand textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [inputValue]);


    const speakText = (text, agentId, audioContent = null) => {
        if (!text || isMutedRef.current) return;

        // 1. High-Fidelity Gemini Audio (Multimodal)
        if (audioContent) {
            try {
                const audio = new Audio("data:audio/mp3;base64," + audioContent);
                audio.play();
                console.log("[TTS] Playing Native High-Fidelity Gemini Audio");
                return;
            } catch (err) {
                console.error("[TTS] Failed to play backend audio, falling back to browser TTS", err);
            }
        }

        // 2. Browser-Native Fallback
        const cleanText = text
            .replace(/\[SYSTEM:.*?\]/g, '')
            .replace(/\[FORCE_TTS\]/g, '')
            .replace(/\[TRIGGER_CLEAR\]/g, '')
            .replace(/\[STUDENT_STATE:.*?\]/g, '')
            .replace(/\[REDIRECT_DIAGNOSTIC\]/g, '')
            .replace(/\[LIST_MOCKS:.*?\]/g, '')
            .replace(/\$\$[\s\S]*?\$\$/g, ' [mathematical expression] ')
            .replace(/\\\[[\s\S]*?\\\]/g, ' [mathematical expression] ')
            .replace(/\\\(|\\\)/g, '')
            .replace(/\*\*|__/g, '')
            .replace(/###\s/g, '')
            .replace(/\\/g, '') // Clean stray backslashes
            .trim();

        if (!cleanText) return;

        const utterance = new SpeechSynthesisUtterance(cleanText);
        const voices = window.speechSynthesis.getVoices();

        let selectedVoice = null;
        const isEnglish = agentId === 'english';

        if (isEnglish) {
            selectedVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Female') || v.name.includes('Google'))) || voices[0];
        } else {
            selectedVoice = voices.find(v => v.lang.includes('en') && v.name.includes('Male')) || voices[0];
        }

        if (selectedVoice) utterance.voice = selectedVoice;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    };


    const getStudentAvatar = () => {
        const img = equipment.student?.image;
        if (!img) return '/avatars/Student/Marcus.jpeg';
        if (img.startsWith('/') || img.startsWith('http')) return img;
        if (img.startsWith('s_') && !img.includes('/')) return `/avatars/${img}`;
        return img;
    };

    const isProcessedRef = useRef(false);

    // Listen for events from MasteryModal
    useEffect(() => {
        const handleStartChat = (e) => {
            const { message } = e.detail;
            if (message) {
                handleSendMessage(message);
            }
        };

        window.addEventListener('start-ai-chat', handleStartChat);
        return () => window.removeEventListener('start-ai-chat', handleStartChat);
    }, []);

    // Idle Detection removed per USER request
    /*
    useEffect(() => {
        const resetIdleTimer = () => {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    
            // Only trigger if last message was from assistant and not a system response
            const lastMsg = messages[messages.length - 1];
            const isSystem = lastMsg?.isSystemResponse || lastMsg?.content?.includes('[SYSTEM:');
    
            if (lastMsg && lastMsg.role === 'assistant' && !isSystem) {
                idleTimerRef.current = setTimeout(() => {
                    console.log("[Idle] Student inactive for 60s. Checking in...");
                    handleSendMessage('[SYSTEM: STUDENT_IDLE]', true);
                }, 60000);
            }
        };
    
        resetIdleTimer();
        return () => {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        };
    }, [messages]);
    */

    // Initial greeting or History restore
    useEffect(() => {
        isHistoryScrolledRef.current = false; // Reset scroll state for new agent/history fetch
        setDynamicChips([]); // Reset dynamic chips on agent switch
        setMessages([]); // Clear messages immediately for instant feedback
        setIsHistoryLoading(true);
        setHasDiagnostic(false);

        const fetchHistory = async () => {
            if (user) {
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

                    console.log(`[ChatInterface] Fetching history for UID: ${user.uid}, Agent: ${activeAgentId}`);

                    const authHeaders = {};
                    if (typeof user.getIdToken === 'function') {
                        try {
                            const token = await user.getIdToken();
                            if (token) authHeaders.Authorization = `Bearer ${token}`;
                        } catch (e) {
                            console.warn('[ChatInterface] getIdToken failed during history load:', e?.message || e);
                        }
                    }

                    // 1 & 2. Parallelize Fetches (Bearer keeps Entra req.uid aligned with profile/history)
                    const [statsRes, historyRes, chipsRes] = await Promise.all([
                        fetch(`${API_URL}/api/stats?uid=${user.uid}`, { headers: { ...authHeaders } }).catch(err => {
                            console.warn("Stats fetch failed", err);
                            return { ok: false };
                        }),
                        fetch(`${API_URL}/api/history/${activeAgentId}?uid=${user.uid}`, { headers: { ...authHeaders } }).catch(err => {
                            console.warn("History fetch failed", err);
                            return { ok: false };
                        }),
                        fetch(`${API_URL}/api/history/${activeAgentId}/chips?uid=${user.uid}`, { headers: { ...authHeaders } }).catch(err => {
                            console.warn("Chips cache fetch failed", err);
                            return { ok: false };
                        })
                    ]);

                    let currentHasDiagnostic = false;
                    if (statsRes.ok) {
                        const statsData = await statsRes.json();
                        if (statsData.gender) setGender(statsData.gender);
                        if (statsData.is_new_student !== undefined) setIsNewStudent(statsData.is_new_student);

                        currentHasDiagnostic = typeof statsData?.hasDiagnostic === 'object' && statsData?.hasDiagnostic !== null
                            ? (activeAgentId === 'math' ? statsData.hasDiagnostic.maths : statsData.hasDiagnostic.english)
                            : statsData?.hasDiagnostic === true;
                    }

                    setHasDiagnostic(currentHasDiagnostic);

                    // Do not block chat history rendering on equipment sync.
                    // If this request is slow/intermittent, history should still appear immediately.
                    Promise.resolve(syncEquipment()).catch((e) => {
                        console.warn("[ChatInterface] syncEquipment failed during history restore:", e?.message || e);
                    });

                    let visibleHistory = [];
                    if (historyRes.ok) {
                        const history = await historyRes.json();
                        console.log(`[ChatInterface] Received ${history.length} messages from history API`);
                        // Normalize roles ('model' -> 'assistant') for frontend compatibility
                        visibleHistory = history.map(m => ({
                            ...m,
                            role: m.role === 'model' ? 'assistant' : m.role
                        }));
                    } else {
                        console.error(`[ChatInterface] History API failed with status: ${historyRes.status}`);
                    }

                    // Guard against empty/invalid legacy rows to avoid rendering blank chat bubbles.
                    const cleanHistory = visibleHistory.filter((m) => {
                        if (!m) return false;
                        if (typeof m.content !== 'string') return false;
                        return m.content.trim().length > 0;
                    });
                    const displayHistory = trimTrailingUserTurnsForDisplay(cleanHistory);

                    if (displayHistory.length > 0) {
                        setMessages(displayHistory);
                        let restoredFromHistory = false;

                        // Restore dynamic chips from the last assistant message
                        const lastAssistantMsg = [...displayHistory].reverse().find(m => m.role === 'assistant');
                        if (lastAssistantMsg) {
                            const parsed = parseSuggestions(lastAssistantMsg.content);
                            if (parsed.suggestions && parsed.suggestions.length > 0) {
                                console.log(`[ChatInterface] Restored ${parsed.suggestions.length} dynamic chips from history`);
                                setDynamicChips(normalizeChips(parsed.suggestions));
                                restoredFromHistory = true;
                            }
                        }

                        if (!restoredFromHistory && chipsRes.ok) {
                            const chipsData = await chipsRes.json();
                            const cachedChips = normalizeChips(chipsData?.chips || []);
                            if (cachedChips.length > 0) {
                                console.log(`[ChatInterface] Restored ${cachedChips.length} dynamic chips from cache`);
                                setDynamicChips(cachedChips);
                            }
                        }

                        setShowChips(true);
                    } else {
                        let initialContent;
                        const agentName = activeAgent?.name || "Ace Sir";
                        const userName = user?.displayName || user?.email?.split('@')[0] || "小戰士";

                        if (activeAgentId === 'ace') {
                            const subject = resolvedDreamSubject;
                            initialContent = subject
                                ? `你好 ${userName}！我係 ${agentName}。聽講你目標係入 **${subject}**？同我講你嘅計劃，我幫你制定 DSE 奪星策略，確保你穩入大學！`
                                : `你好 ${userName}！我係 ${agentName}。想入邊間大學？同我講你嘅目標，我幫你制定全方位奪星藍圖，助你進軍大學、稱霸 DSE！`;
                        } else if (['english', 'math'].includes(activeAgentId) && !currentHasDiagnostic) {
                            // Always use greeting_new for new students, which now has no calibration mention
                            initialContent = t('chat.greeting_new', { agentName, userName });
                        } else {
                            initialContent = t('chat.greeting_return', { agentName, userName });
                        }

                        setMessages([{
                            role: 'assistant',
                            content: initialContent,
                            agentId: activeAgentId
                        }]);
                        setShowChips(true);
                    }

                    // 3. Process Post-Activity State SEQUENTIALLY after history is loaded
                    if (!isProcessedRef.current) {
                        const token = await user.getIdToken().catch(() => null);
                        const pendingEventsRes = await fetch(`${API_URL}/api/user/tutor-events/pending-summary?uid=${user.uid}&limit=10`, {
                            headers: token ? { Authorization: `Bearer ${token}` } : {}
                        }).catch(err => {
                            console.warn("Pending tutor events fetch failed", err);
                            return { ok: false };
                        });
                        if (pendingEventsRes.ok) {
                            const pendingData = await pendingEventsRes.json();
                            const pendingEvents = Array.isArray(pendingData.events) ? pendingData.events : [];
                            if (pendingEvents.length > 0) {
                                isProcessedRef.current = true;
                                const eventSummary = pendingEvents.map(event => ({
                                    id: event.id,
                                    type: event.type,
                                    completedAt: event.completedAt,
                                    payload: event.payload || {}
                                }));
                                const result = await handleSendMessage(`[SYSTEM: PENDING_COMPLETION_SUMMARY]\n${JSON.stringify(eventSummary)}`, true);
                                if (result?.success) {
                                    await fetch(`${API_URL}/api/user/tutor-events/mark-summarized`, {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            ...(token ? { Authorization: `Bearer ${token}` } : {})
                                        },
                                        body: JSON.stringify({
                                            uid: user.uid,
                                            eventIds: pendingEvents.map(event => event.id)
                                        })
                                    }).catch(err => console.warn("Tutor event ack failed", err));
                                }
                                navigate('/dashboard', { replace: true, state: {} });
                                window.history.replaceState({}, document.title);
                                return;
                            }
                        }

                        const searchParams = new URLSearchParams(location.search);
                        const questCompleted = searchParams.get('quest_completed');
                        const questTopic = searchParams.get('topic');
                        const questScore = searchParams.get('score');
                        const questXp = searchParams.get('xp');

                        if (questCompleted === 'true' || location.state?.questCompleted) {
                            isProcessedRef.current = true;
                            const topicToReport = questTopic || location.state?.topic || 'Activity';
                            
                            // Use detailed LAB_COMPLETED if score is available, otherwise generic QUEST_COMPLETED
                            const systemMsg = (questScore !== null)
                                ? `[SYSTEM: LAB_COMPLETED: ${topicToReport} | XP: ${questXp || 0} | Mastery: ${questScore}%]`
                                : `[SYSTEM: QUEST_COMPLETED: ${topicToReport}]`;
                                
                            handleSendMessage(systemMsg, true);
                            navigate('/dashboard', { replace: true, state: {} });
                            window.history.replaceState({}, document.title);
                        } else if (location.state?.diagnosticCompleted) {
                            isProcessedRef.current = true;
                            setHasDiagnostic(true);
                            const criticalAreas = location.state.criticalAreas || [];
                            const archetype = location.state.archetype || "Student";
                            if (location.state.activeAgentId) {
                                setActiveAgentId(location.state.activeAgentId);
                            }
                            setDynamicChips(criticalAreas);
                            handleSendMessage(`[SYSTEM: DIAGNOSTIC_JUST_COMPLETED: ${archetype}]`, true);
                            window.history.replaceState({}, document.title);
                            navigate('/dashboard', { replace: true, state: {} });
                        } else if (location.state?.labCompleted) {
                            isProcessedRef.current = true;
                            const { topic, earnedXp, masteryScore } = location.state;
                            handleSendMessage(`[SYSTEM: LAB_COMPLETED: ${topic} | XP: ${earnedXp || 0} | Mastery: ${masteryScore || 0}%]`, true);
                            window.history.replaceState({}, document.title);
                        } else if (location.state?.mockCompleted) {
                            isProcessedRef.current = true;
                            const { type, level, score, improvements } = location.state;
                            
                            // 1. Send hidden system trigger to sync state with AI
                            const systemMsg = `[SYSTEM: MOCK_COMPLETED: ${type.toUpperCase()} | Level: ${level} | Score: ${score}]`;
                            handleSendMessage(systemMsg, true);

                            // 2. Add improvement advice as a proper ASSISTANT message
                            if (improvements) {
                                const aiMsg = {
                                    role: 'assistant',
                                    content: improvements,
                                    agentId: activeAgentId,
                                    isSystemResponse: true
                                };
                                setMessages(prev => [...prev, aiMsg]);
                                // Manually save to backend history so it persists with correctly mapped 'model' role
                                saveMessageToBackend(aiMsg);
                            }
                            
                            window.history.replaceState({}, document.title);
                        } else if (location.state?.examCompleted) {
                            isProcessedRef.current = true;
                            const { examId } = location.state;
                            handleSendMessage(`[SYSTEM: EXAM_JUST_COMPLETED: ${examId}]`, true);
                            window.history.replaceState({}, document.title);
                        } else if (location.state?.startPrompt) {
                            isProcessedRef.current = true;
                            handleSendMessage(location.state.startPrompt);
                            window.history.replaceState({}, document.title);
                        } else if (location.state?.prefillPrompt) {
                            isProcessedRef.current = true;
                            // Switch to the target agent if different from current
                            if (location.state?.targetAgentId && location.state.targetAgentId !== activeAgentId) {
                                setActiveAgentId(location.state.targetAgentId);
                            }
                            // Pre-fill the input box so the student can edit/confirm before sending
                            setInputValue(location.state.prefillPrompt);
                            window.history.replaceState({}, document.title);
                            // Focus the textarea after a short delay to let the state update
                            setTimeout(() => {
                                textareaRef.current?.focus();
                            }, 300);
                        }
                    }
                } catch (err) {
                    console.error("fetchHistory failed", err);
                } finally {
                    setIsHistoryLoading(false);
                }
            } else {
                // GUEST MODE
                const agentName = activeAgent?.name || "Ace Sir";
                const userName = "小戰士";
                let content = ['english', 'math'].includes(activeAgentId)
                    ? t('chat.greeting_new', { agentName, userName })
                    : t('chat.greeting_generic', { agentName, userName });

                setMessages([{
                    role: 'assistant',
                    content: content,
                    agentId: activeAgentId
                }]);
                setShowChips(true);
                setIsHistoryLoading(false);
            }
        };

        fetchHistory();
        setAvatarState('IDLE');
    }, [activeAgentId, setAvatarState, activeAgent.name, user]);

    // Auto-scroll to bottom whenever messages update or history finishes loading
    // We use useLayoutEffect for the initial history jump to prevent the user from seeing the scroll animation
    useLayoutEffect(() => {
        if (!isHistoryLoading && messages.length > 0 && chatContainerRef.current && !isHistoryScrolledRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            isHistoryScrolledRef.current = true;
            console.log("[ChatInterface] History restored: Initial instant scroll applied.");
        }
    }, [messages.length, isHistoryLoading]);

    // Subsequent smooth scroll for new incoming messages
    useEffect(() => {
        if (isHistoryScrolledRef.current && messages.length > 0 && chatContainerRef.current) {
            const timer = setTimeout(() => {
                if (chatContainerRef.current) {
                    chatContainerRef.current.scrollTo({
                        top: chatContainerRef.current.scrollHeight,
                        behavior: "smooth"
                    });
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [messages.length]);






    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        console.log(`[ChatInterface] File selected:`, file ? file.name : 'none');

        if (!file) return;

        if (!file.type.startsWith('image/')) {
            console.warn('[ChatInterface] Unsupported file type:', file.type);
            alert("Please upload an image file (JPG or PNG).");
            return;
        }

        // Restriction: Guest 1-upload limit
        if (!user) {
            const uploadedImages = messages.filter(m => m.role === 'user' && m.image).length;
            if (uploadedImages >= 1) {
                alert("Guest preview: You can only upload 1 image per session. Sign up to upload more!");
                return;
            }
        }

        try {
            const { base64Data, mimeType } = await readAndPrepareImageFile(file);
            const previewUrl = URL.createObjectURL(file);
            setSelectedImage({
                data: base64Data,
                type: mimeType,
                preview: previewUrl
            });

            const defaultPrompt = activeAgentId === 'math'
                ? "Please help me solve this maths question."
                : t('chat.image_attach_default_prompt');
            setImagePrompt(defaultPrompt);
            setHasStartedTyping(false);
            setIsImageConfirmOpen(true);
        } catch (err) {
            console.error('[ChatInterface] FileReader error:', err);
            alert("Failed to read the file. Please try again.");
        }
    };

    const onChatQrHandoffPhoto = useCallback((msg) => {
        if (!msg?.payload?.image?.data) return;
        const mime = msg.payload.image.mimeType || 'image/jpeg';
        const data = msg.payload.image.data;
        setSelectedImage({
            data,
            type: mime,
            preview: `data:${mime};base64,${data}`
        });
        const defaultPrompt = activeAgentId === 'math'
            ? "Please help me solve this maths question."
            : t('chat.image_attach_default_prompt');
        setImagePrompt(defaultPrompt);
        setHasStartedTyping(false);
        setIsChatQrImageOpen(false);
        setIsImageConfirmOpen(true);
    }, [activeAgentId, t]);



    const handleSendMessage = async (overrideValue, isHidden = false) => {
        const textToSend = overrideValue || inputValue;
        if (!textToSend.trim() && !selectedImage) return;

        if (!isHidden) {
            // --- MATHS DIAGNOSTIC INTERCEPT ---
            if (textToSend === "I want to start the diagnostic test" && activeAgentId === 'math') {
                const userMsg = { role: 'user', content: textToSend };
                setMessages(prev => [...prev, userMsg]);
                saveMessageToBackend(userMsg); // Save for history

                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: "Let's calibrate your Maths skills! Opening the assessment now... 📐",
                    agentId: 'math'
                }]);

                setTimeout(() => {
                    navigate('/maths-diagnostic', { state: { forceRestart: true } });
                }, 1500);
                return;
            }

            if (textToSend.includes("[ACTIVATING_EXAM_MODE]")) {
                const paperId = textToSend.split("I want to study ")[1];

                // UX FIX: Show "Starting Exam..." instead of raw code
                const friendlyMessage = { role: 'user', content: `Start Mock Exam: ${paperId.split('_').slice(1).join(' ')}` };
                setMessages(prev => [...prev, friendlyMessage]);

                // Save raw command to backend for history consistency (optional, or save friendly)
                // saveMessageToBackend({ role: 'user', content: textToSend }); // Removed: Redundant as /api/chat saves

                setMessages(prev => [...prev, { role: 'assistant', content: `Preparing your ${paperId} mock exam...` }]);
                setInputValue('');
                setTimeout(() => {
                    // Consolidate all legacy exam activations to the new Mock Library
                    navigate('/mock-exam', { state: { autoSelectId: paperId } });
                }, 1500);
                return;
            }
        }

        // --- REGULAR CHAT FLOW ---
        let finalMessage = textToSend;
        if (!finalMessage.trim() && selectedImage) {
            // Default text for image-only uploads to provide context in the bubble
            finalMessage = activeAgentId === 'math' ? "[Math image]" : "[Image attached]";
        }

        const userMsg = {
            role: 'user',
            content: finalMessage,
            image: selectedImage ? { preview: selectedImage.preview } : null,
            isHidden: isHidden
        };

        setMessages(prev => [...prev, userMsg]);
        // User turns are persisted by POST /api/chat — avoid a second save that can
        // race after the tutor reply and become the last row on refresh.

        const currentInput = finalMessage;

        if (!isHidden) {
            clearChipsCacheOnBackend();
        }
        if (showChips) setShowChips(false);
        setDynamicChips([]); // Clean slate for next AI response
        const currentImage = selectedImage;

        setInputValue('');
        setSelectedImage(null);
        setAvatarState('THINKING');
        if (currentImage) setIsAnalyzingImage(true);
        setStudentState('TALKING');

        // Reset student to idle/listening after they "finish" speaking
        setTimeout(() => setStudentState('IDLE'), 2000);

        try {


            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

            // Prepare history (start from index 0 to include greeting context).
            // The backend applies an authoritative window (MAX_TURNS = 12) and
            // truncation. We mirror a generous slice (last 24) here purely to
            // shrink the JSON payload over the wire when threads get long.
            const MAX_PAYLOAD_TURNS = 24;
            const fullThread = [
                ...(messages.length > 0 ? messages : []),
                ...(isHidden ? [] : [userMsg])
            ];
            const historyForAPI = fullThread
                .slice(-MAX_PAYLOAD_TURNS)
                .map(m => ({
                    role: m.role === 'user' ? 'user' : 'model', // Gemini uses 'model'
                    parts: [{ text: m.content }]
                }));

            const authHeaders = { 'Content-Type': 'application/json' };
            if (user && typeof user.getIdToken === 'function') {
                try {
                    const token = await user.getIdToken();
                    if (token) authHeaders.Authorization = `Bearer ${token}`;
                } catch (tokenErr) {
                    console.warn('[ChatInterface] getIdToken failed:', tokenErr?.message || tokenErr);
                }
            }

            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({
                    uid: user?.uid || 'guest',
                    message: currentInput,
                    image: currentImage ? { data: currentImage.data, mimeType: currentImage.type } : null,
                    history: historyForAPI, // Use the carefully constructed history
                    agentId: activeAgentId,
                    outputLanguage: language // Pass preference to backend
                })

            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown server error' }));
                const error = new Error(errorData.error || `Server Error (${response.status}): ${response.statusText}`);
                error.diag_info = errorData.diag_info;
                throw error;
            }

            const data = await response.json();

            // LOGGING TO HELP DEBUG PERSISTENCE
            console.log(`[ChatInterface] AI Response received. diag_info: ${data.diag_info}`);

            // Handling [FORCE_TTS] tag for Listening Mode
            let rawReply = data.reply || data.text;
            if (!rawReply) throw new Error("Backend failed to generate a reply.");

            // Type Safety: Ensure replyText is a string even if backend returns an object
            let replyText = '';
            let parsedReply = null;
            let nextChips = normalizeChips(data.suggested_chips);

            if (typeof rawReply === 'string' && (rawReply.trim().startsWith('{') || rawReply.trim().startsWith('['))) {
                try {
                    parsedReply = JSON.parse(rawReply);
                } catch {
                    // Not valid JSON, treat as string
                }
            } else if (typeof rawReply === 'object') {
                parsedReply = rawReply;
            }

            if (parsedReply) {
                replyText = parsedReply.text || parsedReply.reply || (typeof rawReply === 'string' ? rawReply : JSON.stringify(parsedReply));
                nextChips = normalizeChips(parsedReply.suggested_chips || nextChips);
            } else {
                replyText = String(rawReply);
            }

            const forceTTS = replyText.includes('[FORCE_TTS]');
            const shouldClear = replyText.includes('[TRIGGER_CLEAR]');

            // Check for dynamic student state tag
            const studentStateMatch = replyText.match(/\[STUDENT_STATE:\s*(\w+)\]/);
            let aiSetStudentState = 'LISTENING';
            if (studentStateMatch) {
                aiSetStudentState = studentStateMatch[1].toUpperCase();
                replyText = replyText.replace(studentStateMatch[0], '');
            }

            if (replyText.includes('[REDIRECT_DIAGNOSTIC]')) {
                replyText = replyText.replace('[REDIRECT_DIAGNOSTIC]', '').trim();
                setTimeout(() => {
                    console.log("[Redirect] Heading to Diagnostic...");
                    const targetPath = activeAgentId === 'math' ? '/maths-diagnostic' : '/diagnostic';
                    navigate(targetPath, { state: { forceRestart: true } });
                }, 1000); // reduced delay
            }

            // Check for dynamic suggestions tag
            const { suggestions: chips } = parseSuggestions(replyText);
            if (chips.length > 0) {
                nextChips = normalizeChips(chips);
                // The display text will be cleaned by formatMessageContent and render logic
            }
            if (nextChips.length > 0) {
                setDynamicChips(nextChips);
                setShowChips(true);
                saveChipsToBackend(nextChips);
            }

            // --- MOCK EXAM LISTING TAG ---
            // Regex Update: Handle optional backslashes (AI escaping)
            const mockListMatch = replyText.match(/\\?\[LIST_MOCKS:\s*([^\]]+)\]/);
            if (mockListMatch) {
                const paperType = mockListMatch[1].trim().toLowerCase();
                replyText = replyText.replace(mockListMatch[0], '');

                console.log("Detected Mock List Request for:", paperType);

                // Fetch mocks for this paper
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                    const endpoint = `/api/${paperType}/exams`;
                    console.log(`Fetching mocks from: ${API_URL}${endpoint}`);

                    fetch(`${API_URL}${endpoint}`)
                        .then(res => {
                            console.log("Mock API Status:", res.status);
                            return res.json();
                        })
                        .then(mocks => {
                            console.log("Mock API Response:", mocks);
                            if (Array.isArray(mocks) && mocks.length > 0) {
                                // OLD CHIP LOGIC REMOVED
                                // New Logic: Append In-Chat Message with Options
                                setMessages(prev => [...prev, {
                                    role: 'assistant',
                                    content: `Here are the available ${paperType} mock exams:`,
                                    customComponent: 'active_mock_list',
                                    mocks: mocks,
                                    paperType: paperType
                                }]);

                            } else {
                                console.warn("No mocks found or invalid format:", mocks);
                            }
                        })
                        .catch(err => console.error("Mock fetch error context:", err));
                } catch (e) {
                    console.error("Listing mocks failed catch:", e);
                }
            }

            // Clean tags from display
            replyText = replyText.replace('[FORCE_TTS]', '')
                .replace('[TRIGGER_CLEAR]', '')
                .replace(/\[LIST_MOCKS:\s*([^\]]+)\]/g, '') // Safety double-clean
                .trim();

            const aiMsg = {
                role: 'assistant',
                content: replyText,
                agentId: activeAgentId,
                customComponent: data.customComponent || null,
                payload: data.payload || null,
                actions: Array.isArray(data.actions) ? data.actions : [],
                examType: data.examType || null,
                isSystemResponse: data.isSystemResponse || isHidden // Mark as system if backend says so or if it was a hidden trigger
            };

            setAvatarState('HAPPY'); // Success state - moved up to prevent auto-scroll jump when msg arrives
            if (shouldClear) {
                // Keep the refusal message but clear history for next turn
                setMessages([aiMsg]);
            } else {
                setMessages(prev => [...prev, aiMsg]);
            }

            // AI Message is already auto-saved by the backend's /api/chat route.
            // No need to manually save it here to avoid double-writes.

            // Check for Diagnostic Completion Signal (XP Award Trigger)
            if (data.reply && data.reply.includes('[SYSTEM: DIAGNOSTIC_JUST_COMPLETED]')) {
                console.log("ChatInterface: Diagnostic Just Completed! Triggering XP refresh...");
                // Add small delay to ensure DB write propagates
                setTimeout(() => {
                    const event = new Event('xp_update');
                    window.dispatchEvent(event);
                }, 1500);
            }

            // Check for Quest Completion Signal from AI (Legacy or New)
            // Or if we are in a "Guided Learning" session initiated from Roadmap
            const activeTaskId = location.state?.activeTaskId; // We need to ensure RoadmapWidget passes this!
            if (activeTaskId && (replyText.includes("Great job!") || replyText.includes("lesson complete"))) {
                console.log(`[ChatInterface] Potential Quest Completion for ${activeTaskId}`);
                // Call Backend
                fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/roadmap/complete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uid: user.uid, taskId: activeTaskId })
                }).then(res => {
                    if (res.ok) {
                        console.log("Quest Marked Complete!");
                        // Trigger UI Refresh
                        window.dispatchEvent(new Event('xp_update')); // Re-fetch XP and Roadmap
                    }
                });
            }

            // AUTO-LAUNCH LAB: Removed to respect "No Auto-Redirect" rule. 
            // Students must click the Launch Card or confirm via chat.

            setStudentState(aiSetStudentState);

            // Speak logic: Speak if NOT muted OR if FORCE_TTS is present
            if (!isMutedRef.current || forceTTS) {
                speakText(replyText, activeAgentId, data.audioContent);
            }

            // Reset to IDLE after a few seconds (only if it was the default listening)
            // Reset to IDLE after a few seconds (only if it was the default listening)
            setTimeout(() => {
                setAvatarState('IDLE');
                if (aiSetStudentState === 'LISTENING') setStudentState('IDLE');

                if (nextChips.length > 0 || messages.length > 0) {
                    setShowChips(true);
                }
            }, 3000);
            return { success: true, data, message: aiMsg };

        } catch (error) {
            console.error('Chat error:', error);
            setAvatarState('UPSET'); 
            const diagInfo = error.diag_info ? ` [${error.diag_info}]` : "";
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Error: ${error.message}${diagInfo}. Please try again.`
            }]);
            return { success: false, error };
        }
 finally {
            console.log(`[ChatInterface] Finally reached. Resetting states...`);
            setIsAnalyzingImage(false);
            // Safety valve: Unconditionally reset to IDLE if we are stuck in THINKING
            // Use functional update to avoid stale closure issues
            setAvatarState(prev => prev === 'THINKING' ? 'IDLE' : prev);
        }
    };

    const handleTutorAction = (action) => {
        const type = action?.type || 'send_text';
        const payload = action?.payload || {};
        const value = payload.value || action?.value || action?.label || '';

        if (type === 'open_quest') {
            if (onOpenQuest) {
                onOpenQuest(payload.agentId || activeAgentId);
                return;
            }
            navigate('/lab');
            return;
        }

        if (type === 'open_mock') {
            if (value.includes('[ACTIVATING_EXAM_MODE]')) {
                handleSendMessage(value);
                return;
            }
            navigate('/mock-exam');
            return;
        }

        if (type === 'open_lab') {
            const searchParams = new URLSearchParams();
            if (payload.topic) searchParams.set('topic', payload.topic);
            let level = payload.level || '3';
            const validLevels = ['3', '4', '5', '7'];
            if (!validLevels.includes(level)) {
                const num = parseInt(level, 10);
                if (num <= 3) level = '3';
                else if (num === 4) level = '4';
                else if (num >= 5 && num < 7) level = '5';
                else if (num >= 7) level = '7';
                else level = '3';
            }
            searchParams.set('level', level);
            navigate(`/lab?${searchParams.toString()}`);
            return;
        }

        handleSendMessage(value);
    };

    // --- STABILIZED VOICE RECORDING LOGIC (MEDIA RECORDER + BACKEND STT) ---



    // Ensure voices are loaded (Chrome quirk)
    useEffect(() => {
        window.speechSynthesis.getVoices();
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleEssayConfirm = (text) => {
        setIsUploaderOpen(false);
        handleSendMessage(`[REQUEST_GRADING] Please grade my essay: \n\n${text}`);
    };

    const handleExamTrigger = async (paperId) => {
        setAvatarState('THINKING');
        // The backend will now detect this trigger and fetch content directly from Firestore
        handleSendMessage(`[ACTIVATING_EXAM_MODE] I want to study ${paperId}`);
    };

    // --- CLEAR HISTORY ---
    const handleClearHistory = () => {
        setIsClearConfirmOpen(true); // Open Modal
    };

    const confirmClearHistory = async () => {
        setIsClearConfirmOpen(false);
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/history/${activeAgentId}?uid=${user.uid}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setMessages([]); // Clear locally
                setDynamicChips([]); // Reset dynamic chips to empty so default suggestionChips are used
                clearChipsCacheOnBackend();
                setShowChips(true);
                // Trigger Smart Greeting (Local Translation)
                const agentName = activeAgent?.name || "Ace Sir";
                const userName = user?.displayName || user?.email?.split('@')[0] || "小戰士";
                let greetingContent;
                if (activeAgentId === 'ace') {
                    const subject = resolvedDreamSubject;
                    greetingContent = subject
                        ? `你好 ${userName}！我係 ${agentName}。聽講你目標係入 **${subject}**？同我講你嘅計劃，我幫你制定 DSE 奪星策略，確保你穩入大學！`
                        : `你好 ${userName}！我係 ${agentName}。想入邊間大學？同我講你嘅目標，我幫你制定全方位奪星藍圖，助你進軍大學、稱霸 DSE！`;
                } else if (['english', 'math'].includes(activeAgentId) && !hasDiagnostic) {
                    greetingContent = t('chat.greeting_new', { agentName, userName });
                } else {
                    greetingContent = t('chat.greeting_return', { agentName, userName });
                }
                setMessages([{
                    role: 'assistant',
                    content: greetingContent,
                    agentId: activeAgentId
                }]);
            } else {
                alert("Failed to clear history.");
            }
        } catch (e) {
            console.error("Clear history error:", e);
        }
    };

    const getPlaceholder = () => {
        if (selectedImage) return t('chat.add_desc');

        const lastMsg = messages[messages.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
            const text = (lastMsg.content || "").toLowerCase();

            // "What do you want to learn/start" scenarios
            if (text.includes('how can i help') ||
                text.includes('want to learn') ||
                text.includes('want to start') ||
                text.includes('what to focus on') ||
                text.includes('focus for today') ||
                text.includes("what's our focus") ||
                text.includes('anything specific') ||
                text.includes('let me know what') ||
                text.includes('ready for a quick')) {
                return t('chat.type_what_to_study');
            }

            // General questions implies waiting for answer
            if (text.includes('?')) {
                return t('chat.type_answer');
            }
        }

        // --- CUSTOM PER-AGENT PLACEHOLDERS ---
        if (activeAgentId === 'ace') return t('chat.placeholder_ace', { agentName: activeAgent.name });
        if (activeAgentId === 'math') return t('chat.placeholder_math', { agentName: activeAgent.name });
        if (activeAgentId === 'english') return t('chat.placeholder_english', { agentName: activeAgent.name });

        return t('chat.type_message');
    };

    const content = (
        <section
            ref={sectionRef}
            className={cn(
                "flex flex-col relative transition-all duration-500 h-full overflow-hidden",
                isFocusMode
                    ? "!fixed !top-0 !left-0 !m-0 inset-0 z-[999] rounded-none shadow-none h-screen w-screen flex flex-col overflow-hidden bg-white dark:bg-background-dark border-0"
                    : "w-full flex-1"
            )}>
            {/* Verification Overlay Removed */}
            {/* Verify-Then-Grade Modal */}
            {isUploaderOpen && (
                <EssayUploader
                    onConfirm={handleEssayConfirm}
                    onCancel={() => setIsUploaderOpen(false)}
                />
            )}

            {isChatQrImageOpen && (
                <div className="fixed inset-0 z-[360] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1a110a] w-full max-w-lg rounded-3xl shadow-2xl border border-black/5 dark:border-white/10 p-6 relative">
                        <button
                            type="button"
                            onClick={() => setIsChatQrImageOpen(false)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-lg font-black text-[#1d130c] dark:text-white pr-10 mb-2">
                            {t('chat.attach_photo_phone_title')}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            {t('chat.attach_photo_phone_subtitle')}
                        </p>
                        <QrHandoffPanel
                            surface="chat_tutor_image"
                            meta={{}}
                            onPhotoReceived={onChatQrHandoffPhoto}
                            onError={() => {}}
                            className="w-full"
                        />
                    </div>
                </div>
            )}

            {/* Header */}
            <div
                className={cn(
                    "relative shrink-0 px-8 py-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between",
                    isFocusMode
                        ? "bg-white dark:bg-background-dark"
                        : "bg-white/30 dark:bg-white/5 backdrop-blur-sm"
                )}
            >
                <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                        <div className="relative">
                            <div className={cn(
                                "w-[36px] h-[36px] rounded-full border-2 border-white overflow-hidden shadow-sm transition-all",
                                (avatarState === 'TALKING' || avatarState === 'THINKING') && "animate-talking-glow ring-2 ring-green-400"
                            )}>
                                <img src={activeAgent.avatar} alt="AI" className="avatar-portrait-chat" />
                            </div>
                            {/* Status Dot */}
                            <div className={cn(
                                "absolute -top-0.5 -right-0.5 size-3 rounded-full border-[1.5px] border-white z-10 transition-colors",
                                avatarState === 'THINKING' ? "bg-yellow-400 animate-pulse" :
                                    avatarState === 'UPSET' ? "bg-red-500" : "bg-green-500"
                            )}></div>
                        </div>
                        <div className={cn(
                            "w-[36px] h-[36px] rounded-full border-2 border-white overflow-hidden shadow-sm transition-transform relative",
                            studentState === 'TALKING' && "ring-2 ring-green-400 animate-talking-glow",
                            studentState === 'LISTENING' && "animate-pulse",
                            studentState === 'STUDYING' && "ring-2 ring-indigo-400 opacity-80"
                        )}>
                            <img src={getStudentAvatar()} alt="Student" className="avatar-portrait-chat" />
                            {equipment.frame && (
                                <img src={equipment.frame.image} alt="Frame" className="absolute inset-0 w-full h-full object-contain pointer-events-none scale-110 avatar-frame-mask" />
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-0.5">
                            {activeAgent.name}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium tracking-tight">
                            {activeAgent.headerInfo}
                        </span>
                    </div>
                </div>

                {/* CENTERED ACTION BUTTONS */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center gap-3">
                    {activeAgentId !== 'ace' && (
                        <button
                            onClick={() => onOpenQuest(activeAgentId)}
                            className={cn(
                                "px-6 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-sm border hover:shadow-md active:scale-95 min-w-[120px] justify-center",
                                "bg-amber-100/80 hover:bg-amber-100 text-amber-700 border-amber-200/50"
                            )}
                            title={t('nav.view_daily_quest')}
                        >
                            <Target className="w-5 h-5 stroke-[2.5]" />
                            <span className="text-sm font-black tracking-wide uppercase whitespace-nowrap">{t('nav.quest')}</span>
                        </button>
                    )}

                    {/* NEW: MOCK EXAM BUTTON - Always Unlocked */}
                    {user && activeAgentId !== 'ace' && (
                        <button
                            onClick={() => navigate('/mock-exam')}
                            className={cn(
                                "px-6 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-sm border hover:shadow-md active:scale-95 min-w-[120px] justify-center",
                                "bg-indigo-50 text-indigo-700 border-indigo-200/50"
                            )}
                            title="Enter Mock Exam Hall"
                        >
                            <BookOpen className="w-5 h-5 stroke-[2.5]" />
                            <span className="text-sm font-black tracking-wide uppercase whitespace-nowrap">{t('nav.mock_exam') || "Mock Exam"}</span>
                        </button>
                    )}


                    {/* Dream Programs Button - Ace Sir Only */}
                    {user && activeAgentId === 'ace' && (
                        <button
                            onClick={() => navigate('/dream-subjects')}
                            className={cn(
                                "px-6 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-sm border hover:shadow-md active:scale-95 bg-orange-50 text-orange-700 border-orange-200/50 min-w-[120px] justify-center"
                            )}
                            title={t('nav.dream_subjects_title')}
                        >
                            <Target className="w-5 h-5 stroke-[2.5]" />
                            <span className="text-sm font-black tracking-wide uppercase">{t('nav.dream_subjects')}</span>
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-xs font-bold text-primary/60 dark:text-primary/40 uppercase tracking-widest hidden sm:block text-right min-w-[120px]">
                        {/* Status text removed at user request */}
                    </div>
                    {/* Clear History Button */}
                    {user && (
                        <button
                            onClick={handleClearHistory}
                            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-red-500 group relative"
                            title={t('chat.clear_history') || "Clear Conversation"}
                        >
                            <div className="relative">
                                <MessageSquare className="size-6 text-gray-400 group-hover:text-red-500 transition-colors" />
                                <div className="absolute -top-1.5 -right-1.5 bg-white dark:bg-[#1a110a] rounded-full border border-white dark:border-[#1a110a]">
                                    <CircleX className="size-3.5 text-gray-400 group-hover:text-red-500 fill-white dark:fill-[#3d2c20] transition-colors" />
                                </div>
                            </div>
                        </button>
                    )}



                    <button
                        onClick={() => setIsEnlarged(!isEnlarged)}
                        className={cn(
                            "p-1.5 bg-white/50 dark:bg-white/5 text-primary/60 border border-transparent hover:border-primary/20 transition-all rounded-md flex items-center gap-1.5 text-xs font-medium",
                            isEnlarged
                                ? "bg-primary text-white border-primary"
                                : "bg-white/50 dark:bg-white/5 text-primary/60 border-primary/20 hover:border-primary/40"
                        )}
                        title={isEnlarged ? t('chat.reduce_font') : t('chat.enlarge_font')}
                    >
                        <Type className="size-3" />
                        <span>{isEnlarged ? t('chat.small') : t('chat.enlarge')}</span>
                    </button>


                    <button
                        onClick={() => setIsFocusMode(!isFocusMode)}
                        className="p-2 text-primary/60 hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
                        title={isFocusMode ? t('chat.exit_focus') : t('chat.focus_mode')}
                    >
                        {isFocusMode ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                    </button>
                </div>
            </div>

            {/* Chat Area - Scrollable messages */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-8 flex flex-col justify-start gap-6 min-h-0">
                {/* Skeleton Loading State */}
                {isHistoryLoading && (
                    <div className="flex flex-col gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className={cn(
                                "flex items-start gap-4 animate-pulse",
                                i % 2 === 0 ? "ml-auto justify-end" : ""
                            )}>
                                {i % 2 !== 0 && (
                                    <div className="w-[44px] h-[44px] rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
                                )}
                                <div className={cn(
                                    "h-20 w-64 rounded-2xl bg-gray-100 dark:bg-gray-800",
                                    i % 2 === 0 ? "rounded-tr-none" : "rounded-tl-none"
                                )} />
                                {i % 2 === 0 && (
                                    <div className="w-[44px] h-[44px] rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {messages.map((msg, idx) => {
                    const isLastUserMsg = msg.role === 'user' && idx === messages.findLastIndex(m => m.role === 'user');
                    
                    // Hide messages that are purely system triggers
                    const isPureSystem = msg.content && msg.content.includes('[SYSTEM:') && !msg.content.replace(/\[SYSTEM:[^\]]+\]/g, '').trim();
                    if (isPureSystem || msg.isHidden) return null;

                    return (
                        <div
                            key={idx}
                            ref={isLastUserMsg ? lastUserMessageRef : null}
                            className={cn(
                                "flex items-start gap-4 transition-all duration-300",
                                msg.role === 'user' ? "ml-auto justify-end max-w-[80%]" : "max-w-[95%]"
                            )}
                        >

                            {/* AI Avatar (Left) */}
                            {msg.role === 'assistant' && (
                                <div className={cn(
                                    "w-[44px] h-[44px] shrink-0 rounded-full overflow-hidden border border-black/5 bg-white shadow-sm transition-all relative",
                                    (avatarState === 'TALKING' || avatarState === 'THINKING') && "animate-talking-glow ring-2 ring-green-400"
                                )}>
                                    <img src={activeAgent.avatar} alt={activeAgent.name} className="w-full h-full object-cover object-top" />
                                </div>
                            )}

                            {/* Message Bubble */}
                            <div className={cn(
                                "rounded-2xl shadow-sm border border-black/5 flex flex-col gap-3 transition-all",
                                isEnlarged ? "p-5" : "p-4",
                                msg.role === 'user'
                                    ? "bg-primary/10 dark:bg-primary/20 rounded-tr-none"
                                    : "bg-white dark:bg-[#3d2c20] rounded-tl-none"
                            )}>
                                {msg.image && (
                                    <img src={msg.image.preview} alt="Uploaded handwriting" className="max-w-xs rounded-lg border border-black/10 shadow-sm" />
                                )}
                                <div className={cn(
                                    "text-[#1d130c] dark:text-white whitespace-pre-wrap transition-all",
                                    isEnlarged ? "text-[16px] leading-relaxed" : "text-[14px] leading-snug"
                                )}>
                                    {formatMessageContent(msg.content, handleTutorAction, activeAgentId)}
                                </div>

                                {Array.isArray(msg.actions) && msg.actions.length > 0 && (
                                    <div className="mt-1 flex flex-wrap gap-2">
                                        {msg.actions.slice(0, 3).map((action, actionIdx) => (
                                            <button
                                                key={`${action.type || 'action'}-${actionIdx}`}
                                                onClick={() => handleTutorAction(action)}
                                                className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-xl font-bold text-sm shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                            >
                                                <Sparkles className="w-4 h-4" />
                                                {action.label || 'Start Practice'}
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Custom Component: Active Mock List */}
                                {msg.customComponent === 'active_mock_list' && (
                                    <div className="mt-4 grid gap-2">
                                        {msg.mocks.map((mock, mIdx) => (
                                            <button
                                                key={mIdx}
                                                onClick={() => handleSendMessage(`[ACTIVATING_EXAM_MODE] I want to study ${mock.id}`)}
                                                className="text-left w-full p-3 bg-white hover:bg-white/80 dark:bg-black/20 dark:hover:bg-black/30 border border-black/5 rounded-xl transition-all group flex items-center justify-between shadow-sm"
                                            >
                                                <div>
                                                    <div className="font-bold text-primary text-sm">📝 {mock.title}</div>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* TUTOR CARDS */}
                                {msg.customComponent === 'polisher_card' && (
                                    <PolisherCard data={msg.payload} />
                                )}
                                {msg.customComponent === 'decoder_card' && (
                                    <DecoderCard data={msg.payload} />
                                )}
                                {msg.customComponent === 'vocab_card' && (
                                    <VocabCard data={msg.payload} />
                                )}

                                {/* Launch Card */}
                                {msg.customComponent === 'launch_card' && (
                                    <LaunchCard
                                        payload={msg.payload}
                                        onLaunch={() => {
                                            const payload = msg.payload;
                                            if (payload.module === 'EXAM_ROUTER') {
                                                handleSendMessage(`[ACTIVATING_EXAM_MODE] I want to study ${payload.params.type}`);
                                            } else if (payload.module === 'MATHS_LAB') {
                                                const params = payload.params || {};
                                                const searchParams = new URLSearchParams();
                                                if (params.topic) searchParams.set('topic', params.topic);
                                                if (params.level) searchParams.set('level', params.level);
                                                navigate(`/maths-lab?${searchParams.toString()}`);
                                            } else if (payload.module === 'WRITING_LAB') {
                                                navigate('/writing-lab');
                                            } else {
                                                const params = payload.params || {};
                                                const searchParams = new URLSearchParams();
                                                if (params.topic) searchParams.set('topic', params.topic);
                                                let level = params.level || '3';
                                                const validLevels = ['3', '4', '5', '7'];
                                                if (!validLevels.includes(level)) {
                                                    const num = parseInt(level, 10);
                                                    if (num <= 3) level = '3';
                                                    else if (num === 4) level = '4';
                                                    else if (num >= 5 && num < 7) level = '5';
                                                    else if (num >= 7) level = '7';
                                                    else level = '3';
                                                }
                                                searchParams.set('level', level);
                                                if (params.focus && Array.isArray(params.focus)) {
                                                    params.focus.forEach(f => searchParams.append('focus', f));
                                                }
                                                navigate(`/lab?${searchParams.toString()}`);
                                            }
                                        }}
                                    />
                                )}

                                {/* Exam Link */}
                                {msg.customComponent === 'exam_link' && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {(msg.examType === 'writing' ? writingExams : (msg.examType === 'listening' ? listeningExams : (msg.examType === 'speaking' ? speakingExams : mockExams)))
                                            .filter(e => e.type === msg.examType || !msg.examType)
                                            .map(exam => (
                                                <button
                                                    key={exam.id}
                                                    onClick={() => {
                                                        const event = new CustomEvent('open-exam-modal', { detail: { examId: exam.id, type: exam.type } });
                                                        window.dispatchEvent(event);
                                                    }}
                                                    className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors border border-indigo-200 flex items-center gap-1"
                                                >
                                                    📝 {exam.title}
                                                </button>
                                            ))}
                                    </div>
                                )}
                            </div>

                            {/* User Avatar (Right) */}
                            {/* User Avatar (Right) */}
                            {
                                msg.role === 'user' && (
                                    <div className="w-[44px] h-[44px] shrink-0 rounded-full bg-gray-200 overflow-hidden relative">
                                        <img
                                            src={getStudentAvatar()}
                                            alt="User"
                                            className="avatar-portrait-chat"
                                        />
                                        {equipment.frame && (
                                            <img src={equipment.frame.image} alt="Frame" className="absolute inset-0 w-full h-full object-contain pointer-events-none scale-110 avatar-frame-mask" />
                                        )}
                                    </div>
                                )
                            }
                        </div>
                    );
                })}

                {/* Thinking Indicator */}
                {avatarState === 'THINKING' && (
                    <div className="flex items-start gap-4 max-w-[80%]">
                        <div className={cn(
                            "size-10 shrink-0 rounded-full overflow-hidden border border-black/5 bg-white shadow-sm animate-talking-glow ring-2 ring-green-400 relative"
                        )}>
                            <img src={activeAgent.avatar} alt={activeAgent.name} className="w-full h-full object-cover object-top" />
                        </div>
                        <div className="bg-white dark:bg-[#3d2c20] p-4 rounded-2xl rounded-tl-none shadow-sm border border-black/5">
                            <div className="flex gap-1 items-center">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                {isAnalyzingImage && (
                                    <span className="text-xs text-black/40 dark:text-white/40 ml-2 font-medium animate-pulse">
                                        {activeAgentId === 'math' ? "Analyzing math problem..." : "Analyzing handwriting..."}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Dynamic Suggestion Chips Carousel */}
            {showChips && (dynamicChips.length > 0 || (messages.length <= 1 && suggestionChips && suggestionChips.length > 0)) && (
                <div className="max-w-4xl mx-auto px-4 mb-2 relative group">
                    <div className="relative flex items-center">
                        {/* Left Arrow */}
                        {!isAtLeft && (
                            <button 
                                onClick={() => handleChipScroll('left')}
                                className="absolute left-0 z-10 p-2 bg-white/90 dark:bg-black/60 backdrop-blur-sm rounded-full shadow-md border border-black/5 dark:border-white/10 text-gray-600 dark:text-gray-300 -ml-2 active:scale-90 transition-transform"
                            >
                                <ChevronLeft size={20} />
                            </button>
                        )}

                        <div 
                            ref={chipScrollRef}
                            className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth items-center py-2 w-full touch-pan-x overscroll-contain"
                        >
                            {(() => {
                                const rawChips = normalizeChips(dynamicChips.length > 0 ? dynamicChips : (messages.length <= 1 ? suggestionChips : []));
                                // Limit to maximum 4 chips as requested
                                const chipsToDisplay = rawChips.slice(0, 4);
                                
                                return chipsToDisplay.map((rawChip, idx) => {
                                    const chip = verbifyChip(rawChip);
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => chip.action ? handleTutorAction(chip.action) : handleSendMessage(chip.value || chip.label || chip)}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-white/10 border border-black/10 dark:border-white/10 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-white/20 transition-all text-[13px] font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap shrink-0 active:scale-95"
                                        >
                                            {chip.emoji && <span className="text-base">{chip.emoji}</span>}
                                            {chip.label || chip}
                                        </button>
                                    );
                                });
                            })()}
                        </div>

                        {/* Right Arrow */}
                        {(() => {
                            const rawChips = normalizeChips(dynamicChips.length > 0 ? dynamicChips : (messages.length <= 1 ? suggestionChips : []));
                            return !isAtRight && rawChips.length > 1 && (
                                <button 
                                    onClick={() => handleChipScroll('right')}
                                    className="absolute right-0 z-10 p-2 bg-white/90 dark:bg-black/60 backdrop-blur-sm rounded-full shadow-md border border-black/5 dark:border-white/10 text-gray-600 dark:text-gray-300 -mr-2 active:scale-90 transition-transform"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            );
                        })()}
                    </div>
                </div>
            )}


            {/* Input Area - Gemini Redesign */}
            <div
                className={cn(
                    "p-4 transition-all duration-300",
                    isFocusMode ? "bg-white dark:bg-background-dark" : "bg-transparent"
                )}
            >
                <div
                    className={cn(
                        "max-w-4xl mx-auto rounded-[2rem] p-3 shadow-xl border border-black/5 dark:border-white/10 relative",
                        isFocusMode ? "bg-white dark:bg-[#1a110a]" : "bg-white/80 dark:bg-white/10"
                    )}
                >

                    {/* Top Layer: Message Input */}
                    <div className="flex-1 flex flex-col relative px-2">
                        {selectedImage && (
                            <div className="absolute bottom-full left-0 mb-3 p-2 bg-white dark:bg-[#1a110a] rounded-xl shadow-lg border border-primary/20 flex items-center gap-2 animate-in slide-in-from-bottom-2">
                                <img src={selectedImage.preview} className="size-12 rounded-lg object-cover" alt="Preview" />
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="p-1 hover:bg-black/5 rounded-full text-red-500"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>
                        )}
                        <textarea
                            ref={textareaRef}
                            rows="1"
                            className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-[#1d130c] dark:text-white placeholder-[#a16b45]/50 px-2 py-2 resize-none text-base min-h-[40px] max-h-[200px] transition-[height] duration-100"
                            placeholder={getPlaceholder()}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={avatarState === 'THINKING'}
                        />
                    </div>

                    {/* Bottom Layer: Toolbar */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/5 dark:border-white/5 px-2">
                        <div className="flex items-center gap-2 relative" ref={toolsRef}>
                            <button
                                onClick={() => setIsToolsOpen(!isToolsOpen)}
                                className={cn(
                                    "flex items-center gap-2 px-5 py-2.5 rounded-full transition-all border shadow-sm active:scale-95",
                                    isToolsOpen
                                        ? "bg-primary text-white border-primary"
                                        : "bg-white/50 dark:bg-white/5 text-[#a16b45] dark:text-gray-300 border-black/5 dark:border-white/10 hover:bg-white dark:hover:bg-white/10"
                                )}
                            >
                                <Plus className={cn("w-5 h-5 transition-transform", isToolsOpen && "rotate-45")} />
                                <Settings2 className="w-5 h-5" />
                                <span className="text-sm font-black uppercase tracking-wider">{t('chat.tools')}</span>
                            </button>

                            {/* Tools Context Menu (Popover) */}
                            {isToolsOpen && (
                                <div className="absolute bottom-full left-0 mb-3 bg-white dark:bg-[#1a110a] rounded-2xl shadow-2xl border border-black/5 dark:border-white/10 p-2 min-w-[280px] animate-in slide-in-from-bottom-2 fade-in duration-200 z-[100]">
                                    <h4 className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-primary opacity-60 text-left">{t('chat.ai_features')}</h4>

                                    <button
                                        onClick={() => {
                                            fileInputRef.current?.click();
                                            setIsToolsOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors text-sm font-bold text-[#1d130c] dark:text-white group text-left"
                                    >
                                        <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-500 group-hover:bg-blue-100 transition-colors">
                                            <Paperclip size={16} />
                                        </div>
                                        {t('chat.attach_photo_device')}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsChatQrImageOpen(true);
                                            setIsToolsOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors text-sm font-bold text-[#1d130c] dark:text-white group text-left"
                                    >
                                        <div className="p-1.5 bg-violet-50 dark:bg-violet-900/20 rounded-lg text-violet-500 group-hover:bg-violet-100 transition-colors">
                                            <Smartphone size={16} />
                                        </div>
                                        {t('chat.attach_photo_phone')}
                                    </button>

                                    {activeAgentId !== 'math' && activeAgentId !== 'ace' && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setIsUploaderOpen(true);
                                                    setIsToolsOpen(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors text-sm font-bold text-[#1d130c] dark:text-white group text-left"
                                            >
                                                <div className="p-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-500 group-hover:bg-amber-100 transition-colors">
                                                    <Edit3 size={16} />
                                                </div>
                                                {t('chat.grade_essay')}
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right Actions: Mic/Send */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleSendMessage()}
                                disabled={avatarState === 'THINKING' || (!inputValue.trim() && !selectedImage)}
                                className={cn(
                                    "size-12 rounded-full flex items-center justify-center transition-all shadow-md active:scale-90 disabled:opacity-50 relative",
                                    (inputValue.trim() || selectedImage)
                                        ? "bg-primary text-white shadow-primary/20"
                                        : "bg-white dark:bg-white/5 text-primary border border-black/5 dark:border-white/10"
                                )}
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                />
            </div>
            {/* RoadmapModal moved to Parent (Dashboard) */}

            {/* Confirmation Modal for Clearing History */}
            {isClearConfirmOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1a110a] rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-gray-200 dark:border-white/10 scale-100 animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('chat.clear_history_title')}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            {t('chat.clear_history_confirm')}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsClearConfirmOpen(false)}
                                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm transition-colors"
                            >
                                {t('chat.cancel')}
                            </button>
                            <button
                                onClick={confirmClearHistory}
                                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-500/20 transition-all active:scale-95"
                            >
                                {t('chat.delete_forever')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Math Ability Modal - REMOVED, now dedicated page */}

            {/* Dream Programs now uses dedicated page at /dream-subjects */}

            {/* Image Analysis Confirmation Popup */}
            {isImageConfirmOpen && selectedImage && (
                <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-[#1a110a] rounded-[2.5rem] shadow-2xl max-w-2xl w-full border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="flex flex-col md:flex-row h-full max-h-[80vh]">
                            {/* Left Side: Image Preview */}
                            <div className="w-full md:w-1/2 bg-gray-100 dark:bg-black/20 flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-gray-100 dark:border-white/10">
                                <div className="relative w-full aspect-square md:aspect-auto md:h-full rounded-2xl overflow-hidden shadow-inner flex items-center justify-center bg-white/50 dark:bg-black/40">
                                    <img
                                        src={selectedImage.preview}
                                        alt="Preview"
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>
                            </div>

                            {/* Right Side: Questions & Actions */}
                            <div className="w-full md:w-1/2 p-8 flex flex-col gap-6">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                        {activeAgentId === 'math' ? "Maths photo" : t('chat.image_attach_title')}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                                        {activeAgentId === 'math'
                                            ? "Add your question so Matt Sir can read the problem and help you step by step."
                                            : t('chat.image_attach_subtitle')}
                                    </p>
                                </div>

                                <div className="flex-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2 block">{t('chat.image_attach_label')}</label>
                                    <textarea
                                        className="w-full h-32 bg-gray-50 dark:bg-white/5 rounded-2xl border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-white/10 p-4 text-sm text-gray-800 dark:text-white resize-none transition-all placeholder-gray-400 outline-none"
                                        placeholder="Type your question here..."
                                        value={imagePrompt}
                                        onFocus={() => {
                                            if (!hasStartedTyping) {
                                                setImagePrompt("");
                                                setHasStartedTyping(true);
                                            }
                                        }}
                                        onChange={(e) => {
                                            setImagePrompt(e.target.value);
                                            setHasStartedTyping(true);
                                        }}
                                    />
                                </div>

                                <div className="flex gap-3 mt-auto pt-4">
                                    <button
                                        onClick={() => {
                                            setIsImageConfirmOpen(false);
                                            setSelectedImage(null);
                                        }}
                                        className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-2xl font-bold text-sm transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsImageConfirmOpen(false);
                                            handleSendMessage(imagePrompt);
                                        }}
                                        className="flex-[1.5] py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <Send size={18} />
                                        {activeAgentId === 'math' ? t('chat.analyze_verb') : t('chat.image_attach_analyze_btn')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );

    if (isFocusMode) {
        return createPortal(content, document.body);
    }
    return content;
};

export default ChatInterface;
