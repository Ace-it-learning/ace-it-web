import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Studio Components
import WritingStudioLayout from '../components/writing/WritingStudioLayout';
import WritingStudioHeader from '../components/writing/WritingStudioHeader';
import WritingStudioBriefing from '../components/writing/WritingStudioBriefing';
import WritingStudioEditor from '../components/writing/WritingStudioEditor';
import WritingStudioControlPanel from '../components/writing/WritingStudioControlPanel';

const WritingQuestPage = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { isMock, duration } = location.state || {}; // Mock detection

    // Data State
    const [questData, setQuestData] = useState(null);
    const [step, setStep] = useState('loading'); // loading, studio, results

    // Writing State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [sparkNotes, setSparkNotes] = useState('');
    const [checklistProgress, setChecklistProgress] = useState([]);
    
    // AI Interaction State
    const [reviewData, setReviewData] = useState(null);
    const [isReviewing, setIsReviewing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
    const [cheatLibrary, setCheatLibrary] = useState(null);

    // Derived State
    const wordCount = content.trim().split(/\s+/).filter(x => x.length > 0).length;
    const cloProgress = reviewData ? [
        reviewData.clo_status?.content || 0,
        reviewData.clo_status?.language || 0,
        reviewData.clo_status?.organization || 0
    ] : [0, 0, 0];

    const isCheatMode = user?.email === 'fungtam@gmail.com';

    // Helper: Dynamic Content Fallbacks
    const getGenreFallbacks = () => {
        const genre = (questData?.genre || questData?.title || "").toLowerCase();
        
        if (genre.includes('letter to the editor')) {
            return {
                blueprint: ["Salutation", "Introduction (Purpose)", "Body (Problem & Impact)", "Body (Proposed Solutions)", "Conclusion (Call to Action)", "Formal Sign-off"],
                checklist: ["Address the Editor clearly", "Use a concerned but professional tone", "Suggest 2-3 actionable solutions", "Stick to formal register"]
            };
        }
        if (genre.includes('speech')) {
            return {
                blueprint: ["Opening hook", "Personal introduction", "Body Paragraph 1", "Body Paragraph 2", "Call to Action", "Thanking the audience"],
                checklist: ["Use rhetorical questions", "Maintain direct address (e.g. You)", "Clear sign-posting for listeners"]
            };
        }
        return {
            blueprint: ["Introduction", "Development Paragraph 1", "Development Paragraph 2", "Conclusion"],
            checklist: ["Check transition words", "Vary sentence structures", "Address all parts of the prompt"]
        };
    };

    const activeBlueprint = questData?.genre_blueprint || getGenreFallbacks().blueprint;
    const activeChecklist = questData?.checklist || getGenreFallbacks().checklist;

    // Initialize Studio
    useEffect(() => {
        const loadQuest = async () => {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            
            // 1. Resolve Data Source
            // Source A: Roadmap/Quest Lab (passes questData object)
            const roadmapData = location.state?.questData;
            
            // Source B: Writer's Studio Menu (passes prompt/format directly)
            const menuTopic = location.state?.topic;
            const menuFormat = location.state?.format;
            const menuTitle = location.state?.title;

            // Source C: Persistent ID (Refresh fallback)
            const persistentId = localStorage.getItem('active_writing_quest_id');

            console.log("[WritingQuest] Initialization Debug:", { roadmapData, menuTopic, persistentId });

            try {
                // Priority 1: Mock Papers (Special case)
                const paperId = location.state?.paperId;
                if (isMock && paperId) {
                    const res = await fetch(`${API_URL}/api/english/mock/${paperId}`);
                    if (res.ok) {
                        const data = await res.json();
                        setQuestData(data);
                        setStep('studio');
                        return;
                    }
                }

                // Priority 1.5: Weekly Quests
                if (location.state?.isWeeklyQuest) {
                    console.log("[WritingQuest] Loading Weekly Quest");
                    const res = await fetch(`${API_URL}/api/lab/weekly/writing`);
                    if (res.ok) {
                        const data = await res.json();
                        setQuestData(data);
                        setStep('studio');
                        return;
                    }
                }

                // Priority 2: Direct Menu Navigation (Topic Factory)
                if (menuTopic) {
                    const factoryData = {
                        id: 'factory_' + Date.now(),
                        title: menuTitle || 'Writing Mission',
                        prompt: menuTopic,
                        genre: menuFormat || 'Essay',
                        isFactory: true
                    };
                    setQuestData(factoryData);
                    setStep('studio');
                    return;
                } 
                // Priority 3: Roadmap Data
                else if (roadmapData) {
                    setQuestData(roadmapData);
                    if (roadmapData.id) localStorage.setItem('active_writing_quest_id', roadmapData.id);
                    setStep('studio');
                    return;
                }
                // Priority 4: Auto-Load for Roadmap/Micro-skills (Direct Landing)
                const isAutoLoad = location.state?.isAutoLoad;
                const autoGenre = location.state?.genre;
                const taskId = location.state?.taskId;

                if (isAutoLoad && autoGenre) {
                    console.log(`[WritingQuest] Auto-loading random prompt for genre: ${autoGenre}`);
                    
                    const fetchWithFallback = async (genre) => {
                        try {
                            const res = await fetch(`${API_URL}/api/writing/format/${encodeURIComponent(genre)}`);
                            if (res.ok) {
                                const topics = await res.json();
                                if (topics.length > 0) return topics;
                            }
                        } catch (e) { console.error(`Fetch failed for ${genre}`, e); }
                        return null;
                    };

                    // Try requested genre, then fallback to canonical genres
                    let topics = await fetchWithFallback(autoGenre);
                    if (!topics && autoGenre !== 'Argumentative Essay') {
                        console.log(`[WritingQuest] ${autoGenre} failed, trying fallback: Argumentative Essay`);
                        topics = await fetchWithFallback('Argumentative Essay');
                    }
                    if (!topics && autoGenre !== 'Letter to the Editor') {
                        console.log("[WritingQuest] Fallback failed, trying: Letter to the Editor");
                        topics = await fetchWithFallback('Letter to the Editor');
                    }

                    if (topics && topics.length > 0) {
                        const randomTopic = topics[Math.floor(Math.random() * topics.length)];
                        const factoryData = {
                            id: taskId || ('auto_' + Date.now()),
                            title: randomTopic.title || `${autoGenre} Mission`,
                            prompt: randomTopic.prompt,
                            genre: autoGenre,
                            isFactory: true
                        };
                        setQuestData(factoryData);
                        localStorage.setItem('active_writing_quest_id', factoryData.id);
                        setStep('studio');
                        return;
                    } else {
                        throw new Error(`Could not find any topics for ${autoGenre} or fallback category.`);
                    }
                }

                // Priority 5: Refresh/Direct URL with ID
                else if (persistentId) {
                    const res = await fetch(`${API_URL}/api/writing/quest/${persistentId}`);
                    if (res.ok) {
                        const data = await res.json();
                        setQuestData(data);
                        setStep('studio');
                        return;
                    } else {
                        // If ID fetch fails, we can't do much
                        throw new Error("Quest ID invalid on refresh");
                    }
                }
                else {
                    // Critical failure: No data and no ID
                    throw new Error("No quest data found in navigation state");
                }

                // Final Step: Fetch Cheat Library for authorized developers
                if (user?.email === 'fungtam@gmail.com') {
                    try {
                        const cheatRes = await fetch(`${API_URL}/api/writing/admin/cheat-library`);
                        if (cheatRes.ok) {
                            const lib = await cheatRes.json();
                            if (lib) setCheatLibrary(lib);
                        }
                    } catch (cheatErr) {
                        console.warn("[WritingQuest] Cheat library load failed (ignoring):", cheatErr);
                    }
                }

            } catch (err) {
                console.error("[WritingQuest] Initialization Error:", err);
                // Return to dashboard if completely stuck
                navigate('/dashboard', { state: { openRoadmap: 'ENGLISH', roadmapFilter: 'WRITING' } });
            }
        };

        loadQuest();
    }, [location.state, navigate, user?.email]);

    // Actions
    const handleToggleChecklist = (idx) => {
        setChecklistProgress(prev => 
            prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
        );
    };

    const handleReview = async () => {
        if (wordCount < 30) {
            setReviewData({ status: 'short_content' });
            return;
        }
        
        setIsReviewing(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/writing/draft/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    topic: questData?.title,
                    textType: questData?.genre || questData?.id?.split('_')[0]
                })
            });
            const data = await res.json();
            setReviewData(data);
        } catch (err) {
            console.error("[WritingQuest] Review Error:", err);
            setReviewData({ status: 'error' });
        } finally {
            setIsReviewing(false);
        }
    };

    const handleSubmit = async () => {
        if (wordCount < 50) return;
        setIsSubmitting(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/writing/grade`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: questData.title,
                    textType: questData.genre || questData.id?.split('_')[0],
                    content: content,
                    userEmail: user?.email,
                    uid: user?.uid
                })
            });
            const results = await res.json();
            
            // Navigate to results page with detailed feedback
            navigate('/writing/result', { 
                state: { 
                    results, 
                    questData,
                    studentWork: { title, content }
                } 
            });
        } catch (err) {
            console.error("[WritingQuest] Submission Error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCheatInject = async (level) => {
        console.log(`[Cheat] Triggered Level ${level} injection.`, { questData, title });
        
        // 1. Immediate visual feedback
        const targetTitle = questData?.title || title || 'Writing Challenge';
        setTitle(`[Generating ${level}...] ${targetTitle}`);
        setContent(`[Admin Intel: Contacting Ace-it AI to generate a Level ${level} masterpiece for "${targetTitle}"...\n\nPlease wait about 15-20 seconds for the magic to happen.]`);

        // 2. Try quest-specific hardcoded library first
        if (cheatLibrary) {
            let libEntry = questData?.id ? cheatLibrary[questData.id] : null;

            if (!libEntry && targetTitle) {
                const scenarioTitlesMap = {
                    "The Rise of Deepfakes": "lte_001",
                    "Luxury vs. Living Space": "lte_002",
                    "'Mega-Event' Fatigue": "art_001",
                    "The Silver Economy": "art_002",
                    "AI Tutors in DSE Prep": "deb_001"
                };
                
                const matchedId = scenarioTitlesMap[targetTitle];
                if (matchedId) libEntry = cheatLibrary[matchedId];
            }

            if (libEntry) {
                const libContent = libEntry[level];
                if (libContent && !libContent.startsWith('Error:')) {
                    setTitle(`[Cheat ${level}] ${targetTitle}`);
                    setContent(libContent);
                    console.log(`[Cheat] Injected hardcoded Level ${level}`);
                    return;
                }
            }
        }

        // 3. Dynamic AI Generation
        try {
            console.log(`[Cheat] Fetching AI essay from backend...`);
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            
            // Get Auth Token for completeness (though generate route is currently public)
            let headers = { 'Content-Type': 'application/json' };
            try {
                const token = await user?.getIdToken();
                if (token) headers['Authorization'] = `Bearer ${token}`;
            } catch (authErr) {
                console.warn("[Cheat] Failed to get auth token, proceeding as guest:", authErr);
            }

            const res = await fetch(`${API_URL}/api/writing/draft/generate`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    topic: targetTitle,
                    textType: questData?.genre || 'Essay',
                    level: level,
                    points: [] 
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.essay_content && !data.essay_content.startsWith('Error:')) {
                    setTitle(`[AI ${level}] ${targetTitle}`);
                    setContent(data.essay_content);
                    console.log(`[Cheat] Successfully generated Level ${level}`);
                    return;
                }
                console.warn("[Cheat] Backend returned empty or error essay_content:", data);
            } else {
                const errorText = await res.text();
                console.error("[Cheat] Backend error:", res.status, errorText);
            }
        } catch (err) {
            console.error("[Cheat] AI Generation API call failed:", err);
        }
        
        // 4. Final Fallback to default simulations
        const simulations = {
            '5**': `In the silicon-scented corridors of the 21st century, the debate surrounding Artificial Intelligence (AI) has transitioned from science fiction to pedagogical reality...`,
            '5': `Artificial intelligence has become a major part of our world today, especially in the area of education...`,
            '4': `I am writing to discuss about the use of AI tutors in Hong Kong schools...`
        };

        const chosenContent = simulations[level] || simulations['5**'];
        setTitle(`[Sim ${level}] ${targetTitle}`);
        setContent(chosenContent);
        console.warn(`[Cheat] Reverted to simulation fallback.`);
    };

    if (step === 'loading') {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-400">
                <Loader2 size={64} className="animate-spin mb-6 text-indigo-500" />
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Initializing Writing Studio...</h3>
                <p className="text-sm mt-2 font-bold text-slate-400 uppercase tracking-widest">Applying HKDSE Constraints</p>
            </div>
        );
    }

    return (
        <WritingStudioLayout
            header={
                <WritingStudioHeader 
                    title={questData?.title} 
                    status={isSubmitting ? "Submitting" : "Drafting"}
                    cloProgress={cloProgress}
                    isSidebarOpen={isSidebarOpen}
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    isLeftSidebarOpen={isLeftSidebarOpen}
                    onToggleLeftSidebar={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
                    isCheatMode={isCheatMode}
                    onCheatInject={handleCheatInject}
                    isMock={isMock}
                    duration={duration}
                    onTimeUp={() => {
                        alert("Time is up! Submitting your draft.");
                        handleSubmit();
                    }}
                />
            }
            leftColumn={
                <WritingStudioBriefing 
                    prompt={questData?.prompt}
                    blueprint={activeBlueprint}
                    checklist={activeChecklist}
                    completedItems={checklistProgress}
                    onToggleChecklist={handleToggleChecklist}
                />
            }
            centerColumn={
                <WritingStudioEditor 
                    title={title}
                    onTitleChange={setTitle}
                    content={content}
                    onContentChange={setContent}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    wordCount={wordCount}
                    isMock={isMock}
                />
            }
            rightColumn={
                <WritingStudioControlPanel 
                    sparkNotes={sparkNotes}
                    onSparkChange={setSparkNotes}
                    reviewData={reviewData}
                    onReviewTrigger={handleReview}
                    isReviewing={isReviewing}
                    isMock={isMock}
                />
            }
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isLeftSidebarOpen={isLeftSidebarOpen}
            onToggleLeftSidebar={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
        />
    );
};

export default WritingQuestPage;
