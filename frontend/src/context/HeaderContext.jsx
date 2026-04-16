import React, { createContext, useContext, useState, useEffect } from 'react';

const HeaderContext = createContext();

export const useHeader = () => useContext(HeaderContext);

export const HeaderProvider = ({ children }) => {
    const [isPinned, setIsPinned] = useState(() => {
        const saved = localStorage.getItem('headerPinned');
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        localStorage.setItem('headerPinned', JSON.stringify(isPinned));
    }, [isPinned]);

    return (
        <HeaderContext.Provider value={{
            isPinned,
            setIsPinned,
            isVisible,
            setIsVisible,
        }}>
            {children}
        </HeaderContext.Provider>
    );
};
