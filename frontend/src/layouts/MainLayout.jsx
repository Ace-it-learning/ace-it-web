import React from 'react';
import Header from '../components/Header';

const MainLayout = ({ children }) => {
    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 md:px-10 py-8 flex flex-col gap-6">
                {children}
            </main>

            {/* Footer from code.html could go here or be a separate component */}
            <footer className="w-full bg-electric-orange text-white py-8 px-6 md:px-20 mt-10">
                {/* Footer content omitted for brevity, keeping focus on core UI */}
                <div className="text-center text-sm font-medium">© 2026 Ace It! Education.</div>
            </footer>
        </div>
    );
};

export default MainLayout;
