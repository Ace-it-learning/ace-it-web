import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const MainLayout = ({ children, fullWidth = false }) => {
    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
            <Header />
            <main className={`flex-1 mx-auto w-full py-8 flex flex-col gap-6 ${fullWidth
                    ? 'max-w-none px-4 md:px-8 lg:px-12'
                    : 'max-w-[1400px] px-6 md:px-10'
                }`}>
                {children}
            </main>

            <Footer />
        </div>
    );
};

export default MainLayout;
