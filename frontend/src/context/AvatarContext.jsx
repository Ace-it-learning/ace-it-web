import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const AvatarContext = createContext();

export const AGENTS = {
    english: { id: 'english', name: 'Miss Janie', role: '英文導師', color: 'bg-blue-100', avatar: '/avatars/Miss_Janie.jpg' },
    math: { id: 'math', name: 'Matt Sir', role: '數學導師', color: 'bg-green-100', avatar: '/avatars/Dr_Ken.jpg' },
    chinese: { id: 'chinese', name: 'Miss Lam (林老師)', role: '中文導師', color: 'bg-purple-100', avatar: '/avatars/t_lam_v2.png' },
    ace: { id: 'ace', name: 'Ace Sir', role: 'Ace Sir', color: 'bg-primary/20', avatar: '/avatars/Ace_Sir.jpg' }
};

export const AvatarProvider = ({ children }) => {
    const { user } = useAuth();
    const [activeAgentId, setActiveAgentId] = useState('english');
    const [avatarState, setAvatarState] = useState('IDLE');
    const [studentState, setStudentState] = useState('IDLE');
    const [isFocusMode, setIsFocusMode] = useState(false);

    // Dynamic Equipment State
    const [equipment, setEquipment] = useState({
        tutors: {
            english: null,
            math: null,
            ace: null,
            chinese: null
        },
        student: { id: 's_aiden', image: '/avatars/s_aiden_v2.png' },
        frame: null
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    const syncEquipment = async () => {
        if (!user) return;
        try {
            const res = await fetch(`${API_URL}/api/redemption/collection?uid=${user.uid}`);
            const data = await res.json();
            
            // Find equipped tutors for each subject slot
            const tutorCards = data.catalog.tutorCards;
            
            const findEquipped = (subject) => {
                const terms = subjectMap[subject] || [subject];
                return tutorCards.find(c => c.equipped && (terms.includes(c.subject)));
            };

            setEquipment({
                tutors: {
                    english: findEquipped('english'),
                    math: findEquipped('math'),
                    ace: findEquipped('ace'),
                    chinese: findEquipped('chinese'),
                },
                student: data.catalog.studentCards.find(c => c.equipped) || data.catalog.studentCards[0] || { id: 's_aiden', image: '/avatars/s_aiden_v2.png' },
                frame: data.catalog.avatarFrames.find(c => c.equipped) || null
            });
        } catch (e) {
            console.error("Failed to sync equipment", e);
        }
    };

    useEffect(() => {
        if (user) syncEquipment();
    }, [user]);

    // Subject normalization mapping: activeAgentId -> card_pool subject
    const subjectMap = {
        'english': ['english'],
        'math': ['maths', 'math'],
        'chinese': ['chinese'],
        'ace': ['general', 'ace']
    };

    const getAgentIdentity = (agentId) => {
        const base = AGENTS[agentId];
        if (!base) return { name: 'Unknown', avatar: '' };
        
        const equippedTutor = equipment.tutors[agentId];
        const isSkinned = !!equippedTutor;

        return {
            ...base,
            name: isSkinned ? equippedTutor.name : base.name,
            avatar: isSkinned ? equippedTutor.image : base.avatar
        };
    };

    const activeAgent = getAgentIdentity(activeAgentId);
    const englishTutor = getAgentIdentity('english');

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
            syncEquipment,
            getAgentIdentity,
            englishTutor
        }}>
            {children}
        </AvatarContext.Provider>
    );
};

export const useAvatar = () => useContext(AvatarContext);
