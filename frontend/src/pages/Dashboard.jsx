import React from 'react';
import Sidebar from '../components/Sidebar';
import ChatInterface from '../components/ChatInterface';
import StatsBar from '../components/StatsBar';

const Dashboard = () => {
    return (
        <>
            <div className="w-full">
                <h2 className="text-[#1d130c] dark:text-white text-3xl font-bold font-display">選擇您的學習夥伴</h2>
                <p className="text-[#a16b45] dark:text-[#a16b45]/80 text-lg mt-1">與 AI 導師進行深度對話，突破 DSE 難關</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <Sidebar />
                <ChatInterface />
            </div>

            <StatsBar />
        </>
    );
};

export default Dashboard;
