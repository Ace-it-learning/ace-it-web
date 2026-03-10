import React, { useState, useEffect } from 'react';
import { Trophy, Gift, Sparkles, User, FileText, ArrowLeft, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RedemptionStore = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [xp, setXp] = useState(0);
    const [inventory, setInventory] = useState([]);

    // Gacha State
    const [isOpening, setIsOpening] = useState(false);
    const [revealedItem, setRevealedItem] = useState(null);
    const [error, setError] = useState(null);

    // Mock Data (to be moved to backend/json later)
    const BOX_COST = 500;

    useEffect(() => {
        if (!user) return;

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

        // Fetch XP
        fetch(`${API_URL}/api/stats?uid=${user.uid}`)
            .then(res => res.json())
            .then(data => {
                setXp(data.xp || 0);
                // Inventory is not yet in stats, we might need a separate endpoint
                // For now, let's assume we add it to the stats response or fetch it
                if (data.inventory) setInventory(data.inventory);
            })
            .catch(console.error);

    }, [user]);

    const handleOpenBox = async () => {
        if (xp < BOX_COST) {
            setError("Not enough XP!");
            return;
        }
        setError(null);
        setIsOpening(true);
        setRevealedItem(null);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/redemption/blindbox`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ uid: user.uid })
            });

            const data = await res.json();

            // Artificial Delay for Animation (Frontend feel)
            setTimeout(() => {
                if (data.success) {
                    setXp(data.newBalance);
                    setInventory(prev => [...prev, data.newItem]);
                    setRevealedItem(data.newItem);
                } else {
                    setError(data.error || "Redemption Failed");
                }
                setIsOpening(false);
            }, 2000); // 2s animation

        } catch (err) {
            console.error(err);
            setError("Server Error. Try again.");
            setIsOpening(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold font-display text-gray-900">Redemption Hub</h1>
                        <p className="text-gray-500">Spend your hard-earned XP on exclusive rewards.</p>
                    </div>
                </div>
                <div className="bg-black text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Balance</span>
                    <span className="text-2xl font-black text-yellow-500">{xp} XP</span>
                </div>
            </div>

            {/* ERROR TOAST */}
            {error && (
                <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl border border-red-200 animate-pulse text-center font-bold">
                    {error}
                </div>
            )}

            {/* MAIN SHOWCASE: BLIND BOX */}
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-[2rem] p-12 text-white relative overflow-hidden shadow-2xl">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 space-y-6 text-center md:text-left">
                        <div className="inline-block px-4 py-1 bg-yellow-500 text-black font-black text-xs rounded-full uppercase tracking-widest">Limited Time</div>
                        <h2 className="text-4xl md:text-5xl font-black font-display leading-tight">
                            Mystery Tutor Box
                        </h2>
                        <p className="text-purple-200 text-lg max-w-md">
                            Contains <span className="text-white font-bold">Star Tutor Skins</span> (20% chance) or exclusive <span className="text-white font-bold">Avatar Frames</span>.
                        </p>

                        <div className="flex flex-col md:flex-row items-center gap-4 pt-4">
                            <button
                                onClick={handleOpenBox}
                                disabled={isOpening}
                                className={`px-8 py-4 rounded-2xl font-black text-lg flex items-center gap-3 transition-all ${isOpening
                                    ? "bg-gray-600 cursor-wait"
                                    : "bg-yellow-400 text-black hover:bg-yellow-300 hover:scale-105 shadow-[0_0_30px_rgba(250,204,21,0.4)]"
                                    }`}
                            >
                                {isOpening ? "Opening..." : (<><span>🎁</span> Open for {BOX_COST} XP</>)}
                            </button>
                            <span className="text-sm text-purple-300 font-medium"> Guaranteed No Duplicates</span>
                        </div>
                    </div>

                    {/* ANIMATION STAGE */}
                    <div className="flex-1 flex justify-center items-center h-64">
                        {isOpening ? (
                            <div className="animate-bounce text-9xl">📦</div>
                            // In real app, use Lottie or CSS keyframes for shake/explode
                        ) : revealedItem ? (
                            <div className="text-center animate-in zoom-in duration-500">
                                <div className="text-8xl mb-4 drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                                    {revealedItem.icon}
                                </div>
                                <h3 className="text-2xl font-bold">{revealedItem.name}</h3>
                                <p className={`uppercase tracking-widest text-xs font-bold mt-2 ${revealedItem.rarity === 'legendary' ? 'text-yellow-400' : 'text-gray-300'
                                    }`}>{revealedItem.rarity}</p>
                                <button
                                    onClick={() => setRevealedItem(null)}
                                    className="mt-6 text-sm text-white/50 hover:text-white underline"
                                >
                                    Open Another
                                </button>
                            </div>
                        ) : (
                            <div className="relative group cursor-pointer hover:scale-110 transition-transform duration-500">
                                <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full animate-pulse"></div>
                                <Gift className="w-48 h-48 text-yellow-400 drop-shadow-2xl relative z-10" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* INVENTORY GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Tutors */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">My Tutors</h3>
                    </div>

                    {inventory.filter(i => i.type === 'tutor').length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {inventory.filter(i => i.type === 'tutor').map((item, idx) => (
                                <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center text-center">
                                    <span className="text-4xl mb-2">{item.icon}</span>
                                    <span className="font-bold text-sm text-gray-800">{item.name}</span>
                                    <button className="mt-3 text-xs bg-black text-white px-3 py-1.5 rounded-lg active:scale-95">Equip</button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <Lock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No tutors unlocked yet.</p>
                        </div>
                    )}
                </div>

                {/* Certificates */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-green-100 rounded-xl">
                            <FileText className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Certificates</h3>
                    </div>
                    <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <Lock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>Complete Level 5 to earn your first certificate.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RedemptionStore;
