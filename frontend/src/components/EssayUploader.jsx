import React, { useState } from 'react';
import { Upload, Check, Edit3, X, Loader2 } from 'lucide-react';
import { readAndPrepareImageFile } from '../utils/prepareImageForOcr';

const EssayUploader = ({ onConfirm, onCancel }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [transcription, setTranscription] = useState('');
    const [status, setStatus] = useState('IDLE'); // IDLE, UPLOADING, VERIFYING
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected && selected.type.startsWith('image/')) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setStatus('UPLOADING');
        setError(null);

        try {
            const { base64Data, mimeType } = await readAndPrepareImageFile(file);
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

            const response = await fetch(`${API_URL}/api/ocr`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: { data: base64Data, mimeType }
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.details || errorData.error || `Upload failed (${response.status})`
                );
            }
            const data = await response.json();
            setTranscription(data.transcription);
            setStatus('VERIFYING');
        } catch (err) {
            console.error(err);
            setError("Failed to process image. Please try again.");
            setStatus('IDLE');
        }
    };

    const handleFinalConfirm = () => {
        onConfirm(transcription);
        setFile(null);
        setPreview(null);
        setTranscription('');
        setStatus('IDLE');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#1a110a] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-black/5 dark:border-white/10 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-[#1d130c] dark:text-white flex items-center gap-2">
                        <Upload className="w-5 h-5 text-primary" />
                        Analysis: Verify-Then-Grade
                    </h3>
                    <button onClick={onCancel} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-8">
                    {status === 'IDLE' && (
                        <div className="flex flex-col items-center gap-6">
                            <div
                                className="w-full h-64 border-2 border-dashed border-primary/20 rounded-2xl flex flex-col items-center justify-center gap-4 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer relative overflow-hidden"
                                onClick={() => document.getElementById('essay-upload-input').click()}
                            >
                                {preview ? (
                                    <img src={preview} className="w-full h-full object-contain p-4" alt="Preview" />
                                ) : (
                                    <>
                                        <div className="p-4 bg-white rounded-full shadow-sm">
                                            <Upload className="w-8 h-8 text-primary" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-500">
                                            Click to upload a photo of your handwriting
                                        </p>
                                    </>
                                )}
                                <input
                                    id="essay-upload-input"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>

                            {error && <p className="text-red-500 text-sm">{error}</p>}

                            <button
                                onClick={handleUpload}
                                disabled={!file}
                                className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 disabled:opacity-50 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                Start Transcription
                            </button>
                        </div>
                    )}

                    {status === 'UPLOADING' && (
                        <div className="flex flex-col items-center justify-center py-12 gap-6 relative overflow-hidden">
                            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan" style={{ top: '20%' }} />
                            <div className="relative">
                                <div className="size-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                <Loader2 className="size-10 text-primary absolute inset-0 m-auto animate-pulse" />
                            </div>
                            <div className="text-center z-10">
                                <h4 className="text-lg font-bold text-[#1d130c] dark:text-white">Analyzing Handwriting...</h4>
                                <p className="text-sm text-gray-500 mt-1">Our AI is converting your ink into digital text.</p>
                            </div>
                        </div>
                    )}

                    {status === 'VERIFYING' && (
                        <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4">
                            <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-200 dark:border-yellow-900/30 flex gap-3">
                                <Edit3 className="w-5 h-5 text-yellow-600 shrink-0" />
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    AI might make mistakes in OCR. Please review and fix any typos before we send it for grading.
                                </p>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Transcription</label>
                                <textarea
                                    value={transcription}
                                    onChange={(e) => setTranscription(e.target.value)}
                                    className="w-full h-48 p-4 bg-white dark:bg-[#120b06] border border-black/10 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all overflow-y-auto"
                                    placeholder="Transcription results..."
                                />
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button
                                    onClick={() => setStatus('IDLE')}
                                    className="flex-1 py-4 border border-black/10 rounded-2xl font-bold text-gray-600 hover:bg-black/5 transition-colors"
                                >
                                    Re-upload
                                </button>
                                <button
                                    onClick={handleFinalConfirm}
                                    className="flex-[2] py-4 bg-green-500 text-white rounded-2xl font-bold shadow-lg shadow-green-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <Check className="w-5 h-5" />
                                    Confirm & Grade
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EssayUploader;