import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Camera, CheckCircle2, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { readAndPrepareImageFile } from '../utils/prepareImageForOcr';
import { apiUrl } from '../utils/apiBase';

const MobileCapturePage = () => {
    const { token } = useParams();
    const cameraInputRef = useRef(null);
    const galleryInputRef = useRef(null);
    const [meta, setMeta] = useState(null);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);
    const [remaining, setRemaining] = useState(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!token) {
                setError('Invalid link');
                return;
            }
            try {
                const res = await fetch(apiUrl(`/api/handoff/m/${encodeURIComponent(token)}`));
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    setError(data.error || 'This link has expired or is invalid.');
                    return;
                }
                if (!cancelled) setMeta(data);
            } catch {
                if (!cancelled) setError('Could not reach the server. Check your connection.');
            }
        })();
        return () => { cancelled = true; };
    }, [token]);

    const uploadFile = useCallback(async (file) => {
        if (!file || !token) return;
        setError(null);
        setSubmitting(true);
        try {
            const { base64Data, mimeType } = await readAndPrepareImageFile(file);
            const byteChars = atob(base64Data);
            const byteNumbers = new Array(byteChars.length);
            for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mimeType || 'image/jpeg' });

            const fd = new FormData();
            fd.append('photo', blob, 'capture.jpg');

            const res = await fetch(apiUrl(`/api/handoff/m/${encodeURIComponent(token)}/upload`), {
                method: 'POST',
                body: fd
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.error || data.details || `Upload failed (${res.status})`);
            }
            setDone(true);
            setRemaining(typeof data.uploadsRemaining === 'number' ? data.uploadsRemaining : null);
        } catch (err) {
            setError(err.message || 'Upload failed');
        } finally {
            setSubmitting(false);
        }
    }, [token]);

    const onFileChange = useCallback(async (e) => {
        const file = e.target.files?.[0];
        if (file) await uploadFile(file);
        if (e.target) e.target.value = '';
    }, [uploadFile]);

    const disabled = submitting || !meta;

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.35em] text-orange-400">Ace It</p>
                    <h1 className="text-xl font-black tracking-tight">手機交卷 / Phone upload</h1>
                    {meta?.label && (
                        <p className="text-sm text-slate-400 font-medium leading-snug">{meta.label}</p>
                    )}
                </div>

                {error && (
                    <div className="flex items-start gap-3 rounded-2xl bg-rose-950/80 border border-rose-800/60 p-4 text-rose-100 text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                {done ? (
                    <div className="flex flex-col items-center gap-4 py-10 rounded-3xl bg-slate-900 border border-slate-800">
                        <CheckCircle2 className="w-16 h-16 text-emerald-400" />
                        <p className="text-center font-bold text-slate-200 px-4">已送出！你可以返回電腦繼續。</p>
                        <p className="text-center text-sm text-slate-500 px-4">Sent. You can return to your computer.</p>
                        {remaining !== null && remaining > 0 && (
                            <p className="text-xs text-slate-500">You can submit up to {remaining} more photo(s) from this link.</p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <input
                            ref={cameraInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            disabled={disabled}
                            onChange={onFileChange}
                        />
                        <input
                            ref={galleryInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={disabled}
                            onChange={onFileChange}
                        />

                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() => cameraInputRef.current?.click()}
                            className="w-full rounded-3xl border-2 border-dashed border-slate-600 bg-slate-900/80 py-10 px-6 hover:border-orange-500/80 transition-colors active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex flex-col items-center justify-center gap-3"
                        >
                            {submitting ? (
                                <Loader2 className="w-14 h-14 text-orange-400 animate-spin" />
                            ) : (
                                <Camera className="w-14 h-14 text-orange-400" />
                            )}
                            <span className="text-center font-black text-sm uppercase tracking-widest text-slate-300">
                                拍照
                            </span>
                            <span className="text-center text-xs text-slate-500">Take a photo (camera)</span>
                        </button>

                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() => galleryInputRef.current?.click()}
                            className="w-full rounded-3xl border-2 border-dashed border-slate-600 bg-slate-900/80 py-10 px-6 hover:border-orange-500/80 transition-colors active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex flex-col items-center justify-center gap-3"
                        >
                            {submitting ? (
                                <Loader2 className="w-14 h-14 text-orange-400 animate-spin" />
                            ) : (
                                <ImageIcon className="w-14 h-14 text-orange-400" />
                            )}
                            <span className="text-center font-black text-sm uppercase tracking-widest text-slate-300">
                                從相簿選擇
                            </span>
                            <span className="text-center text-xs text-slate-500">Choose from gallery / files</span>
                        </button>
                    </div>
                )}

                {!meta && !error && (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MobileCapturePage;
