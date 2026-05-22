import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Loader2, Smartphone, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchWithAuth } from '../../utils/apiAuth';
import { apiUrl } from '../../utils/apiBase';
import { getPublicAppOrigin } from '../../utils/publicAppOrigin';

/**
 * Desktop panel: creates handoff session, shows QR, listens via SSE for mobile uploads.
 * @param {object} props
 * @param {'chat_essay_ocr'|'chat_tutor_image'|'writing_mock'|'writing_quest'} props.surface
 * @param {object} [props.meta] — e.g. { part: 'A' } for writing mock
 * @param {(msg: { surface: string, payload: object }) => void} props.onPhotoReceived
 * @param {(err: string) => void} [props.onError]
 */
export default function QrHandoffPanel({ surface, meta = {}, onPhotoReceived, onError, className = '' }) {
    const { user } = useAuth();
    const [phase, setPhase] = useState('loading');
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [expiresAt, setExpiresAt] = useState(null);
    const [, setTick] = useState(0);
    const [errorDetail, setErrorDetail] = useState('');
    /** Increment to tear down SSE and request a new handoff session + QR */
    const [refreshNonce, setRefreshNonce] = useState(0);
    const esRef = useRef(null);
    const onPhotoRef = useRef(onPhotoReceived);
    const onErrorRef = useRef(onError);

    useEffect(() => {
        onPhotoRef.current = onPhotoReceived;
    }, [onPhotoReceived]);
    useEffect(() => {
        onErrorRef.current = onError;
    }, [onError]);

    const metaKey = JSON.stringify(meta ?? {});

    useEffect(() => {
        let cancelled = false;
        if (!user) {
            setPhase('error');
            const msg = 'Sign in to use phone upload.';
            setErrorDetail(msg);
            onErrorRef.current?.(msg);
            return () => {};
        }

        (async () => {
            setPhase('loading');
            setQrDataUrl('');
            setErrorDetail('');
            try {
                const res = await fetchWithAuth(user, apiUrl('/api/handoff/sessions'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ surface, meta: JSON.parse(metaKey), uid: user?.uid })
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data.error || 'Could not start phone handoff');
                if (cancelled) return;

                const origin = getPublicAppOrigin();
                if (!origin) {
                    throw new Error(
                        'Set VITE_PUBLIC_APP_ORIGIN to this page’s address (e.g. http://YOUR_LAN_IP:3005) so your phone can open the link.'
                    );
                }
                const mobileUrl = `${origin}/m/capture/${encodeURIComponent(data.mobileToken)}`;
                const dataUrl = await QRCode.toDataURL(mobileUrl, { margin: 2, width: 220, color: { dark: '#0f172a', light: '#ffffff' } });
                if (cancelled) return;
                setQrDataUrl(dataUrl);
                setExpiresAt(data.expiresAt || null);

                const sseUrl = apiUrl(`/api/handoff/sessions/${encodeURIComponent(data.sessionId)}/stream?ticket=${encodeURIComponent(data.streamTicket)}`);
                const es = new EventSource(sseUrl);
                esRef.current = es;

                es.addEventListener('uploaded', (ev) => {
                    try {
                        const msg = JSON.parse(ev.data);
                        onPhotoRef.current?.(msg);
                    } catch (e) {
                        console.warn('[QrHandoffPanel] uploaded parse:', e);
                    }
                });

                es.addEventListener('expired', () => {
                    setExpiresAt(Date.now() - 1);
                    onErrorRef.current?.('This QR session has expired. Tap Refresh for a new code.');
                });

                es.onerror = () => {
                    /* browser will retry; avoid noisy toasts */
                };

                setPhase('ready');
            } catch (e) {
                if (cancelled) return;
                setPhase('error');
                const raw = e?.message || String(e);
                let hint = raw;
                if (raw === 'Failed to fetch' || raw.includes('NetworkError')) {
                    hint = `${raw} — Is the backend running on port 3001? If you opened the app via a LAN IP, leave VITE_API_URL empty in dev so /api uses the Vite proxy.`;
                }
                setErrorDetail(hint);
                onErrorRef.current?.(hint);
            }
        })();

        const tick = setInterval(() => setTick((t) => t + 1), 1000);

        return () => {
            cancelled = true;
            clearInterval(tick);
            if (esRef.current) {
                esRef.current.close();
                esRef.current = null;
            }
        };
    }, [user?.uid, surface, metaKey, refreshNonce]); // eslint-disable-line react-hooks/exhaustive-deps -- recreate session when identity/surface/refresh

    const secondsLeft = expiresAt ? Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)) : null;
    const isExpired = phase === 'ready' && secondsLeft !== null && secondsLeft === 0;

    const requestNewSession = () => {
        setErrorDetail('');
        setExpiresAt(null);
        setRefreshNonce((n) => n + 1);
    };

    return (
        <div className={`rounded-2xl border border-slate-200 bg-slate-50/80 p-4 ${className}`}>
            <div className="flex items-start gap-3">
                <div className="shrink-0 p-2 rounded-xl bg-white border border-slate-200 text-orange-600">
                    <Smartphone className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-700">Phone upload</p>
                    <p className="text-[11px] text-slate-500 leading-snug font-medium">
                        用手機掃描二維碼拍照，電腦會自動收到。Scan with your phone — your computer updates instantly.
                    </p>
                    {secondsLeft !== null && phase === 'ready' && (
                        <div className="flex flex-wrap items-center gap-2">
                            <p
                                className={`text-[10px] font-bold uppercase tracking-wider ${isExpired ? 'text-amber-600' : 'text-slate-400'}`}
                            >
                                Expires in {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
                            </p>
                            {isExpired && (
                                <button
                                    type="button"
                                    onClick={requestNewSession}
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-700 shadow-sm hover:bg-slate-50"
                                >
                                    <RefreshCw className="size-3" aria-hidden />
                                    Refresh
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-4 flex justify-center">
                {phase === 'loading' && (
                    <div className="flex flex-col items-center gap-2 py-6 text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="text-xs font-bold">Preparing QR…</span>
                    </div>
                )}
                {phase === 'error' && (
                    <div className="text-center py-4 px-2 space-y-3 max-w-md mx-auto">
                        <p className="text-xs text-rose-600 font-semibold">Could not load QR. Use file upload below or sign in.</p>
                        {errorDetail ? (
                            <p className="text-[11px] text-rose-700/90 font-medium leading-snug break-words">{errorDetail}</p>
                        ) : null}
                        {user ? (
                            <button
                                type="button"
                                onClick={requestNewSession}
                                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-wider text-rose-700 hover:bg-rose-50"
                            >
                                <RefreshCw className="size-3.5" aria-hidden />
                                Try again
                            </button>
                        ) : null}
                    </div>
                )}
                {phase === 'ready' && qrDataUrl && (
                    <div className="relative inline-block">
                        <img
                            src={qrDataUrl}
                            alt="QR code to open phone upload"
                            className={`rounded-xl border border-white shadow-md w-[220px] h-[220px] ${isExpired ? 'opacity-40' : ''}`}
                        />
                        {isExpired && (
                            <div className="absolute inset-0 flex items-center justify-center p-2">
                                <button
                                    type="button"
                                    onClick={requestNewSession}
                                    className="flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-800 shadow-lg border border-slate-200"
                                >
                                    <RefreshCw className="size-4 text-orange-500" aria-hidden />
                                    Refresh
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
