import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, School, GraduationCap, ArrowRight } from 'lucide-react';

const Onboarding = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nickname: user?.displayName || '',
        grade: 'F6',
        school: ''
    });

    const schools = [
        "La Salle College",
        "Diocesan Boys' School",
        "Diocesan Girls' School",
        "St. Paul's Co-educational College",
        "Queen's College",
        "King's College",
        "Belilios Public School",
        "Heep Yunn School",
        "Maryknoll Convent School",
        "Other"
    ];

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user?.uid) {
            setSubmitError("User not logged in. Please try logging in again.");
            return;
        }

        setIsSubmitting(true);
        setSubmitError('');

        try {
            // Save to backend
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/onboarding`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: user.uid,
                    ...formData
                })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: 'Submission failed' }));
                throw new Error(errorData.error || 'Backend submission error');
            }

            // Optional: small delay for better UX
            await new Promise(r => setTimeout(r, 500));
            navigate('/');
        } catch (error) {
            console.error("Onboarding failed", error);
            setSubmitError(error.message || "Failed to save profile. Please check your connection.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fdfaf8] dark:bg-[#120c08] flex items-center justify-center p-4">
            <div className="max-w-xl w-full glass-container p-10 space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold text-[#1d130c] dark:text-white">Welcome, {user?.displayName?.split(' ')[0]}!</h2>
                    <p className="text-[#a16b45] dark:text-[#d2b48c]">Let's set up your study profile to better tailor your AI learning experience.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nickname */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#1d130c] dark:text-white flex items-center gap-2">
                            <User className="w-4 h-4 text-primary" /> Nickname
                        </label>
                        <input
                            required
                            type="text"
                            value={formData.nickname}
                            onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                            className="w-full bg-white dark:bg-[#1a110a] border border-black/5 dark:border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary outline-none transition-shadow"
                            placeholder="What should Ace call you?"
                        />
                    </div>

                    {/* Grade */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#1d130c] dark:text-white flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-primary" /> Current Grade
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {['F1', 'F2', 'F3', 'F4', 'F5', 'F6'].map(grade => (
                                <button
                                    key={grade}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, grade })}
                                    className={`py-3 rounded-xl border font-bold transition-all ${formData.grade === grade
                                        ? "bg-primary text-white border-primary shadow-lg scale-105"
                                        : "bg-white dark:bg-[#1a110a] border-black/5 dark:border-white/10 text-[#a16b45] hover:border-primary/50"
                                        }`}
                                >
                                    {grade}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* School */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#1d130c] dark:text-white flex items-center gap-2">
                            <School className="w-4 h-4 text-primary" /> School Name
                        </label>
                        <select
                            required
                            value={formData.school}
                            onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                            className="w-full bg-white dark:bg-[#1a110a] border border-black/5 dark:border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
                        >
                            <option value="" disabled>Select your school</option>
                            {schools.map(school => (
                                <option key={school} value={school}>{school}</option>
                            ))}
                        </select>
                    </div>

                    {submitError && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-100 dark:border-red-900/50">
                            {submitError}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full bg-primary text-white font-bold py-5 rounded-2xl shadow-xl hover:shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 mt-4 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? (
                            <>Setting up your world...</>
                        ) : (
                            <>Create My Profile <ArrowRight className="w-5 h-5" /></>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Onboarding;
