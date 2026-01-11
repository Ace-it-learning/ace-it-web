import React, { createContext, useState, useContext } from 'react';

const AvatarContext = createContext();

export const AGENTS = {
    english: {
        id: 'english',
        name: 'English Tutor',
        role: '英文導師',
        description: '進行中的測驗',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAlFTHD4t68TXCYZYAl7Ye8ql9q8_7Ihb5Mrq8K1ZEg9qchtix_yHJr6m9ryYb4dR8sBcTNj1wszseR6KQmu6sEoVY8tn51Mn4CnPHg01VDrCgwP2of-dXyXCK4nIU-eegUj16WqMlTHVqL5JpOrg9jKaSQyYo9x6cGI0s0mCyStzZynGhKW42247I0bkHLEUpfgRxsVdRypAp_8f8Z4XVrYTzbR_QbTVa2FHlcH6zHgYakA5Slk166dRtGJZ8oTg_4MjJEzk1-Of_',
        color: 'bg-blue-100',
        headerInfo: '英文導師 • 在線協助中'
    },
    math: {
        id: 'math',
        name: 'Math Tutor',
        role: '數學導師',
        description: '幾何專題複習',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAlFTHD4t68TXCYZYAl7Ye8ql9q8_7Ihb5Mrq8K1ZEg9qchtix_yHJr6m9ryYb4dR8sBcTNj1wszseR6KQmu6sEoVY8tn51Mn4CnPHg01VDrCgwP2of-dXyXCK4nIU-eegUj16WqMlTHVqL5JpOrg9jKaSQyYo9x6cGI0s0mCyStzZynGhKW42247I0bkHLEUpfgRxsVdRypAp_8f8Z4XVrYTzbR_QbTVa2FHlcH6zHgYakA5Slk166dRtGJZ8oTg_4MjJEzk1-Of_',
        color: 'bg-green-100',
        headerInfo: '數學導師 • 在線協助中'
    },
    chinese: {
        id: 'chinese',
        name: 'Chinese Tutor',
        role: '中文導師',
        description: '範文背誦挑戰',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAlFTHD4t68TXCYZYAl7Ye8ql9q8_7Ihb5Mrq8K1ZEg9qchtix_yHJr6m9ryYb4dR8sBcTNj1wszseR6KQmu6sEoVY8tn51Mn4CnPHg01VDrCgwP2of-dXyXCK4nIU-eegUj16WqMlTHVqL5JpOrg9jKaSQyYo9x6cGI0s0mCyStzZynGhKW42247I0bkHLEUpfgRxsVdRypAp_8f8Z4XVrYTzbR_QbTVa2FHlcH6zHgYakA5Slk166dRtGJZ8oTg_4MjJEzk1-Of_',
        color: 'bg-purple-100',
        headerInfo: '中文導師 • 在線協助中'
    },
    ace: {
        id: 'ace',
        name: 'Ace Sir',
        role: 'Ace Sir',
        description: '全方位應試策略',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAlFTHD4t68TXCYZYAl7Ye8ql9q8_7Ihb5Mrq8K1ZEg9qchtix_yHJr6m9ryYb4dR8sBcTNj1wszseR6KQmu6sEoVY8tn51Mn4CnPHg01VDrCgwP2of-dXyXCK4nIU-eegUj16WqMlTHVqL5JpOrg9jKaSQyYo9x6cGI0s0mCyStzZynGhKW42247I0bkHLEUpfgRxsVdRypAp_8f8Z4XVrYTzbR_QbTVa2FHlcH6zHgYakA5Slk166dRtGJZ8oTg_4MjJEzk1-Of_',
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
