import React, { useState, useRef } from 'react';
import { Camera, X, Loader2, ImageIcon } from 'lucide-react';
import { storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp'];

const ImageUploadInput = ({ questionId, uid, onUpload, onRemove, existingUrl }) => {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(existingUrl || null);
    const [error, setError] = useState(null);
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
            setError('Image must be under 5MB.');
            return;
        }

        // Show local preview immediately
        const localUrl = URL.createObjectURL(file);
        setPreviewUrl(localUrl);
        setUploading(true);

        try {
            const timestamp = Date.now();
            const ext = file.name.split('.').pop() || 'jpg';
            const storagePath = `answers/${uid || 'anonymous'}/${questionId}_${timestamp}.${ext}`;
            const storageRef = ref(storage, storagePath);

            await uploadBytes(storageRef, file);
            const downloadUrl = await getDownloadURL(storageRef);

            setPreviewUrl(downloadUrl);
            onUpload?.(downloadUrl);
        } catch (err) {
            console.error('[ImageUpload] Upload failed:', err);
            setError('Upload failed. Please try again.');
            setPreviewUrl(null);
        } finally {
            setUploading(false);
            // Reset file input
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRemove = () => {
        setPreviewUrl(null);
        setError(null);
        onRemove?.();
    };

    return (
        <div className="space-y-3">
            {previewUrl ? (
                // Preview Mode
                <div className="relative group">
                    <div className="relative bg-slate-50 border-2 border-dashed border-purple-200 rounded-2xl p-3 flex items-center gap-4">
                        <img
                            src={previewUrl}
                            alt="Handwritten answer"
                            className="w-24 h-24 object-cover rounded-xl border border-slate-200 shadow-sm"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-purple-500" />
                                Handwritten Steps Uploaded
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                Your handwriting will be read by the AI examiner
                            </p>
                            {uploading && (
                                <div className="flex items-center gap-2 mt-2 text-purple-600">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    <span className="text-xs font-medium">Uploading...</span>
                                </div>
                            )}
                        </div>
                        {!uploading && (
                            <button
                                onClick={handleRemove}
                                className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all hover:scale-110"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                // Upload Button
                <label className="flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-dashed border-purple-200 rounded-2xl cursor-pointer hover:border-purple-400 hover:from-purple-100 hover:to-indigo-100 transition-all group active:scale-[0.98]">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:shadow-md transition-all">
                        <Camera className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-slate-700">Upload Handwritten Steps</p>
                        <p className="text-[11px] text-slate-400">Take a photo or upload an image (JPG, PNG • Max 5MB)</p>
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

            {error && (
                <p className="text-xs text-red-500 font-medium px-2">{error}</p>
            )}
        </div>
    );
};

export default ImageUploadInput;
