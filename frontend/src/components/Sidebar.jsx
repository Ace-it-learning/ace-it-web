import React, { useState, useEffect } from 'react';
import { useAvatar, AGENTS } from '../context/AvatarContext';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const Sidebar = () => {
    const { activeAgentId, setActiveAgentId } = useAvatar();
    const { user } = useAuth();
    const [nickname, setNickname] = useState('Student');

    useEffect(() => {
        if (user) {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            fetch(`${API_URL}/api/stats?uid=${user.uid}`)
                .then(res => res.json())
                .then(data => setNickname(data.nickname || 'Student'))
                .catch(() => setNickname(user.displayName?.split(' ')[0] || 'Student'));
        } else {
            setNickname('Visitor');
        }
    }, [user]);

    return (
        <aside className="lg:col-span-3 flex flex-col gap-4">
            {Object.values(AGENTS).map((agent) => (
                <div
                    key={agent.id}
                    onClick={() => setActiveAgentId(agent.id)}
                    className={cn(
                        "flex items-center gap-4 p-4 rounded-xl shadow-sm transition-all cursor-pointer border border-transparent",
                        activeAgentId === agent.id
                            ? "bg-white dark:bg-[#2d1f16] border-primary ring-2 ring-primary/20"
                            : "bg-white/50 dark:bg-[#2d1f16]/50 hover:bg-white dark:hover:bg-[#2d1f16] hover:border-primary/30"
                    )}
                >
                    <div className={cn("size-14 rounded-full flex items-center justify-center overflow-hidden", agent.color)}>
                        <img
                            src={agent.avatar}
                            alt={`${agent.name} Avatar`}
                            className={cn("w-full h-full object-cover", activeAgentId !== agent.id && "opacity-80")}
                        />
                    </div>
                    <div>
                        <p className="font-bold text-[#1d130c] dark:text-white">{agent.name}</p>
                        <p className="text-xs text-[#a16b45]">{agent.description}</p>
                    </div>
                </div>
            ))}

            <div className="mt-6 p-6 bg-white dark:bg-[#2d1f16] rounded-xl shadow-lg border border-primary/20 flex flex-col items-center gap-4">
                <h3 className="font-bold text-[#1d130c] dark:text-white text-lg">{nickname}'s Corner</h3>
                <div className="w-full h-64 overflow-hidden rounded-lg bg-[#FFFFFF] dark:bg-[#FFFFFF] flex items-end justify-center">
                    <img
                        src={user?.photoURL || "https://lh3.googleusercontent.com/aida-public/AB6AXuDzZhhdaHLSWZQwm3KKKGqFDCN7QjeP__UQR9J8teQ8WZCgjIwvi-RcuR36r-uQJX_XSXTFB1KTWgp-h5cfPZ8qjaOw0_Be_smd9n9wXqv6G9BCJA33rwxWOGYJtzQA4amsF2Eh31iQCcvCiSMdAeYP3YOdOn_qnjjK35eZys7v3M7OeEwl3RBfBT6RF8YBPRUXOfEX3nWlO0_IgmRIG91ggWDklFp0pj4U3iVPtv9pIWiSZQOhuf5HNfHRyO7obxjjPKvHXKC13BEs"}
                        alt="Student Avatar"
                        className="h-full w-auto object-cover object-bottom"
                    />
                </div>
                <p className="text-sm text-[#a16b45] text-center">保持活力，與您的 AI 導師一起學習！</p>
            </div>
        </aside>
    );
};

export default Sidebar;
