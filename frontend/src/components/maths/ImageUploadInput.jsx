import React, { useState, useRef } from 'react';
import { Camera, X, Loader2, ImageIcon } from 'lucide-react';
import { storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp'];

const ImageUploadInput = ({ questionId, uid, onUpload, onRemove, existingUrl }) => {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(existingUrl || null);
    const [error, setError] = useState(null);
    const [showReview, setShowReview] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);

        // Validate type
        if (!ACCEPTED_TYPES.includes(file.type)) {
            setError('Please upload a JPG, PNG, or HEIC image.');
            return;
        }

        // Validate size
        if (file.size > MAX_FILE_SIZE) {
            setError('Image must be under 10MB.');
            return;
        }

        // Show local preview immediately
        const localUrl = URL.createObjectURL(file);
        setPreviewUrl(localUrl);
        setUploading(true);
        setShowReview(true); // Auto-open review upon capture

        try {
            // --- ROBUST BASE64 TRANSMISSION ---
            // Instead of waiting for a slow Cloud upload, we convert to Base64
            // and send it directly to the grading engine.
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Data = reader.result;
                setPreviewUrl(base64Data);
                onUpload?.(base64Data);
                setUploading(false);
            };
            reader.onerror = () => {
                setError('Failed to process image. Please try again.');
                setUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error('[ImageUpload] Processing failed:', err);
            setError('Failed to process image. Please try again.');
            setPreviewUrl(null);
            setShowReview(false);
            setUploading(false);
        } finally {
            // Note: setUploading(false) is handled in reader callbacks for async flow
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRemove = () => {
        setPreviewUrl(null);
        setError(null);
        setShowReview(false);
        onRemove?.();
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-4">
            {previewUrl ? (
                // Preview Mode
                <div className="relative group">
                    <div className="relative bg-white border-2 border-purple-100 rounded-3xl p-4 flex items-center gap-6 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => setShowReview(true)}>
                        <div className="relative">
                            <img
                                src={previewUrl}
                                alt="Handwritten answer"
                                className="w-20 h-20 object-cover rounded-2xl border-4 border-white shadow-lg rotate-1"
                            />
                            {uploading && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-2xl flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-slate-800 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-purple-500" />
                                Handwriting Captured
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider font-bold">
                                {uploading ? 'Uploading to vault...' : 'Captured & Ready for Grading'}
                            </p>
                            {!uploading && (
                                <div className="mt-2 flex gap-3">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowReview(true); }}
                                        className="text-[10px] font-black text-purple-600 uppercase underline"
                                    >
                                        Review Detail
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); triggerFileSelect(); }}
                                        className="text-[10px] font-black text-slate-400 uppercase underline"
                                    >
                                        Retake
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                // Upload Button
                <label className="flex items-center gap-4 px-6 py-5 bg-white border-2 border-dashed border-slate-200 rounded-3xl cursor-pointer hover:border-purple-400 hover:bg-purple-50/30 transition-all group active:scale-[0.98] shadow-sm">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center group-hover:shadow-md transition-all group-hover:scale-110">
                        <Camera className="w-6 h-6 text-purple-500" />
                    </div>
                    <div className="flex-1 text-left">
                        <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Handwriting Scanner</p>
                        <p className="text-xs text-slate-400 mt-0.5">Capture your handwritten steps for AI Assessment</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <Loader2 className="w-4 h-4 opacity-0 group-hover:opacity-100 animate-pulse" />
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/heic,image/heif,image/webp"
                        capture="environment"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </label>
            )}

            {/* Handwriting Review Modal */}
            {showReview && previewUrl && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => !uploading && setShowReview(false)}></div>
                    <div className="relative max-w-2xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <Camera className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 leading-tight">Review Handwriting</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ensure steps are legible for the AI</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowReview(false)}
                                className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 bg-slate-50 p-6 flex items-center justify-center overflow-auto min-h-[300px]">
                            <img
                                src={previewUrl}
                                alt="Review capture"
                                className="max-w-full max-h-screen object-contain rounded-2xl shadow-xl border-4 border-white"
                            />
                        </div>

                        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center gap-4">
                            <button
                                onClick={triggerFileSelect}
                                className="flex-1 py-4 bg-white border-2 border-slate-200 rounded-2xl text-sm font-black text-slate-700 uppercase tracking-widest hover:border-purple-300 hover:text-purple-600 transition-all active:scale-[0.98]"
                            >
                                Retake Photo
                            </button>
                            <button
                                onClick={handleRemove}
                                className="flex-1 py-4 bg-white border-2 border-red-100 rounded-2xl text-sm font-black text-red-500 uppercase tracking-widest hover:bg-red-50 transition-all active:scale-[0.98]"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setShowReview(false)}
                                className="flex-1 py-4 bg-purple-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 transition-all active:scale-[0.98]"
                            >
                                Confirm Steps
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <p className="text-xs text-red-500 font-black uppercase tracking-widest px-2">{error}</p>
            )}

            {/* Hidden Input for Retake */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/heic,image/heif,image/webp"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
            />
        </div>
    );
};

export default ImageUploadInput;
