import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const MainLayout = ({ children }) => {
    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 md:px-10 py-8 flex flex-col gap-6">
                {children}
            </main>

            <Footer />
        </div>
    );
};

export default MainLayout;
