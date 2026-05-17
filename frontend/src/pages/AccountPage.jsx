import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
    User, 
    Lock, 
    Shield, 
    CreditCard, 
    AlertTriangle, 
    LogOut, 
    ChevronRight,
    Check,
    X,
    Loader2,
    Crown,
    Zap,
    Target,
    School,
    GraduationCap,
    ChevronsUpDown,
    Search,
    PlusCircle,
    Plus,
    Trash2,
    Monitor,
    Smartphone,
    Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { load } from '@fingerprintjs/fingerprintjs';
import { cn } from '../utils/cn';
import AlertModal from '../components/shared/AlertModal';

const USE_ENTRA = import.meta.env.VITE_USE_ENTRA === 'true';

/** Only this signed-in account sees the internal “email delivery” test button on Progress Report. */
const PROGRESS_REPORT_EMAIL_TESTER = 'fungtam@gmail.com';

function isProgressReportEmailTester(user, profile) {
    const target = PROGRESS_REPORT_EMAIL_TESTER;
    const candidates = [user?.email, profile?.email, profile?.preferred_username];
    return candidates.some(
        (c) => String(c || '')
            .trim()
            .toLowerCase() === target
    );
}

function isEntraGoogleUser(user) {
    if (!USE_ENTRA || user?.authProvider !== 'entra') return false;
    const idp = String(user?.entraIdp || '').toLowerCase();
    if (!idp) return false;
    return idp.includes('google');
}

/**
 * Compute the subscription expiry date for display.
 * - Uses profile.subscription_expiry if available.
 * - Otherwise computes from subscription_start_date (or now) + 1 month.
 * - Returns a Date object in local time (backend stores HK timezone dates).
 */
function getSubscriptionExpiryDate(profile) {
    if (!profile) return null;

    // Use explicit expiry if present
    if (profile.subscription_expiry) {
        const raw = profile.subscription_expiry;
        if (raw.toDate) return raw.toDate();
        return new Date(raw);
    }

    // For paid tiers without an explicit expiry, compute 1 month from start date
    const tier = profile.subscription_tier;
    if (tier === 'pro' || tier === 'premium') {
        const startRaw = profile.subscription_start_date;
        const start = startRaw ? (startRaw.toDate ? startRaw.toDate() : new Date(startRaw)) : new Date();
        // Add 1 month
        const expiry = new Date(start);
        expiry.setMonth(expiry.getMonth() + 1);
        // Set to end of day (23:59:59.999) in HK timezone logic is handled by storing the date;
        // for display we just show the date portion.
        return expiry;
    }

    return null;
}

/** Format a date for display in Hong Kong locale. */
function formatHKDate(date) {
    if (!date || isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Hong_Kong'
    });
}

const SchoolAutocomplete = ({ schools, value, onChange, isLoading }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (!isOpen && value) {
            setSearch(value);
        }
    }, [isOpen, value]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                if (value) setSearch(value);
                else setSearch('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [value]);

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
                    setTimeout(() => inputRef.current?.focus(), 0);
                }}
            >
                <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 flex items-center justify-between outline-none transition-shadow focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
                    <span className={`block truncate text-sm ${!value && 'text-slate-400'}`}>
                        {value || (isLoading ? "Loading schools..." : "Select your school...")}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 text-slate-400" />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-2xl bg-white border border-slate-200 py-1 text-base shadow-2xl focus:outline-none sm:text-sm">
                    <div className="sticky top-0 z-10 bg-white px-3 py-2 border-b border-slate-100">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                className="w-full bg-slate-50 border-none rounded-lg py-2 pl-8 pr-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                                placeholder="Search school..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {filteredGroups.length === 0 ? (
                        <div className="relative cursor-default select-none py-2 px-4 text-slate-500 italic">
                            Nothing found.
                        </div>
                    ) : (
                        filteredGroups.map(group => (
                            <div key={group.region}>
                                <div className="sticky top-[45px] z-10 bg-slate-50 px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {group.region}
                                </div>
                                {group.list.map(school => (
                                    <div
                                        key={school.name}
                                        className={cn(
                                            "relative cursor-pointer select-none py-3 pl-4 pr-9 hover:bg-slate-50 transition-colors text-sm",
                                            value === school.name ? "bg-primary/5 text-primary font-bold" : "text-slate-700"
                                        )}
                                        onClick={() => handleSelect(school.name)}
                                    >
                                        <span className="block truncate">{school.name}</span>
                                        {value === school.name && (
                                            <span className="absolute inset-y-0 right-0 flex items-center pr-4">
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

const AccountPage = () => {
    const { user, profile, refreshProfile, changePassword, resetPassword, setPasswordForSocialUser, deleteUserAccount, logout } = useAuth();
    const { t, language } = useLanguage();
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'general');

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && ['general', 'parental', 'security', 'subscription'].includes(tab) && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [searchParams, activeTab]);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setSearchParams({ tab: tabId });
    };

    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [isVerifierTesting, setIsVerifierTesting] = useState(false);
    const [message, setMessage] = useState(null);
    const [schools, setSchools] = useState({ HK: [], KLN: [], NT: [], Other: [] });
    const [isLoadingSchools, setIsLoadingSchools] = useState(true);

    const [modal, setModal] = useState({ isOpen: false, type: 'info', message: '', onConfirm: null });
    const [isForgetLoading, setIsForgetLoading] = useState(null); // fingerprint

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    // Profile Form State
    const [profileData, setProfileData] = useState({
        nickname: '',
        grade: '',
        school: '',
        gender: '',
        targetGradeEng: '',
        targetGradeChi: '',
        targetGradeMath: '',
        electives: []
    });

    // Password Form State
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    // Parental Settings Form State (local, not auto-saved)
    const [parentalSettings, setParentalSettings] = useState({
        parent_email: '',
        parent_report_enabled: false,
        send_copy_to_self: true
    });
    const [hasParentalChanges, setHasParentalChanges] = useState(false);

    useEffect(() => {
        if (profile) {
            setProfileData({
                nickname: profile.nickname || '',
                grade: profile.grade || 'F6',
                school: profile.school || '',
                gender: profile.gender || 'Male',
                targetGradeEng: profile.targetGradeEng || '',
                targetGradeChi: profile.targetGradeChi || '',
                targetGradeMath: profile.targetGradeMath || '',
                electives: profile.electives || []
            });
            setParentalSettings({
                parent_email: profile.parent_email || '',
                parent_report_enabled: profile.parent_report_enabled ?? false,
                send_copy_to_self: profile.send_copy_to_self ?? true
            });
            setHasParentalChanges(false);
        }
    }, [profile]);

    useEffect(() => {
        const fetchSchools = async () => {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            try {
                const res = await fetch(`${API_URL}/api/schools`);
                if (res.ok) {
                    const data = await res.json();
                    const grouped = { 'Hong Kong Island': [], 'Kowloon': [], 'New Territories': [], 'Other': [] };
                    data.forEach(s => {
                        const region = s.region || 'Other';
                        if (grouped[region]) grouped[region].push(s);
                        else grouped['Other'].push(s);
                    });
                    setSchools(grouped);
                }
            } catch (err) {
                console.error("School fetch error:", err);
            } finally {
                setIsLoadingSchools(false);
            }
        };
        fetchSchools();
    }, []);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/user/profile/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: user.uid, ...profileData })
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                refreshProfile();
            } else {
                throw new Error("Update failed");
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveParentSettings = async () => {
        if (!user?.uid) return;
        setIsSaving(true);
        try {
            const res = await fetch(`${API_URL}/api/user/parent-settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: user.uid,
                    parent_email: parentalSettings.parent_email,
                    parent_report_enabled: parentalSettings.parent_report_enabled,
                    send_copy_to_self: parentalSettings.send_copy_to_self
                })
            });

            if (res.ok) {
                refreshProfile();
                setHasParentalChanges(false);
                setMessage({ type: 'success', text: 'Parental settings saved successfully!' });
            } else {
                const err = await res.json();
                setMessage({ type: 'error', text: err.error || "Failed to save settings" });
            }
        } catch (error) {
            console.error("Save Error:", error);
            setMessage({ type: 'error', text: "Network error. Please try again." });
        } finally {
            setIsSaving(false);
        }
    };

    /** Interprets POST /api/user/parent-test-report JSON (real send vs simulated on localhost). */
    const applyParentTestReportResponse = (data, realSendMessage) => {
        if (!data || data.success === false) {
            setMessage({
                type: 'error',
                text: data?.error || data?.message || 'Could not send the test email.'
            });
            return;
        }
        if (data.deliveryMode === 'simulated' || data.mock) {
            setMessage({
                type: 'warning',
                text:
                    data.message ||
                    'No real email was sent: the backend is not connected to an email service yet. Add Azure Communication Email or SMTP in backend .env (see ENVIRONMENT.md), then restart the backend.'
            });
            return;
        }
        setMessage({
            type: 'success',
            text: realSendMessage || 'Sample sent. Check your inbox and spam in a minute or two.'
        });
    };

    const handleSendTestReport = async () => {
        if (!user?.uid || !profile?.parent_email) return;
        setIsTesting(true);
        try {
            const token = await user.getIdToken?.();
            const res = await fetch(`${API_URL}/api/user/parent-test-report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ uid: user.uid, parent_email: profile.parent_email })
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setMessage({ type: 'error', text: data.error || 'Failed to send test report' });
                return;
            }
            applyParentTestReportResponse(data, t('subscription.report_sent') || 'Test report sent!');
        } catch (error) {
            console.error("Test Report Error:", error);
            setMessage({ type: 'error', text: "Network error." });
        } finally {
            setIsTesting(false);
        }
    };

    /** Internal: send a sample progress report to the verifier’s own Gmail (no parent email field needed). */
    const handleSendVerifierSampleToInbox = async () => {
        if (!user?.uid || !isProgressReportEmailTester(user, profile)) return;
        setIsVerifierTesting(true);
        try {
            const token = await user.getIdToken?.();
            const res = await fetch(`${API_URL}/api/user/parent-test-report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    uid: user.uid,
                    parent_email: PROGRESS_REPORT_EMAIL_TESTER,
                    send_copy_to_self: false
                })
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setMessage({ type: 'error', text: data.error || 'Could not send the sample email.' });
                return;
            }
            applyParentTestReportResponse(data, null);
        } catch (error) {
            console.error('Verifier sample email error:', error);
            setMessage({ type: 'error', text: 'Network error. Try again.' });
        } finally {
            setIsVerifierTesting(false);
        }
    };

    const handleForgetDevice = async (fingerprint) => {
        if (!user?.uid) return;
        setIsForgetLoading(fingerprint);
        try {
            const res = await fetch(`${API_URL}/api/user/device/forget`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: user.uid, fingerprint })
            });

            if (res.ok) {
                refreshProfile();
                setMessage({ type: 'success', text: 'Device removed successfully.' });
            } else {
                setMessage({ type: 'error', text: 'Failed to remove device.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error.' });
        } finally {
            setIsForgetLoading(null);
        }
    };

    const handleConfirmForget = (fingerprint) => {
        setModal({
            isOpen: true,
            type: 'warning',
            message: 'Are you sure you want to remove this device? You will be signed out on that machine.',
            onConfirm: () => handleForgetDevice(fingerprint)
        });
    };

    const getDeviceIcon = (os = '') => {
        if (os.toLowerCase().includes('mac') || os.toLowerCase().includes('windows')) return <Monitor size={18} />;
        return <Smartphone size={18} />;
    };

    const registerCurrentDevice = useCallback(async (overrides) => {
        if (!user?.uid) return;
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            const fp = await load();
            const result = await fp.get();
            const visitorId = result.visitorId; 
            const ua = navigator.userAgent;
            
            // Aggressive detection logic
            let browser = "Safari";
            if (/chrome|chromium|crios|chrome\//i.test(ua)) browser = "Chrome";
            else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
            else if (/edg|edge/i.test(ua)) browser = "Edge";
            
            let os = "Mobile";
            if (/windows|win64|wow64/i.test(ua)) os = "Windows";
            else if (/macintosh|mac os/i.test(ua)) os = "MacOS";
            else if (/linux/i.test(ua)) os = "Linux";

            const metadata = overrides || {
                name: `${browser} on ${os}`,
                browser,
                os
            };

            await fetch(`${API_URL}/api/user/device/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: user.uid,
                    fingerprint: visitorId,
                    metadata
                })
            });

            // Do NOT call refreshProfile() here — it sets isProfileLoading in AuthContext,
            // which causes ProtectedRoute to unmount/remount this page, creating an infinite loop.
            // The device list will update on the next natural profile refresh.
        } catch (err) {
            console.error("[Device] Auto-registration error:", err);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.uid, API_URL]);

    // Auto-detect and Register Device
    const hasRegisteredRef = useRef(false);
    useEffect(() => {
        let cancelled = false;
        if (user?.uid && activeTab === 'subscription' && !hasRegisteredRef.current) {
            hasRegisteredRef.current = true;
            registerCurrentDevice().then(() => {
                if (cancelled) return;
            });
        }
        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.uid, activeTab]);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (USE_ENTRA) {
            // Keep the same UI, but Entra password changes happen on Microsoft-hosted pages.
            setIsSaving(true);
            setMessage(null);
            try {
                if (isEntraGoogleUser(user)) {
                    setMessage({
                        type: 'error',
                        text: 'You signed in with Google. To change your Google password, use your Google account security settings.'
                    });
                    return;
                }
                setMessage({ type: 'success', text: 'Opening Microsoft sign-in to update your password…' });
                await changePassword(passwords.current, passwords.new);
            } catch (err) {
                console.error(err);
                setMessage({ type: 'error', text: err.message || 'Could not start Microsoft sign-in.' });
            } finally {
                setIsSaving(false);
            }
            return;
        }

        if (passwords.new !== passwords.confirm) {
            setMessage({ type: 'error', text: "Passwords do not match!" });
            return;
        }

        setIsSaving(true);
        setMessage(null);
        try {
            const providers = Array.isArray(user?.providerData) ? user.providerData : [];
            const isSocial = providers.some(p => p.providerId === 'google.com');
            const hasPassword = providers.some(p => p.providerId === 'password');

            if (isSocial && !hasPassword) {
                await setPasswordForSocialUser(passwords.new);
            } else {
                await changePassword(passwords.current, passwords.new);
            }
            setMessage({ type: 'success', text: (isSocial && !hasPassword) ? 'Password set successfully!' : 'Password changed successfully!' });
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (err) {
            console.error(err);
            let msg = err.message;
            if (err.code === 'auth/wrong-password') msg = "Incorrect current password.";
            setMessage({ type: 'error', text: msg });
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetViaEmail = async () => {
        if (!user?.email) return;
        setIsSaving(true);
        setMessage(null);
        try {
            if (USE_ENTRA) {
                if (isEntraGoogleUser(user)) {
                    setMessage({
                        type: 'error',
                        text: 'You signed in with Google. Password reset is managed in your Google account security settings.'
                    });
                    return;
                }
                setMessage({ type: 'success', text: 'Opening Microsoft sign-in to reset your password…' });
                await resetPassword(user.email);
                return;
            }

            await resetPassword(user.email);
            setMessage({ type: 'success', text: "Password reset email sent! Please check your inbox." });
        } catch (err) {
            console.error(err);
            const prefix = 'Failed to send reset email. ';
            setMessage({ type: 'error', text: prefix + err.message });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelClick = () => {
        setModal({
            isOpen: true,
            type: 'info',
            message:
                "You will be redirected to Stripe's secure billing page where you can cancel your subscription, update your payment method, or view invoices. Continue?",
            onConfirm: async () => {
                await openBillingPortal();
            }
        });
    };

    const openBillingPortal = async () => {
        if (!user?.uid) {
            setMessage({ type: 'error', text: 'Please sign in first.' });
            return;
        }
        setIsSaving(true);
        setMessage(null);
        try {
            const token = await user.getIdToken?.();
            const response = await fetch(`${API_URL}/api/payment/create-customer-portal-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ uid: user.uid })
            });
            const data = await response.json();
            if (!response.ok || !data?.url) {
                setMessage({ type: 'error', text: data?.error || 'Unable to open billing portal.' });
                return;
            }
            window.location.href = data.url;
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Unable to open billing portal.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleManageBilling = () => openBillingPortal();

    const handleDeleteClick = () => {
        const isPaid = profile?.subscription_tier !== 'free';
        const isCancelled = profile?.subscription_status === 'cancelled';

        if (isPaid && !isCancelled) {
            setModal({
                isOpen: true,
                type: 'error',
                message: "You must cancel your active subscription before you can delete your account.",
                onConfirm: null
            });
            return;
        }

        setModal({
            isOpen: true,
            type: 'error',
            message: "WARNING: This action is permanent. All your study data, achievements, and account details will be deleted forever. Do you wish to proceed?",
            onConfirm: async () => {
                try {
                    await deleteUserAccount();
                    logout(); // Force logout as user is deleted
                } catch (err) {
                    setMessage({ type: 'error', text: err.message });
                    setModal({ isOpen: false });
                }
            }
        });
    };

    const tabs = [
        { id: 'general', labelKey: 'account.tab_profile', icon: <User size={18} /> },
        { id: 'parental', labelKey: 'account.tab_parental', icon: <Shield size={18} /> },
        { id: 'security', labelKey: 'account.tab_security', icon: <Lock size={18} /> },
        { id: 'subscription', labelKey: 'account.tab_subscription', icon: <CreditCard size={18} /> }
    ];

    const isGoogleOnly = USE_ENTRA
        ? isEntraGoogleUser(user)
        : (user?.providerData?.every(p => p.providerId === 'google.com') ?? false);
    const hasPassword = USE_ENTRA
        ? !isEntraGoogleUser(user)
        : (user?.providerData?.some(p => p.providerId === 'password') ?? false);

    return (
        <div className="min-h-screen bg-slate-50/50 py-12 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row gap-8">
                    
                    {/* Sidebar Navigation */}
                    <div className="md:w-64 shrink-0 space-y-2">
                        <div className="p-4 mb-4">
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('account.settings_title')}</h1>
                            <p className={cn(
                                'text-xs text-slate-500 font-medium mt-1',
                                language === 'zh' ? 'tracking-normal normal-case' : 'uppercase tracking-widest'
                            )}>{t('account.settings_subtitle')}</p>
                        </div>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200",
                                    activeTab === tab.id 
                                        ? "bg-white text-primary shadow-sm shadow-primary/5 border border-slate-200" 
                                        : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-700"
                                )}
                            >
                                <span className={cn(activeTab === tab.id ? "text-primary" : "text-slate-400")}>{tab.icon}</span>
                                {t(tab.labelKey)}
                                {activeTab === tab.id && (
                                    <motion.div layoutId="activeTabDot" className="ml-auto w-1 h-1 rounded-full bg-primary" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden min-h-[600px] flex flex-col">
                        
                        {/* Feedback Banner */}
                        <AnimatePresence>
                            {message && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className={cn(
                                        "px-8 py-3 text-sm font-bold flex items-center gap-3",
                                        message.type === 'success' && "bg-green-50 text-green-700",
                                        message.type === 'warning' && "bg-amber-50 text-amber-900 border-b border-amber-200",
                                        (message.type === 'error' ||
                                            (message.type !== 'success' && message.type !== 'warning')) &&
                                            "bg-red-50 text-red-700"
                                    )}
                                >
                                    {message.type === 'success' ? (
                                        <Check size={16} />
                                    ) : (
                                        <AlertTriangle size={16} className={message.type === 'warning' ? 'text-amber-600 shrink-0' : 'shrink-0'} />
                                    )}
                                    {message.text}
                                    <button onClick={() => setMessage(null)} className="ml-auto opacity-50 hover:opacity-100 transition-opacity"><X size={16} /></button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="p-8 md:p-10 flex-1">
                            {activeTab === 'general' && (
                                <form onSubmit={handleProfileUpdate} className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                                    <User size={14} className="text-primary" /> Nickname
                                                </label>
                                                <div className="relative">
                                                    <input 
                                                        type="text" 
                                                        value={profileData.nickname}
                                                        onChange={e => setProfileData({...profileData, nickname: e.target.value})}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                        placeholder="Enter nickname"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                                    <User size={14} className="text-primary" /> Gender
                                                </label>
                                                <div className="flex gap-2">
                                                    {['Male', 'Female'].map(g => (
                                                        <button
                                                            key={g}
                                                            type="button"
                                                            onClick={() => setProfileData({...profileData, gender: g})}
                                                            className={cn(
                                                                "flex-1 py-3 rounded-xl text-xs font-bold border transition-all",
                                                                profileData.gender === g 
                                                                    ? "bg-slate-900 border-slate-900 text-white shadow-lg" 
                                                                    : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                                                            )}
                                                        >
                                                            {g}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                                    <GraduationCap size={14} className="text-primary" /> Grade
                                                </label>
                                                <div className="grid grid-cols-6 gap-2">
                                                    {['F4', 'F5', 'F6'].map((g) => (
                                                        <button
                                                            key={g}
                                                            type="button"
                                                            onClick={() => setProfileData({ ...profileData, grade: g })}
                                                            className={cn(
                                                                'col-span-2 py-3 rounded-xl text-xs font-bold border transition-all px-2 text-center',
                                                                profileData.grade === g
                                                                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                                                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                                                            )}
                                                            title={g}
                                                        >
                                                            {g}
                                                        </button>
                                                    ))}
                                                    {['Self study', 'Not specify'].map((g) => (
                                                        <button
                                                            key={g}
                                                            type="button"
                                                            onClick={() => setProfileData({ ...profileData, grade: g })}
                                                            className={cn(
                                                                'col-span-3 min-h-[2.75rem] py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center leading-snug whitespace-normal',
                                                                profileData.grade === g
                                                                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                                                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                                                            )}
                                                            title={g}
                                                        >
                                                            {g}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                                    <School size={14} className="text-primary" /> School
                                                </label>
                                                <SchoolAutocomplete 
                                                    schools={schools} 
                                                    value={profileData.school} 
                                                    onChange={val => setProfileData({...profileData, school: val})}
                                                    isLoading={isLoadingSchools}
                                                />
                                            </div>

                                            {/* Dream Subject is now managed via Dream Subjects page (JUPAS programmes) */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                                    <Target size={14} className="text-primary" /> Dream Subjects
                                                </label>
                                                <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-500">
                                                    Managed via <a href="/dream-subjects" className="text-primary font-semibold underline">Dream Subjects</a> page
                                                </div>
                                            </div>
                                        </div>

                                        {/* Target Grades */}
                                        <div className="md:col-span-2 pt-4">
                                            <label className="text-xs font-bold text-primary uppercase tracking-widest px-1 mb-4 block">Target DSE Levels (Core Subjects)</label>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {[
                                                    { label: 'English', key: 'targetGradeEng' },
                                                    { label: 'Chinese', key: 'targetGradeChi' },
                                                    { label: 'Maths', key: 'targetGradeMath' }
                                                ].map(({ label, key }) => (
                                                    <div key={key} className="space-y-2">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">{label}</span>
                                                        <select 
                                                            value={profileData[key]}
                                                            onChange={e => setProfileData({...profileData, [key]: e.target.value})}
                                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                                        >
                                                            <option value="">-</option>
                                                            {['5**', '5*', '5', '4', '3', '2', '1'].map(lv => <option key={lv} value={lv}>Level {lv}</option>)}
                                                        </select>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Electives */}
                                        <div className="md:col-span-2 pt-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <label className="text-xs font-bold text-primary uppercase tracking-widest px-1">Elective Subjects</label>
                                                <button 
                                                    type="button"
                                                    onClick={() => setProfileData({
                                                        ...profileData,
                                                        electives: [...profileData.electives, { subject: '', targetGrade: '' }]
                                                    })}
                                                    className="text-[10px] font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition-all flex items-center gap-1"
                                                >
                                                    <Plus size={12} /> Add Elective
                                                </button>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                {profileData.electives.length === 0 ? (
                                                    <p className="text-center py-8 text-xs text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                                                        No electives added yet.
                                                    </p>
                                                ) : (
                                                    profileData.electives.map((elective, idx) => (
                                                        <div key={idx} className="flex gap-4 items-end animate-in fade-in slide-in-from-left-2 duration-300">
                                                            <div className="flex-1 space-y-2">
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">Subject</span>
                                                                <select 
                                                                    value={elective.subject}
                                                                    onChange={e => {
                                                                        const newElectives = [...profileData.electives];
                                                                        newElectives[idx].subject = e.target.value;
                                                                        setProfileData({...profileData, electives: newElectives});
                                                                    }}
                                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                                                >
                                                                    <option value="">Select Subject</option>
                                                                    {['Biology', 'Business, Accounting and Financial Studies (BAFS)', 'Chemistry', 'Chinese History', 'Chinese Literature', 'Combined Science', 'Design and Applied Technology', 'Economics', 'Ethics and Religious Studies', 'Geography', 'Health Management and Social Care', 'History', 'Information and Communication Technology (ICT)', 'Integrated Science', 'Literature in English', 'Mathematics Extended Part (Module 1)', 'Mathematics Extended Part (Module 2)', 'Music', 'Physical Education', 'Physics', 'Technology and Living', 'Tourism and Hospitality Studies', 'Visual Arts'].map(s => (
                                                                        <option key={s} value={s}>{s}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div className="w-32 space-y-2">
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">Target</span>
                                                                <select 
                                                                    value={elective.targetGrade}
                                                                    onChange={e => {
                                                                        const newElectives = [...profileData.electives];
                                                                        newElectives[idx].targetGrade = e.target.value;
                                                                        setProfileData({...profileData, electives: newElectives});
                                                                    }}
                                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                                                >
                                                                    <option value="">-</option>
                                                                    {['5**', '5*', '5', '4', '3', '2', '1'].map(lv => <option key={lv} value={lv}>{lv}</option>)}
                                                                </select>
                                                            </div>
                                                            <button 
                                                                type="button"
                                                                onClick={() => {
                                                                    const newElectives = profileData.electives.filter((_, i) => i !== idx);
                                                                    setProfileData({...profileData, electives: newElectives});
                                                                }}
                                                                className="p-3.5 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-100 flex justify-end">
                                        <button 
                                            type="submit"
                                            disabled={isSaving}
                                            className="px-10 py-4 bg-primary text-white rounded-[1.25rem] font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isSaving && <Loader2 size={18} className="animate-spin" />}
                                            Save Changes
                                        </button>
                                    </div>

                                </form>
                            )}

                            {activeTab === 'parental' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    {/* Parental Oversight Section */}
                                    <div className="space-y-8">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                            <div className="space-y-1">
                                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                                    <Shield className="text-purple-600 w-5 h-5" />
                                                    {t('subscription.parent_report_title')}
                                                </h2>
                                                <p className="text-sm text-slate-500">{t('subscription.parent_report_subtitle')}</p>
                                            </div>
                                            {profile?.subscription_tier !== 'premium' && (
                                                <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-xl text-xs font-bold border border-purple-200 flex items-center gap-2">
                                                    <Crown className="w-4 h-4" /> {t('subscription.parent_report_locked')}
                                                </span>
                                            )}
                                        </div>

                                        {isProgressReportEmailTester(user, profile) && (
                                            <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 sm:p-5 text-left space-y-3">
                                                <p className="text-sm text-amber-950 font-semibold">
                                                    Email delivery check (only you see this)
                                                </p>
                                                <p className="text-xs text-amber-900/80 leading-relaxed">
                                                    Tap the button to try a sample progress report to your Gmail. Nothing else in your account changes.
                                                </p>
                                                <p className="text-xs text-amber-900/80 leading-relaxed">
                                                    If the bar at the top turns <strong>amber</strong> after you click, the app did not actually send mail yet — the server needs email settings (see project file ENVIRONMENT.md).
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={handleSendVerifierSampleToInbox}
                                                    disabled={isVerifierTesting}
                                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold shadow-sm hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {isVerifierTesting ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Mail className="w-4 h-4" />
                                                    )}
                                                    {isVerifierTesting ? 'Sending…' : 'Send sample to my Gmail'}
                                                </button>
                                            </div>
                                        )}

                                        <div className={cn(
                                            "grid grid-cols-1 lg:grid-cols-2 gap-8 transition-all duration-500",
                                            profile?.subscription_tier !== 'premium' && "opacity-40 pointer-events-none blur-[2px]"
                                        )}>
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">{t('subscription.parent_report_email')}</label>
                                                    <div className="relative">
                                                        <input
                                                            type="email"
                                                            value={parentalSettings.parent_email}
                                                            onChange={(e) => {
                                                                setParentalSettings(prev => ({ ...prev, parent_email: e.target.value }));
                                                                setHasParentalChanges(true);
                                                            }}
                                                            disabled={isSaving}
                                                            placeholder="parent@example.com"
                                                            className={cn(
                                                                "w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all",
                                                                isSaving && "opacity-50 cursor-not-allowed"
                                                            )}
                                                        />
                                                        {isSaving && (
                                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                                <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-bold text-slate-900">{t('subscription.parent_report_toggle')}</p>
                                                        <p className="text-[10px] text-slate-500 leading-relaxed max-w-[200px]">{t('subscription.parent_report_desc')}</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setParentalSettings(prev => ({ ...prev, parent_report_enabled: !prev.parent_report_enabled }));
                                                            setHasParentalChanges(true);
                                                        }}
                                                        disabled={isSaving}
                                                        className={cn(
                                                            "w-12 h-7 rounded-full transition-all relative",
                                                            parentalSettings.parent_report_enabled ? "bg-purple-600 shadow-inner" : "bg-slate-300",
                                                            isSaving && "opacity-50 cursor-not-allowed"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "w-5 h-5 bg-white rounded-full shadow-md absolute top-1 transition-all",
                                                            parentalSettings.parent_report_enabled ? "left-6" : "left-1"
                                                        )} />
                                                    </button>
                                                </div>

                                                {/* Send Copy to Self Toggle */}
                                                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-bold text-slate-900">Send a copy to me</p>
                                                        <p className="text-[10px] text-slate-500 leading-relaxed max-w-[200px]">Receive a copy of the weekly progress report at your registered email.</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setParentalSettings(prev => ({ ...prev, send_copy_to_self: !prev.send_copy_to_self }));
                                                            setHasParentalChanges(true);
                                                        }}
                                                        disabled={isSaving}
                                                        className={cn(
                                                            "w-12 h-7 rounded-full transition-all relative",
                                                            parentalSettings.send_copy_to_self ? "bg-purple-600 shadow-inner" : "bg-slate-300",
                                                            isSaving && "opacity-50 cursor-not-allowed"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "w-5 h-5 bg-white rounded-full shadow-md absolute top-1 transition-all",
                                                            parentalSettings.send_copy_to_self ? "left-6" : "left-1"
                                                        )} />
                                                    </button>
                                                </div>

                                                {/* Save Button */}
                                                <div className="pt-2">
                                                    <button
                                                        type="button"
                                                        onClick={handleSaveParentSettings}
                                                        disabled={isSaving || !hasParentalChanges}
                                                        className={cn(
                                                            "w-full py-3.5 rounded-2xl font-bold text-sm shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2",
                                                            hasParentalChanges
                                                                ? "bg-purple-600 text-white shadow-purple-200 hover:bg-purple-700"
                                                                : "bg-slate-100 text-slate-400 cursor-default"
                                                        )}
                                                    >
                                                        {isSaving && <Loader2 size={16} className="animate-spin" />}
                                                        {hasParentalChanges ? 'Save Changes' : 'No Changes'}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="bg-purple-50 rounded-3xl p-6 border border-purple-100 flex flex-col justify-center items-center text-center space-y-4">
                                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-purple-600">
                                                    {isTesting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6" />}
                                                </div>
                                                <h3 className="text-sm font-bold text-purple-900">{t('subscription.test_report')}</h3>
                                                <p className="text-[10px] text-purple-700 max-w-[200px] mx-auto">
                                                    Verify the connection immediately by sending a sample progress report to the registered email.
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={handleSendTestReport}
                                                    disabled={!parentalSettings.parent_email || isTesting}
                                                    className="px-6 py-2.5 bg-white text-purple-700 text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
                                                >
                                                    {isTesting ? t('common.sending') || 'Sending...' : t('subscription.test_report')}
                                                </button>
                                            </div>
                                        </div>

                                        {profile?.subscription_tier !== 'premium' && (
                                            <div className="bg-purple-600 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                                        <Crown size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold">Unlock Parental Oversight</p>
                                                        <p className="text-xs opacity-80">Requires a Premium Plan subscription.</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => window.location.href = '/subscription'}
                                                    className="px-6 py-3 bg-white text-purple-600 rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-all"
                                                >
                                                    Upgrade Now
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">

                                    {/* Password Section */}
                                    <section className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">Account Credentials</h3>
                                            <p className="text-sm text-slate-500">
                                                {USE_ENTRA
                                                    ? 'Your password is managed by Microsoft Entra ID. We will open Microsoft sign-in so you can update or reset it securely.'
                                                    : 'Update your login password or link a new one.'}
                                            </p>
                                        </div>

                                        <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
                                            {(!isGoogleOnly || hasPassword) && (
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Current Password</label>
                                                    <input 
                                                        type="password" 
                                                        value={passwords.current}
                                                        onChange={e => setPasswords({...passwords, current: e.target.value})}
                                                        autoComplete="current-password"
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                                        placeholder="••••••••"
                                                        disabled={USE_ENTRA}
                                                    />
                                                    {USE_ENTRA && (
                                                        <p className="text-[10px] text-slate-500 px-1">
                                                            Not used for Microsoft-managed accounts — you will set/confirm your password on Microsoft&apos;s page.
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">{isGoogleOnly && !hasPassword ? 'New Password' : 'Change Password'}</label>
                                                <input 
                                                    type="password" 
                                                    value={passwords.new}
                                                    onChange={e => setPasswords({...passwords, new: e.target.value})}
                                                    autoComplete="new-password"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                                    placeholder="Enter new password"
                                                    disabled={USE_ENTRA}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Confirm New Password</label>
                                                <input 
                                                    type="password" 
                                                    value={passwords.confirm}
                                                    onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                                                    autoComplete="new-password"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                                    placeholder="Confirm new password"
                                                    disabled={USE_ENTRA}
                                                />
                                            </div>
                                            <button 
                                                type="submit"
                                                disabled={isSaving || (!USE_ENTRA && !passwords.new)}
                                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {isSaving && <Loader2 size={18} className="animate-spin" />}
                                                {USE_ENTRA
                                                    ? 'Continue to Microsoft'
                                                    : (isGoogleOnly && !hasPassword ? 'Set Password' : 'Update Password')}
                                            </button>
                                        </form>

                                        {/* Reset via Email Fallback */}
                                        <div className="mt-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 max-w-md">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-primary">
                                                    <Lock size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-900">Forgot current password?</h4>
                                                    <p className="text-[10px] text-slate-500 mt-1">
                                                        {USE_ENTRA
                                                            ? 'We will open Microsoft sign-in so you can reset your password with Microsoft Entra ID.'
                                                            : "If you don't remember your current password, you can reset it via your registered email."}
                                                    </p>
                                                    <button 
                                                        onClick={handleResetViaEmail}
                                                        disabled={isSaving}
                                                        className="mt-3 text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                                    >
                                                        {USE_ENTRA ? (
                                                            <>
                                                                Open Microsoft reset <ChevronRight size={14} />
                                                            </>
                                                        ) : (
                                                            <>
                                                                Send Reset Email <ChevronRight size={14} />
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Danger Zone */}
                                    <section className="pt-10 border-t border-slate-100 space-y-6">
                                        <div className="flex items-center gap-3 text-red-600">
                                            <AlertTriangle size={24} />
                                            <div>
                                                <h3 className="text-lg font-bold">Danger Zone</h3>
                                                <p className="text-sm text-red-500/80">Permanent account actions. Proceed with caution.</p>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-red-50/50 border border-red-100 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                                            <div className="text-center md:text-left">
                                                <p className="font-bold text-red-900 font-premium">Delete Account</p>
                                                <p className="text-sm text-red-700 max-w-sm">Wipes all your study data, achievements, and statistics from our database. This is irreversible.</p>
                                            </div>
                                            <button 
                                                onClick={handleDeleteClick}
                                                className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-95"
                                            >
                                                Delete Permanent
                                            </button>
                                        </div>
                                    </section>
                                </div>
                            )}

                            {activeTab === 'subscription' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Current Subscription</h3>
                                            <p className="text-sm text-slate-500">View and manage your current plan limits.</p>
                                        </div>
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner",
                                            profile?.subscription_tier === 'premium' ? "bg-purple-100 text-purple-600" : 
                                            profile?.subscription_tier === 'pro' ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400"
                                        )}>
                                            {profile?.subscription_tier === 'premium' ? <Crown /> : profile?.subscription_tier === 'pro' ? <Zap /> : <Shield />}
                                        </div>
                                    </div>

                                    {/* Plan Card */}
                                    <div className={cn(
                                        "p-8 rounded-[2rem] border relative overflow-hidden group transition-all",
                                        profile?.subscription_tier === 'premium' ? "bg-purple-600 text-white border-purple-500 shadow-purple-200" : 
                                        profile?.subscription_tier === 'pro' ? "bg-amber-400 text-white border-amber-300 shadow-amber-200" : "bg-slate-50 text-slate-700 border-slate-200"
                                    )}>
                                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Active Plan</span>
                                                <h2 className="text-3xl font-black capitalize">{profile?.subscription_tier || 'Free'} Plan</h2>
                                                <div className="flex items-center gap-2 mt-2 opacity-90">
                                                    <div className={cn(
                                                        "w-2 h-2 rounded-full",
                                                        profile?.subscription_status === 'cancelled' ? "bg-red-400" : "bg-green-400 animate-pulse"
                                                    )} />
                                                    <span className="text-sm font-bold">
                                                        {profile?.subscription_status === 'cancelled'
                                                            ? 'Auto-renewal cancelled'
                                                            : (!profile?.subscription_tier || profile?.subscription_tier === 'free')
                                                                ? 'Standard Access'
                                                                : 'Auto-renewing'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 min-w-[180px]">
                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 flex items-center gap-1.5 font-premium">
                                                    <ChevronRight size={10} /> Valid Until
                                                </p>
                                                <p className="text-xl font-bold mt-1">
                                                    {(() => {
                                                        const expiry = getSubscriptionExpiryDate(profile);
                                                        return expiry ? formatHKDate(expiry) : 'Forever (Trial)';
                                                    })()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Decorative Blur */}
                                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(!profile?.subscription_tier || profile?.subscription_tier === 'free' || profile?.subscription_status === 'cancelled') ? (
                                            <button 
                                                onClick={() => window.location.href = '/subscription'}
                                                className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                            >
                                                {profile?.subscription_status === 'cancelled' ? 'Renew Plan' : 'Upgrade to Pro - HK$68/mo'} <ChevronRight size={18} />
                                            </button>
                                        ) : profile?.subscription_tier === 'pro' ? (
                                            <>
                                                <button 
                                                    onClick={() => window.location.href = '/subscription'}
                                                    className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-center"
                                                >
                                                    <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                                                        <Crown size={18} className="shrink-0" aria-hidden />
                                                        <span>Upgrade to Premium</span>
                                                        <span className="opacity-95">HK$128/mo</span>
                                                    </span>
                                                </button>
                                                <button 
                                                    onClick={handleCancelClick}
                                                    className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                                                >
                                                    Cancel Subscription
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-bold border border-slate-100 cursor-default flex items-center justify-center gap-2">
                                                    <Check size={18} /> Current Highest Plan
                                                </button>
                                                <button 
                                                    onClick={handleCancelClick}
                                                    className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                                                >
                                                    Cancel Subscription
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {(profile?.subscription_tier === 'pro' || profile?.subscription_tier === 'premium') && (
                                        <button
                                            onClick={handleManageBilling}
                                            disabled={isSaving}
                                            className="w-full py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                                        >
                                            {isSaving ? 'Opening Billing Portal…' : 'Manage Billing & Card'}
                                        </button>
                                    )}

                                    {/* Multi-Device Info */}
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center px-1 pt-4">
                                            <div className="flex items-center gap-2">
                                                <Smartphone className="text-primary w-5 h-5" />
                                                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Active Devices</h4>
                                            </div>
                                            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                                                {profile?.active_devices?.length || 0} / {profile?.subscription_tier === 'premium' ? '5' : '3'}
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            {!profile?.active_devices || profile.active_devices.length === 0 ? (
                                                <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/30 flex flex-col items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-300">
                                                        <Smartphone size={20} />
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-400">No active devices registered</p>
                                                </div>
                                            ) : (
                                                profile.active_devices.map((device, i) => (
                                                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-[1.25rem] border border-slate-100 group hover:border-primary/20 hover:bg-white hover:shadow-sm transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                                                {getDeviceIcon(device.os)}
                                                            </div>
                                                            <div>
                                                                 <p className="text-sm font-bold text-slate-900">{device.name || 'Unknown Device'}</p>
                                                                 <div className="flex flex-col gap-0.5">
                                                                     <p className="text-[10px] text-slate-500">
                                                                         {device.browser} • {device.os} • {device.lastSeen?.toDate?.().toLocaleDateString() || 'Recently'}
                                                                     </p>
                                                                     <p className="text-[9px] font-mono text-slate-400">
                                                                         ID: {device.fingerprint ? `${device.fingerprint.slice(0, 4).toUpperCase()}...${device.fingerprint.slice(-4).toUpperCase()}` : 'Unknown ID'}
                                                                     </p>
                                                                 </div>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleConfirmForget(device.fingerprint)}
                                                            disabled={isForgetLoading === device.fingerprint}
                                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-lg disabled:opacity-50"
                                                            title="Forget Device"
                                                        >
                                                            {isForgetLoading === device.fingerprint ? (
                                                                <Loader2 size={16} className="animate-spin" />
                                                            ) : (
                                                                <Trash2 size={18} />
                                                            )}
                                                        </button>
                                                    </div>
                                                ))
                                            )}

                                            {/* Subtle Troubleshooter */}
                                            <div className="mt-2 text-center">
                                                <button 
                                                    onClick={() => {
                                                        const metadata = { name: "Chrome on Windows", browser: "Chrome", os: "Windows" };
                                                        registerCurrentDevice(metadata);
                                                    }}
                                                    className="text-[9px] text-slate-300 hover:text-slate-400 transition-colors"
                                                >
                                                    Doesn't look right? <span className="underline">Fix Label</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5 flex gap-4">
                                            <Shield className="text-amber-600 shrink-0 w-5 h-5" />
                                            <p className="text-[10px] text-amber-800 leading-relaxed font-bold">
                                                Security Note: You can register up to 3 devices (5 on Premium). If you reach the limit, please remove an old device above before signing in on a new one.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Components */}
            <AlertModal 
                isOpen={modal.isOpen}
                type={modal.type}
                message={modal.message}
                onClose={() => setModal({ ...modal, isOpen: false })}
                onConfirm={modal.onConfirm || undefined}
            />
        </div>
    );
};

export default AccountPage;
