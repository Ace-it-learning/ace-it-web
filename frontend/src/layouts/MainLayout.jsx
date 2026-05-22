import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useHeader } from '../context/HeaderContext';
import { cn } from '../utils/cn';

const MainLayout = ({ children, fullWidth = false, noPadding = false, hideFooter = false, hideHeader = false, dashboard = false }) => {
    const { isPinned } = useHeader();

    return (
        <div className={cn(
            "bg-background-light dark:bg-background-dark flex flex-col",
            dashboard ? "h-screen overflow-hidden" : "min-h-screen"
        )}>
            {!hideHeader && <Header />}
            <main className={`flex-1 mx-auto w-full flex flex-col transition-[padding] duration-500 ease-in-out ${dashboard ? 'overflow-hidden pl-[10px]' : ''} ${fullWidth
                ? 'max-w-none'
                : 'max-w-[1400px]'
                } ${noPadding ? 'pt-0' : (isPinned && !hideHeader ? 'pt-16' : 'pt-0')}`}>
                {children}
            </main>

            {!hideFooter && <Footer />}
        </div>
    );
};

export default MainLayout;
