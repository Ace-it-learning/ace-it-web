import React, { useState, useEffect } from 'react';
import { RotateCw, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OrientationGuard = () => {
    const [isPortrait, setIsPortrait] = useState(false);
    const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        const checkOrientation = () => {
            const portrait = window.innerHeight > window.innerWidth;
            
            // Refined check: UserAgent OR Touch Support + Narrow Screen
            const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
            const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            // We only want to block if it's a mobile/tablet device in portrait
            // Desktop users with narrow windows should generally not be blocked
            const mobileOrTablet = isMobileUA || (isTouch && window.innerWidth < 1200);
            
            setIsPortrait(portrait);
            setIsMobileOrTablet(mobileOrTablet);
        };

        checkOrientation();
        window.addEventListener('resize', checkOrientation);
        return () => window.removeEventListener('resize', checkOrientation);
    }, []);

    // Only show for mobile/tablet users in portrait mode, and if not dismissed
    if (!isMobileOrTablet || !isPortrait || isDismissed) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[10000] bg-[#EEF1F5] flex flex-col items-center justify-center p-8 text-center"
            >
                <div className="relative mb-8">
                    <motion.div
                        animate={{ rotate: 90 }}
                        transition={{ 
                            repeat: Infinity, 
                            duration: 2, 
                            ease: "easeInOut",
                            repeatDelay: 1
                        }}
                        className="relative"
                    >
                        <Smartphone size={80} className="text-[#F1783B]" strokeWidth={1} />
                        <motion.div 
                            className="absolute -top-4 -right-4"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            <RotateCw size={32} className="text-[#4A5568]" />
                        </motion.div>
                    </motion.div>
                </div>

                <h2 className="text-2xl font-bold text-[#4A5568] mb-4 font-brand">
                    Landscape Mode Recommended
                </h2>
                
                <p className="text-slate-500 max-w-xs leading-relaxed font-medium">
                    Please rotate your device to landscape for the best learning experience with Ace It!
                </p>

                <div className="mt-12 flex flex-col items-center gap-6">
                    <div className="flex gap-2">
                        <div className="w-2 h-2 bg-[#F1783B] rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-[#F1783B] rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-2 h-2 bg-[#F1783B] rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>

                    <button 
                        onClick={() => setIsDismissed(true)}
                        className="text-slate-400 text-xs font-bold hover:text-[#F1783B] transition-colors underline underline-offset-4"
                    >
                        Continue to site anyway
                    </button>
                </div>

                <style dangerouslySetInnerHTML={{ __html: `
                    body { overflow: hidden !important; }
                `}} />
            </motion.div>
        </AnimatePresence>
    );
};

export default OrientationGuard;
