import React, { createContext, useState, useContext } from 'react';

const AvatarContext = createContext();

export const AGENTS = {
    english: {
        id: 'english',
        name: 'English Tutor',
        role: '英文導師',
        description: 'Master Architect V4.0',
        avatar: '/avatars/english.png',
        color: 'bg-blue-100',
        headerInfo: 'English Mentor • Master Architect V4.0'
    },
    math: {
        id: 'math',
        name: 'Math Tutor',
        role: '數學導師',
        description: '幾何專題複習',
        avatar: '/avatars/math.png',
        color: 'bg-green-100',
        headerInfo: '數學導師 • 在線協助中'
    },
    chinese: {
        id: 'chinese',
        name: 'Chinese Tutor',
        role: '中文導師',
        description: '範文背誦挑戰',
        avatar: '/avatars/chinese.png',
        color: 'bg-purple-100',
        headerInfo: '中文導師 • 在線協助中'
    },
    science: {
        id: 'science',
        name: 'Science Tutor',
        role: '科學導師',
        description: '物理化學重點',
        avatar: '/avatars/science.png',
        color: 'bg-cyan-100',
        headerInfo: '科學導師 • 在線協助中'
    },
    ace: {
        id: 'ace',
        name: 'Ace Sir',
        role: 'Ace Sir',
        description: '全方位應試策略',
        avatar: '/avatars/ace.png',
        color: 'bg-primary/20',
        headerInfo: 'Ace Sir • 在線協助中'
    }
};

export const AvatarProvider = ({ children }) => {
    const [activeAgentId, setActiveAgentId] = useState('english');
    const [avatarState, setAvatarState] = useState('IDLE'); // IDLE, HAPPY, UPSET, THINKING

    const activeAgent = AGENTS[activeAgentId];

    return (
        <AvatarContext.Provider value={{ activeAgent, activeAgentId, setActiveAgentId, avatarState, setAvatarState }}>
            {children}
        </AvatarContext.Provider>
    );
};

export const useAvatar = () => useContext(AvatarContext);
