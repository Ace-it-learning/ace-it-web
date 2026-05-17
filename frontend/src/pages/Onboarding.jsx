import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { User, School, GraduationCap, ArrowRight, Check, ChevronsUpDown, Search, Target, Plus, PlusCircle, Trash2 } from 'lucide-react';

const SchoolAutocomplete = ({ schools, value, onChange, isLoading }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const containerRef = React.useRef(null);
    const inputRef = React.useRef(null);

    // Initial search value from selected school if any
    React.useEffect(() => {
        if (!isOpen && value) {
            setSearch(value);
        }
    }, [isOpen, value]);

    // Close on click outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                // Reset search to selected value if closed
                if (value) setSearch(value);
                else setSearch('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [value]);

    // Flatten logic for filtering, but keep structure for display?
    // Actually simpler to filter the groups
    const filteredGroups = Object.entries(schools).map(([region, list]) => {
        const filteredList = list.filter(s =>
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            (s.nameCh && s.nameCh.includes(search))
        );
        return { region, list: filteredList };
    }).filter(g => g.list.length > 0);

    const handleSelect = (schoolName) => {
        onChange(schoolName);
        setSearch(schoolName);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={containerRef}>
            <div
                className="relative cursor-pointer"
                onClick={() => {
                    setIsOpen(true);
                    // Focus input on open
                    setTimeout(() => inputRef.current?.focus(), 0);
                    // Clear search on open to allow easier typing? Or keep?
                    // Usually keep current value but select all. 
                    // Let's just keep current value.
                }}
            >
                <div className="w-full bg-white dark:bg-[#1a110a] border border-black/5 dark:border-white/10 rounded-2xl px-5 py-4 flex items-center justify-between outline-none transition-shadow ring-offset-2 focus-within:ring-2 focus-within:ring-primary">
                    <span className={`block truncate ${!value && 'text-gray-400'}`}>
                        {value || (isLoading ? "Loading schools..." : " Select your school...")}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 text-[#1d130c] dark:text-white" />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-2xl bg-white dark:bg-[#1a110a] py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm animate-in fade-in zoom-in-95 duration-200">
                    <div className="sticky top-0 z-10 bg-white dark:bg-[#1a110a] px-3 py-2 border-b border-black/5 dark:border-white/10">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-lg py-2 pl-8 pr-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                                placeholder="Search school..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault(); // Prevent form submission
                                        // Optional: Select first result if available
                                        if (filteredGroups.length > 0 && filteredGroups[0].list.length > 0) {
                                            handleSelect(filteredGroups[0].list[0].name);
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {filteredGroups.length === 0 ? (
                        <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-400">
                            Nothing found.
                        </div>
                    ) : (
                        filteredGroups.map(group => (
                            <div key={group.region}>
                                <div className="sticky top-11 z-10 bg-gray-50/90 dark:bg-white/5 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {group.region}
                                </div>
                                {group.list.map(school => (
                                    <div
                                        key={school.name}
                                        className={`relative cursor-pointer select-none py-3 pl-4 pr-9 hover:bg-primary/10 transition-colors ${value === school.name ? 'bg-primary/5 text-primary' : 'text-[#1d130c] dark:text-white'}`}
                                        onClick={() => handleSelect(school.name)}
                                    >
                                        <div className="flex flex-col">
                                            <span className={`block truncate ${value === school.name ? 'font-bold' : 'font-normal'}`}>
                                                {school.name}
                                            </span>
                                            {(school.nameCh || school.moi) && (
                                                <span className="text-xs text-gray-500 truncate">
                                                    {school.nameCh && <span>{school.nameCh} </span>}
                                                    {school.moi && school.moi !== 'Other' && (
                                                        <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                                            {school.moi}
                                                        </span>
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                        {value === school.name && (
                                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary">
                                                <Check className="h-4 w-4" />
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

const Onboarding = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        nickname: user?.displayName || '',
        grade: 'F6',
        school: '',
        gender: 'Male', // Default to Male as requested
        targetGradeEng: '',
        targetGradeChi: '',
        targetGradeMath: '',
        electives: [] // Multi-elective support
    });

    const [schools, setSchools] = useState({ HK: [], KLN: [], NT: [], Other: [] });
    const [isLoadingSchools, setIsLoadingSchools] = useState(true);

    // Fetch schools on mount
    React.useEffect(() => {
        const fetchSchools = async () => {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            try {
                const res = await fetch(`${API_URL}/api/schools`);
                if (!res.ok) throw new Error("Failed to fetch");
                const data = await res.json();

                // Group by Region
                const grouped = {
                    'Hong Kong Island': [],
                    'Kowloon': [],
                    'New Territories': [],
                    'Other': []
                };

                data.forEach(s => {
                    const region = s.region || 'Other';
                    if (grouped[region]) {
                        grouped[region].push(s);
                    } else {
                        grouped['Other'].push(s);
                    }
                });

                setSchools(grouped);
            } catch (err) {
                console.error("School fetch error:", err);
                // Fallback list if API fails
                setSchools({ 'Other': [{ name: "Other", region: "Other" }] });
            } finally {
                setIsLoadingSchools(false);
            }
        };
        fetchSchools();
    }, []);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user?.uid) {
            setSubmitError("User not logged in. Please try logging in again.");
            return;
        }

        if (!formData.school) {
            setSubmitError("Please select a school.");
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
                    email: user.email,
                    ...formData,
                    is_new_student: false, // Ensure flag is cleared
                    photoURL: formData.gender === 'Male' ? '/avatars/Student/Marcus.jpeg' : (user.photoURL || '/avatars/Student/Natalie.jpeg')
                })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: 'Submission failed' }));
                throw new Error(errorData.error || 'Backend submission error');
            }

            // Client-side State Update (Fixed "2nd Attempt" Bug & Avatar Issue)
            // 1. Update Firebase User Object immediately
            if (user) {
                const newPhotoURL = formData.gender === 'Male' ? '/avatars/Student/Marcus.jpeg' : '/avatars/Student/Natalie.jpeg';
                console.log("[Onboarding] Updating client profile:", { displayName: formData.nickname, photoURL: newPhotoURL });

                // Only update Firebase profile when Firebase auth is active
                if (user?.providerId || user?.reload) {
                    const { updateProfile } = await import('firebase/auth');
                    await updateProfile(user, {
                        displayName: formData.nickname,
                        photoURL: newPhotoURL
                    });
                }

                // 2. Force token refresh to ensure any backend claims sync (optional but good practice)
                if (user?.getIdToken) {
                    await user.getIdToken(true);
                }
            }

            console.log("[Onboarding] Client state updated. Verifying backend persistence...");
            setSubmitError("Profile created! finalizing setup... (1/3)");

            // Verification Loop: Poll backend until it confirms profile exists
            const verifyProfileCreation = async (attempts = 0) => {
                if (attempts > 10) {
                    throw new Error("Verification timed out. Please refresh.");
                }
                const checkRes = await fetch(`${API_URL}/api/stats?uid=${user.uid}`);
                if (checkRes.ok) {
                    // Backend confirmed!
                    console.log("[Onboarding] Backend verified profile exists. Redirecting...");
                    setSubmitError("Done! Redirecting...");
                    // Hard redirect to force clean state load or robust navigate
                    localStorage.setItem('justOnboarded', 'true');
                    window.location.href = '/dashboard';
                    return;
                } else {
                    console.log(`[Onboarding] Backend sync pending... (Attempt ${attempts + 1})`);
                    await new Promise(r => setTimeout(r, 1000)); // Wait 1s
                    return verifyProfileCreation(attempts + 1);
                }
            };

            await verifyProfileCreation();

        } catch (error) {
            console.error("[Onboarding] Error:", error);
            setSubmitError(error.message || "Failed to save profile. Please check your connection.");
            setIsSubmitting(false); // Only stop loading if error (keep loading on success -> verify)
        }
        // NOTE: We do NOT set isSubmitting(false) in finally if successful, 
        // to keep the loading state while redirecting.
    };




    return (
        <div className="min-h-screen bg-[#fdfaf8] dark:bg-[#120c08] flex items-center justify-center p-4">
            <div className="max-w-xl w-full glass-container p-10 space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                <div className="text-center space-y-2 relative">
                    <button
                        onClick={async () => {
                            await logout();
                            window.location.href = '/';
                        }}
                        className="absolute right-0 top-0 text-xs font-bold text-gray-400 hover:text-primary transition-colors flex items-center gap-1"
                    >
                        Sign Out / Exit
                    </button>

                    <h2 className="text-3xl font-bold text-[#1d130c] dark:text-white">{t('onboarding.welcome', { name: user?.displayName?.split(' ')[0] || 'Warrior' })}</h2>
                    <p className="text-[#a16b45] dark:text-[#d2b48c]">{t('onboarding.setup_profile')}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nickname */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#1d130c] dark:text-white flex items-center gap-2">
                            <User className="w-4 h-4 text-primary" /> {t('onboarding.nickname')}
                        </label>
                        <input
                            required
                            type="text"
                            value={formData.nickname}
                            onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                            className="w-full bg-white dark:bg-[#1a110a] border border-black/5 dark:border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary outline-none transition-shadow"
                            placeholder={t('onboarding.nickname_placeholder')}
                        />
                    </div>

                    {/* Gender */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#1d130c] dark:text-white flex items-center gap-2">
                            <User className="w-4 h-4 text-primary" /> Gender
                        </label>
                        <div className="flex gap-3">
                            {['Male', 'Female'].map(g => (
                                <button
                                    key={g}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, gender: g })}
                                    className={`flex-1 py-3 rounded-xl border font-bold transition-all ${formData.gender === g
                                        ? "bg-primary text-white border-primary shadow-lg"
                                        : "bg-white dark:bg-[#1a110a] border-black/5 dark:border-white/10 text-[#a16b45] hover:border-primary/50"
                                        }`}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Grade */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#1d130c] dark:text-white flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-primary" /> {t('onboarding.grade')}
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {['F4', 'F5', 'F6', 'Self study', 'Not specify'].map(grade => (
                                <button
                                    key={grade}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, grade })}
                                    className={`py-3 rounded-xl border font-bold text-sm transition-all ${formData.grade === grade
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
                            <School className="w-4 h-4 text-primary" /> {t('onboarding.school')}
                        </label>
                        <SchoolAutocomplete
                            schools={schools}
                            value={formData.school}
                            onChange={(val) => setFormData({ ...formData, school: val })}
                            isLoading={isLoadingSchools}
                        />
                    </div>

                    {/* Target DSE Levels (Optional) */}
                    <div className="space-y-4 pt-2 border-t border-black/5 dark:border-white/5">
                        <label className="text-sm font-bold text-[#1d130c] dark:text-white flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-primary" /> Target DSE Levels (Optional)
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: 'English', key: 'targetGradeEng' },
                                { label: 'Chinese', key: 'targetGradeChi' },
                                { label: 'Math', key: 'targetGradeMath' }
                            ].map(({ label, key }) => (
                                <div key={key} className="space-y-1">
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 pl-1">{label}</span>
                                    <select
                                        value={formData[key]}
                                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                                        className="w-full bg-white dark:bg-[#1a110a] border border-black/5 dark:border-white/10 rounded-xl px-3 py-3 text-center font-bold focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="" className="text-gray-400">-</option>
                                        {['5**', '5*', '5', '4', '3'].map(g => (
                                            <option key={g} value={g}>{g}</option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Elective Subjects (Optional) */}
                    <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-[#1d130c] dark:text-white flex items-center gap-2">
                                <PlusCircle className="w-4 h-4 text-primary" /> Elective Subjects (Optional)
                            </label>
                            <button
                                type="button"
                                onClick={() => setFormData({
                                    ...formData,
                                    electives: [...formData.electives, { subject: '', targetGrade: '' }]
                                })}
                                className="text-xs font-bold text-primary hover:opacity-80 flex items-center gap-1 bg-primary/5 px-2 py-1 rounded-lg"
                            >
                                <Plus className="w-3 h-3" /> Add
                            </button>
                        </div>

                        <div className="space-y-3">
                            {formData.electives.map((elective, index) => (
                                <div key={index} className="flex gap-2 items-end animate-in fade-in slide-in-from-left-2 duration-300">
                                    <div className="flex-1 space-y-1">
                                        <span className="text-[10px] font-medium text-gray-500 pl-1">Subject</span>
                                        <select
                                            value={elective.subject}
                                            onChange={(e) => {
                                                const newElectives = [...formData.electives];
                                                newElectives[index].subject = e.target.value;
                                                setFormData({ ...formData, electives: newElectives });
                                            }}
                                            className="w-full bg-white dark:bg-[#1a110a] border border-black/5 dark:border-white/10 rounded-xl px-3 py-3 text-sm font-bold focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="">Select Subject</option>
                                            {['Biology', 'Business, Accounting and Financial Studies (BAFS)', 'Chemistry', 'Chinese History', 'Chinese Literature', 'Combined Science', 'Design and Applied Technology', 'Economics', 'Ethics and Religious Studies', 'Geography', 'Health Management and Social Care', 'History', 'Information and Communication Technology (ICT)', 'Integrated Science', 'Literature in English', 'Mathematics Extended Part (Module 1)', 'Mathematics Extended Part (Module 2)', 'Music', 'Physical Education', 'Physics', 'Technology and Living', 'Tourism and Hospitality Studies', 'Visual Arts'].map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-24 space-y-1">
                                        <span className="text-[10px] font-medium text-gray-500 pl-1">Target</span>
                                        <select
                                            value={elective.targetGrade}
                                            onChange={(e) => {
                                                const newElectives = [...formData.electives];
                                                newElectives[index].targetGrade = e.target.value;
                                                setFormData({ ...formData, electives: newElectives });
                                            }}
                                            className="w-full bg-white dark:bg-[#1a110a] border border-black/5 dark:border-white/10 rounded-xl px-3 py-3 text-sm font-bold text-center focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="">-</option>
                                            {['5**', '5*', '5', '4', '3'].map(g => (
                                                <option key={g} value={g}>{g}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newElectives = formData.electives.filter((_, i) => i !== index);
                                            setFormData({ ...formData, electives: newElectives });
                                        }}
                                        className="p-3 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {formData.electives.length === 0 && (
                                <p className="text-xs text-gray-400 italic text-center py-2 border-2 border-dashed border-black/5 dark:border-white/5 rounded-xl">
                                    No electives added yet.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Dream Subjects are managed via the Dream Subjects page after onboarding */}


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
                            <>{t('onboarding.submit_loading')}</>
                        ) : (
                            <>{t('onboarding.submit')} <ArrowRight className="w-5 h-5" /></>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Onboarding;
