import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useHeader } from '../context/HeaderContext';

const MainLayout = ({ children, fullWidth = false, noPadding = false }) => {
    const { isPinned } = useHeader();

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
            <Header />
            <main className={`flex-1 mx-auto w-full flex flex-col gap-6 transition-[padding] duration-500 ease-in-out ${fullWidth
                ? 'max-w-none px-4 md:px-8 lg:px-12'
                : 'max-w-[1400px] px-6 md:px-10'
                } ${noPadding ? 'pt-0' : (isPinned ? 'pt-24' : 'pt-8')}`}>
                {children}
            </main>

            <Footer />
        </div>
    );
};

export default MainLayout;
