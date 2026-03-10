import React from 'react';
import Sidebar, { cn } from '../components/Sidebar';
import ChatInterface from '../components/ChatInterface';
import StatsBar from '../components/StatsBar'; // Keeping it imported even if unused for now
import { useAvatar } from '../context/AvatarContext';
import { useLanguage } from '../context/LanguageContext';
import RoadmapWidget from '../components/dashboard/RoadmapWidget';
import RoadmapModal from '../components/dashboard/RoadmapModal';

const Dashboard = () => {
    const { isFocusMode } = useAvatar();
    const { t } = useLanguage();
    const [isQuestOpen, setIsQuestOpen] = React.useState(false);

    return (
        <>
            <div className={cn(
                "grid grid-cols-1 gap-8 items-start h-full",
                isFocusMode ? "grid-cols-1" : "lg:grid-cols-12"
            )}>
                {/* Left Column: Header + Sidebar */}
                {!isFocusMode && (
                    <div className="lg:col-span-3 flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar animate-in slide-out-to-left-4 duration-300">
                        <Sidebar />
                        {/* Roadmap Widget removed */}
                    </div>
                )}

                {/* Right Column: Chat Interface */}
                <div className="lg:col-span-9 h-full flex flex-col gap-4">
                    <ChatInterface onOpenQuest={() => setIsQuestOpen(true)} />
                    <StatsBar />
                </div>
            </div>

            {/* Global Modals */}
            <RoadmapModal
                isOpen={isQuestOpen}
                onClose={() => setIsQuestOpen(false)}
            />
        </>
    );
};

export default Dashboard;
