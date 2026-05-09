import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatInterface from '../components/ChatInterface';
import { cn } from '../utils/cn';
import StatsBar from '../components/StatsBar'; // Keeping it imported even if unused for now
import { useAvatar } from '../context/AvatarContext';
import { useLanguage } from '../context/LanguageContext';
import RoadmapWidget from '../components/dashboard/RoadmapWidget';
import RoadmapModal from '../components/dashboard/RoadmapModal';
import MathRoadmapModal from '../components/dashboard/MathRoadmapModal';
import { useAuth } from '../context/AuthContext';
import { useUserStats } from '../hooks/useUserStats';

const Dashboard = () => {
    const navigate = useNavigate();
    const { isFocusMode } = useAvatar();
    const { t } = useLanguage();
    const { user } = useAuth();
    const [isQuestOpen, setIsQuestOpen] = React.useState(false);
    const [isMathQuestOpen, setIsMathQuestOpen] = React.useState(false);
    const [diagnosticCompleted, setDiagnosticCompleted] = React.useState(false);
    const { stats } = useUserStats();

    React.useEffect(() => {
        if (stats) {
            setDiagnosticCompleted(!!stats.diagnostic_completed);
        }
    }, [stats]);

    // Ensure we start at the top of the page when navigating to Dashboard
    React.useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

    const handleOpenQuest = (agentId) => {
        if (agentId === 'math' || agentId === 'maths') {
            setIsMathQuestOpen(true);
        } else {
            setIsQuestOpen(true);
        }
    };

    const [roadmapFilter, setRoadmapFilter] = React.useState('ALL');
    const location = useLocation();

    // Listen for Sidebar events
    React.useEffect(() => {
        const handleCustomOpen = (e) => {
            if (e.detail?.filter) {
                // We need to pass this filter to RoadmapModal.
                // We'll add a temporary state for initial filter.
                setRoadmapFilter(e.detail.filter);
                setIsQuestOpen(true);
            }
        };
        window.addEventListener('open-roadmap', handleCustomOpen);
        return () => window.removeEventListener('open-roadmap', handleCustomOpen);
    }, []);

    // Handle incoming navigation state (e.g. from Results pages)
    React.useEffect(() => {
        if (location.state?.openRoadmap === 'ENGLISH') {
            setIsQuestOpen(true);
            if (location.state?.roadmapFilter) {
                setRoadmapFilter(location.state.roadmapFilter);
            }
        } else if (location.state?.openRoadmap === 'MATHS') {
            setIsMathQuestOpen(true);
        }
    }, [location.state]);

    return (
        <>
            <div className={cn(
                "grid grid-cols-1 gap-8 items-start h-full",
                isFocusMode ? "grid-cols-1" : "md:grid-cols-12"
            )}>
                {/* Left Column: Header + Sidebar */}
                {!isFocusMode && (
                    <div className="md:col-span-3 flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar animate-in slide-out-to-left-4 duration-300">
                        <Sidebar />
                    </div>
                )}

                {/* Right Column: Chat Interface */}
                <div className="md:col-span-9 h-full flex flex-col gap-4">
                    <ChatInterface onOpenQuest={handleOpenQuest} />
                    <StatsBar />
                </div>
            </div>

            {/* Global Modals */}
            <RoadmapModal
                isOpen={isQuestOpen}
                onClose={() => {
                    setIsQuestOpen(false);
                    setRoadmapFilter('ALL'); // Reset on close
                }}
                initialFilter={roadmapFilter}
            />
            {/* Math Quest Modal */}
            <MathRoadmapModal
                isOpen={isMathQuestOpen}
                onClose={() => setIsMathQuestOpen(false)}
            />

            {/* Global Vocab Sidekick - REMOVED, now navigates to dedicated page */}
        </>
    );
};

export default Dashboard;
