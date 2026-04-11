import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const AvatarContext = createContext();

export const AGENTS = {
    english: { id: 'english', name: 'Miss Janie', role: '英文導師', color: 'bg-blue-100', avatar: '/avatars/miss_janie_avatar_1774534465912.png' },
    math: { id: 'math', name: 'Matt sir', role: '數學導師', color: 'bg-green-100', avatar: '/avatars/matt_sir_avatar_1774534606517.png' },
    chinese: { id: 'chinese', name: 'Miss Lam', role: '中文導師', color: 'bg-purple-100', avatar: '/avatars/miss_lam_avatar_1774534527873.png' },
    ace: { id: 'ace', name: 'Ace Sir', role: 'Ace Sir', color: 'bg-primary/20', avatar: '/avatars/ace_sir_avatar_1774534550933.png' }
};

export const AvatarProvider = ({ children }) => {
    const { user } = useAuth();
    const [activeAgentId, setActiveAgentId] = useState('english');
    const [avatarState, setAvatarState] = useState('IDLE');
    const [studentState, setStudentState] = useState('IDLE');
    const [isFocusMode, setIsFocusMode] = useState(false);

    // Dynamic Equipment State
    const [equipment, setEquipment] = useState({
        tutor: null, // Full card object
        student: { id: 's_aiden', image: '/avatars/s_aiden.png' },
        frame: null
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    const syncEquipment = async () => {
        if (!user) return;
        try {
            const res = await fetch(`${API_URL}/api/redemption/collection?uid=${user.uid}`);
            const data = await res.json();
            
            const equippedTutor = data.catalog.tutorCards.find(c => c.equipped);
            const equippedStudent = data.catalog.studentCards.find(c => c.equipped) || data.catalog.studentCards[0];
            const equippedFrame = data.catalog.avatarFrames.find(c => c.equipped);

            setEquipment({
                tutor: equippedTutor || null,
                student: equippedStudent || { id: 's_aiden', image: '/avatars/s_aiden.png' },
                frame: equippedFrame || null
            });
        } catch (e) {
            console.error("Failed to sync equipment", e);
        }
    };

    useEffect(() => {
        if (user) syncEquipment();
    }, [user]);

    const activeAgent = AGENTS[activeAgentId];

    return (
        <AvatarContext.Provider value={{
            activeAgent,
            activeAgentId,
            setActiveAgentId,
            avatarState,
            setAvatarState,
            studentState,
            setStudentState,
            isFocusMode,
            setIsFocusMode,
            equipment,
            syncEquipment
        }}>
            {children}
        </AvatarContext.Provider>
    );
};

export const useAvatar = () => useContext(AvatarContext);
