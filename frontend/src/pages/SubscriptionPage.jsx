import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
    Shield, 
    Check, 
    Zap, 
    Crown, 
    Clock, 
    AlertCircle,
    ArrowRight,
    Search,
    Loader2,
    RefreshCw
} from 'lucide-react';
import { cn } from '../utils/cn';
import { trackEvent } from '../utils/analytics';
import { isCheatEnabled } from '../utils/devAccess';

const SubscriptionPage = () => {
    const { user, profile, refreshProfile } = useAuth();
    const { t } = useLanguage();
    const [promoCode, setPromoCode] = useState('');
    const [isApplying, setIsApplying] = useState(false);
    const [discountMultiplier, setDiscountMultiplier] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [checkoutSuccess, setCheckoutSuccess] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    // Log on mount to verify component lifecycle
    useEffect(() => {
        console.log('[SubscriptionPage] MOUNTED. URL:', window.location.href);
        return () => console.log('[SubscriptionPage] UNMOUNTED');
    }, []);

    // Detect returning from Stripe checkout and force profile refresh
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const isCheckoutSuccess = params.get('checkout') === 'success';
        
        if (!isCheckoutSuccess) return;
        
        // Only proceed if user is authenticated
        if (!user?.uid) {
            console.log('[SubscriptionPage] Checkout success detected but user not ready yet, waiting for auth...');
            return;
        }
        
        console.log('[SubscriptionPage] Auto-sync starting for uid=', user.uid);
        setCheckoutSuccess(true);
        // Clear the query param to prevent repeated refreshes
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        
        let syncCompleted = false;
        
        // Force sync with Stripe and refresh profile
        const syncAndRefresh = async (attempt = 1) => {
            if (syncCompleted) return;
            console.log(`[SubscriptionPage] syncAndRefresh attempt ${attempt}...`);
            try {
                const token = await user?.getIdToken?.(true); // forceRefresh = true to get fresh token
                const syncRes = await fetch(`${API_URL}/api/payment/sync-subscription?uid=${user?.uid}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                const syncData = await syncRes.json();
                console.log('[SubscriptionPage] Stripe sync result:', syncData);
                
                if (!syncRes.ok && attempt < 3) {
                    console.log(`[SubscriptionPage] Sync failed, retrying in 3s...`);
                    setTimeout(() => syncAndRefresh(attempt + 1), 3000);
                    return;
                }
            } catch (e) {
                console.warn('[SubscriptionPage] Sync call failed:', e);
                if (attempt < 3) {
                    console.log(`[SubscriptionPage] Sync failed, retrying in 3s...`);
                    setTimeout(() => syncAndRefresh(attempt + 1), 3000);
                    return;
                }
            }
            
            // Always refresh profile after sync attempt
            await refreshProfile();
            syncCompleted = true;
            setCheckoutSuccess(false);
        };
        
        // Poll profile until it reflects the paid tier
        const pollProfile = async () => {
            let polls = 0;
            const maxPolls = 20; // Poll for up to 20 seconds
            
            const doPoll = async () => {
                if (syncCompleted || polls >= maxPolls) return;
                polls++;
                
                const currentTier = profile?.subscription_tier || 'free';
                console.log(`[SubscriptionPage] Poll ${polls}: current tier = ${currentTier}`);
                
                if (currentTier !== 'free') {
                    console.log('[SubscriptionPage] Profile updated to paid tier, stopping poll');
                    syncCompleted = true;
                    setCheckoutSuccess(false);
                    return;
                }
                
                // Refresh profile
                await refreshProfile();
                
                // Schedule next poll
                setTimeout(doPoll, 1000);
            };
            
            // Start polling after initial sync attempt
            setTimeout(doPoll, 2000);
        };
        
        // Start sync immediately
        syncAndRefresh(1);
        
        // Also start polling
        pollProfile();
        
        // Fallback refresh after cache TTL
        const fallbackTimer = setTimeout(() => {
            if (!syncCompleted) {
                console.log('[SubscriptionPage] Fallback refresh after 65s');
                refreshProfile();
            }
        }, 65000);

        return () => {
            syncCompleted = true;
            clearTimeout(fallbackTimer);
        };
    }, [refreshProfile, user, API_URL, profile?.subscription_tier]);

    const tier = profile?.subscription_tier || 'free';
    const debugBypass = import.meta.env.VITE_ENABLE_SUBSCRIPTION_DEBUG === 'true' && isCheatEnabled(user, profile);
    
    // Debug: log profile tier whenever it changes
    useEffect(() => {
        console.log('[SubscriptionPage] Profile tier:', tier, 'Full profile:', profile);
    }, [tier, profile]);

    const handleForceSync = async () => {
        if (!user?.uid) return;
        setCheckoutSuccess(true);
        try {
            const token = await user?.getIdToken?.();
            // First call sync endpoint
            const syncRes = await fetch(`${API_URL}/api/payment/sync-subscription?uid=${user?.uid}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            const syncData = await syncRes.json();
            console.log('[SubscriptionPage] Force sync result:', syncData);
            alert(`Sync result: ${JSON.stringify(syncData, null, 2)}`);
            
            // Then refresh profile
            await refreshProfile();
        } catch (e) {
            console.error('[SubscriptionPage] Force sync failed:', e);
            alert('Sync failed: ' + e.message);
        } finally {
            setCheckoutSuccess(false);
        }
    };

    const handleRedeem = async () => {
        if (!promoCode) return;
        setIsApplying(true);
        try {
            const response = await fetch(`${API_URL}/api/promo/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: promoCode })
            });
            const data = await response.json();
            if (response.ok) {
                setDiscountMultiplier(1 - (data.discount || 0));
                trackEvent('Subscription', 'Redeem Promo', promoCode);
                // Optional: success feedback toast
            } else {
                alert(data.error || t('subscription.invalid_code') || 'Invalid promo code');
            }
        } catch (e) {
            console.error("Redemption error:", e);
            alert('Error validating code.');
        } finally {
            setIsApplying(false);
        }
    };

    const handleUpgrade = async (selectedTier) => {
        if (!user?.uid) {
            alert('Please sign in first.');
            return;
        }
        if (selectedTier === 'free') {
            alert('You are already on the Free plan.');
            return;
        }

        if (debugBypass) {
            setIsSaving(true);
            try {
                const token = await user.getIdToken?.();
                const response = await fetch(`${API_URL}/api/profile`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify({
                        uid: user.uid,
                        subscription_tier: selectedTier
                    })
                });
                if (response.ok) {
                    await refreshProfile();
                    alert(`Debug: Plan successfully updated to ${selectedTier}!`);
                } else {
                    alert('Failed to update plan.');
                }
            } catch (e) {
                console.error(e);
                alert('Error updating plan.');
            } finally {
                setIsSaving(false);
            }
        } else {
            // Create Stripe Checkout session
            setIsSaving(true);
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 15000);
                const token = await user.getIdToken?.();
                const response = await fetch(`${API_URL}/api/payment/create-checkout-session`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify({
                        uid: user.uid,
                        planId: selectedTier
                    }),
                    signal: controller.signal
                });
                clearTimeout(timeout);
                const data = await response.json();
                if (!response.ok) {
                    alert(data.error || 'Failed to create checkout session.');
                    return;
                }

                // Upgrade/downgrade from an existing subscription — redirect to Stripe Checkout
                if (data.upgraded) {
                    await refreshProfile();
                    if (data.url) {
                        window.location.href = data.url;
                        return;
                    }
                    alert(data.message || `Your subscription has been updated to ${selectedTier}.`);
                    return;
                }

                if (!data.url) {
                    alert('Checkout URL missing. Please try again.');
                    return;
                }
                window.location.href = data.url;
            } catch (e) {
                console.error(e);
                if (e?.name === 'AbortError') {
                    alert('Request timed out. Please try again.');
                } else {
                    alert('Error creating payment.');
                }
            } finally {
                setIsSaving(false);
            }
        }
    };

    const tiers = [
        {
            id: 'free',
            name: t('pricing.free_name') || 'Free Tier',
            price: 'HK$0',
            icon: <Shield className="w-6 h-6 text-gray-500" />,
            features: [
                t('pricing.free_f1') || 'Chat with English AI tutor',
                t('pricing.free_f2') || '1st Quest of English Reading, Writing, Listening & Speaking',
                t('pricing.free_f3') || '1 practice on Grammar Lab',
                t('pricing.free_f4') || 'Mock exam preview',
                t('pricing.free_f5') || 'Earn base XP',
                t('pricing.free_f6') || 'Redeem avatar using XP',
                t('pricing.free_f7') || 'Achievement timeline'
            ],
            color: 'gray'
        },
        {
            id: 'pro',
            name: t('pricing.pro_name') || 'Pro Plan',
            price: 'HK$68',
            originalPrice: 'HK$88',
            period: t('subscription.period_monthly') || '/monthly',
            icon: <Zap className="w-6 h-6 text-amber-500" />,
            features: [
                t('pricing.pro_f1') || 'English Reading, Writing, Listening and Speaking full access',
                t('pricing.pro_f2') || 'Unlimited Quest access',
                t('pricing.pro_f3') || '4 Mock Exams per month',
                t('pricing.pro_f4') || '1.2x XP Multiplier',
                t('pricing.pro_f5') || 'Weekly Challenge Quest',
                t('pricing.pro_f6') || 'Recommended Quests & Skill map',
                t('pricing.pro_f8') || 'Chat with Ace Sir (Academic & University advisor)'
            ],
            color: 'amber',
            popular: true
        },
        {
            id: 'premium',
            name: t('pricing.premium_name') || 'Premium Plan',
            price: 'HK$128',
            originalPrice: 'HK$168',
            period: t('subscription.period_monthly') || '/monthly',
            icon: <Crown className="w-6 h-6 text-purple-500" />,
            features: [
                t('pricing.premium_f1') || 'Unlimited Mock exam access',
                t('pricing.premium_f2') || 'Pro AI model for Mock exam grading',
                t('pricing.premium_f6') || 'Human-like AI voices for all Speaking Quests & Mock Exam',
                t('pricing.premium_f3') || '1.5x XP Multiplier',
                t('pricing.premium_f5') || 'Parental monthly progress report'
            ],
            color: 'purple'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-8">
            <div className="max-w-6xl mx-auto space-y-12">
                
                {/* 1. CURRENT STATUS HEADER */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="space-y-2 text-center md:text-left">
                        <h1 className="text-3xl font-bold text-slate-900">{t('subscription.title') || 'Subscription & Devices'}</h1>
                        <p className="text-slate-500">{t('subscription.subtitle') || 'Manage your plan and secure your account access.'}</p>
                    </div>
                    {user && (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center shadow-inner",
                                    tier === 'premium' ? "bg-purple-100 text-purple-600" : 
                                    tier === 'pro' ? "bg-amber-100 text-amber-600" : "bg-slate-200 text-slate-500"
                                )}>
                                    {tier === 'premium' ? <Crown /> : tier === 'pro' ? <Zap /> : <Shield />}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('subscription.current_plan') || 'Current Plan'}</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xl font-bold text-slate-900 capitalize">{t(`pricing.${tier}_name`) || tier}</p>
                                        {checkoutSuccess && <RefreshCw className="w-4 h-4 text-primary animate-spin" />}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleForceSync}
                                disabled={checkoutSuccess}
                                className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-all disabled:opacity-50"
                            >
                                {checkoutSuccess ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
                            </button>
                        </div>
                    )}
                </div>

                {/* PROMOTION PERIOD BANNER */}
                <div className="bg-gradient-to-r from-amber-50 to-primary/5 rounded-3xl p-6 border border-amber-200 flex flex-col md:flex-row items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-200">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-lg font-bold text-amber-900">{t('subscription.promo_period_title')}</h3>
                        <p className="text-amber-700/80 text-sm">{t('subscription.promo_period_subtitle')}</p>
                    </div>
                    <div className="bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-amber-200/50">
                        <span className="text-xs font-bold text-amber-800 uppercase tracking-widest">{t('subscription.promo_label') || 'Limited time offer'}</span>
                    </div>
                </div>

                {/* 2. PLAN COMPARISON / UPGRADE GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:items-stretch">
                    {tiers.map((tData) => (
                        <div 
                            key={tData.id}
                            className={cn(
                                "relative flex h-full flex-col bg-white rounded-3xl p-8 shadow-sm border transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                                tData.popular ? "border-amber-400 ring-4 ring-amber-400/10" : "border-slate-200",
                                tier === tData.id && "bg-slate-50 opacity-90 cursor-default grayscale-[0.5]"
                            )}
                        >
                            {tData.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                                    {t('pricing.most_popular') || 'MOST POPULAR'}
                                </div>
                            )}

                            <div className="mb-8 shrink-0">
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                                    tData.id === 'premium' ? "bg-purple-100 text-purple-600" :
                                    tData.id === 'pro' ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"
                                )}>
                                    {tData.icon}
                                </div>
                                 <h3 className="text-xl font-bold text-slate-900">{tData.name}</h3>
                                <div className="mt-2 flex items-baseline flex-wrap gap-2">
                                    {tData.id !== 'free' ? (
                                        <>
                                            <span className={cn(
                                                "text-4xl font-bold",
                                                discountMultiplier < 1 ? "text-primary" : "text-slate-900"
                                            )}>
                                                HK${Math.round((parseInt(tData.price.replace(/[^0-9]/g, '')) || 0) * discountMultiplier)}
                                            </span>
                                            {discountMultiplier < 1 ? (
                                                <span className="text-xl text-slate-400 line-through decoration-primary/50">{tData.price}</span>
                                            ) : (
                                                tData.originalPrice && (
                                                    <span className="text-xl text-slate-400 line-through decoration-slate-300">{tData.originalPrice}</span>
                                                )
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-4xl font-bold text-slate-900">{tData.price}</span>
                                    )}
                                    <span className="ml-1 text-slate-500">{tData.period}</span>
                                </div>
                            </div>

                            <div className="flex min-h-0 flex-1 flex-col">
                                <ul className="mb-6 space-y-4">
                                    {tData.features.map((feature, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-slate-600">
                                            <Check className={cn("w-5 h-5 shrink-0", tier === tData.id ? "text-slate-400" : "text-green-500")} />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-auto w-full shrink-0 pt-2">
                                    {tData.id === 'free' && user && (tier === 'pro' || tier === 'premium') ? (
                                        <div className="w-full py-4 min-h-[3.5rem]" aria-hidden />
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => handleUpgrade(tData.id)}
                                            disabled={profile?.email !== 'fungtam@gmail.com' && (
                                                (tier === tData.id && user)
                                            )}
                                            className={cn(
                                                "w-full py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-95",
                                                (tier === tData.id && user) ? "bg-slate-200 text-slate-500 cursor-default shadow-none" :
                                                tData.id === 'free' ? "border-2 border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer" :
                                                tData.id === 'premium' ? "bg-purple-600 text-white hover:bg-purple-700 shadow-purple-200" :
                                                "bg-amber-400 text-white hover:bg-amber-500 shadow-amber-200"
                                            )}
                                        >
                                            {isSaving ? (
                                                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                            ) : (tier === tData.id && user) ? (
                                                t('subscription.active') || 'Active'
                                            ) : (
                                                tData.id === 'free' ? (t('subscription.start_free_trial') || 'Start free trial') : (t('subscription.select_plan') || 'Select Plan')
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 3. PROMO SECTION — hidden temporarily */}

        </div>
    </div>
);
};

export default SubscriptionPage;
