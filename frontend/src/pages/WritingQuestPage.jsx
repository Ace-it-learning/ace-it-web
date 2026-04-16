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
                } 
                // Priority 3: Roadmap Data
                else if (roadmapData) {
                    setQuestData(roadmapData);
                    if (roadmapData.id) localStorage.setItem('active_writing_quest_id', roadmapData.id);
                    setStep('studio');
                }
                // Priority 4: Refresh/Direct URL with ID
                else if (persistentId) {
                    const res = await fetch(`${API_URL}/api/writing/quest/${persistentId}`);
                    if (res.ok) {
                        const data = await res.json();
                        setQuestData(data);
                        setStep('studio');
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

    const handleCheatInject = (level) => {
        // 1. Try quest-specific hardcoded library
        if (cheatLibrary) {
            // Attempt A: Direct ID match (Scenarios/Roadmap)
            let libEntry = questData?.id ? cheatLibrary[questData.id] : null;

            // Attempt B: Title-based search (Factory Topics/Menu)
            if (!libEntry && questData?.title) {
                // Fuzzy match: Find key in library that matches the title
                const scenarioTitlesMap = {
                    "The Rise of Deepfakes": "lte_001",
                    "Luxury vs. Living Space": "lte_002",
                    "'Mega-Event' Fatigue": "art_001",
                    "The Silver Economy": "art_002",
                    "AI Tutors in DSE Prep": "deb_001"
                    // Add more if needed, but these are primary test cases
                };
                
                const matchedId = scenarioTitlesMap[questData.title];
                if (matchedId) libEntry = cheatLibrary[matchedId];
            }

            if (libEntry) {
                const libContent = libEntry[level];
                if (libContent && !libContent.startsWith('Error:')) {
                    setTitle(`[Cheat ${level}] ${questData.title}`);
                    setContent(libContent);
                    console.log(`[Cheat] Injected hardcoded Level ${level} for ${questData.id} via title/ID match.`);
                    return;
                }
            }
        }
        
        // 2. Fallback to default simulations if library not loaded or scenario missing
        const simulations = {
            '5**': `In the silicon-scented corridors of the 21st century, the debate surrounding Artificial Intelligence (AI) has transitioned from science fiction to pedagogical reality...`,
            '5': `Artificial intelligence has become a major part of our world today, especially in the area of education...`,
            '4': `I am writing to discuss about the use of AI tutors in Hong Kong schools...`
        };

        const chosenContent = simulations[level] || simulations['5**'];
        setTitle(`Simulated ${level} Draft: ${questData?.title || 'Untitled'}`);
        setContent(chosenContent);
        console.warn(`[Cheat] Used fallback simulation for ${questData?.id || 'unknown'}`);
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
