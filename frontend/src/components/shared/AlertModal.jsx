import React from 'react';
import { X, WifiOff, CheckCircle2, AlertTriangle } from 'lucide-react';

const AlertModal = ({ isOpen, type = 'info', message, onClose, onRetry }) => {
    if (!isOpen) return null;

    // Determine Icon and Color based on type
    const styles = getAlertStyles(type);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border-2 ${styles.border}`}>
                <div className="p-6 flex flex-col items-center text-center">
                    {/* Icon Bubble */}
                    {styles.icon && (
                        <div className={`mb-4 p-4 rounded-full ${styles.bg}`}>
                            {styles.icon}
                        </div>
                    )}

                    <h3 className={`text-lg font-bold mb-2 ${type === 'network' ? 'text-amber-700' : 'text-gray-900'}`}>
                        {type === 'success' && 'Success!'}
                        {type === 'error' && 'Error'}
                        {type === 'network' && 'Connection Issue'}
                        {type === 'info' && 'Notice'}
                    </h3>

                    <p className="text-gray-600 mb-6 font-medium leading-relaxed">
                        {message}
                    </p>

                    <div className="flex gap-3 w-full">
                        {onRetry && (
                            <button
                                onClick={onRetry}
                                className="flex-1 py-2.5 px-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                            >
                                Retry
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className={`flex-1 py-2.5 px-4 text-white rounded-xl font-bold shadow-lg shadow-gray-200 transition-all active:scale-95 ${styles.btn}`}
                        >
                            {onRetry ? 'Close' : 'OK'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper to define styles (used by both Main component and Icon sub-component)
const getAlertStyles = (type, size = 32) => {
    const styles = {
        success: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            text: 'text-green-800',
            icon: <CheckCircle2 size={size} className="text-green-600" />,
            btn: 'bg-green-600 hover:bg-green-700'
        },
        error: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-800',
            icon: <AlertTriangle size={size} className="text-red-600" />,
            btn: 'bg-red-600 hover:bg-red-700'
        },
        network: {
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            text: 'text-amber-800',
            icon: <WifiOff size={size} className="text-amber-600" />,
            btn: 'bg-amber-600 hover:bg-amber-700'
        },
        info: {
            bg: 'bg-white',
            border: 'border-gray-200',
            text: 'text-gray-800',
            icon: null,
            btn: 'bg-gray-900 hover:bg-black'
        }
    };
    return styles[type] || styles.info;
};

// Static sub-component for usage like <AlertModal.Icon type="error" />
AlertModal.Icon = ({ type, size = 32 }) => {
    const styles = getAlertStyles(type, size);
    return styles.icon;
};

export default AlertModal;
