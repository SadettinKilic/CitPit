'use client';

import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

export function Toast({
    message,
    type = 'success',
    isVisible,
    onClose,
    duration = 3000
}: ToastProps) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!isVisible) return null;

    const bgColors = {
        success: 'bg-green-500/10 border-green-500/20 text-green-400',
        error: 'bg-red-500/10 border-red-500/20 text-red-400',
        info: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    };

    const icons = {
        success: <CheckCircle size={18} />,
        error: <XCircle size={18} />,
        info: <Info size={18} />,
    };

    return (
        <div className={`fixed bottom-4 right-4 md:bottom-8 md:right-8 left-4 md:left-auto z-[9999] flex items-center gap-3 px-4 py-3 md:py-3.5 rounded-xl border backdrop-blur-md shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300 ${bgColors[type]}`}>
            {icons[type]}
            <span className="text-sm md:text-base font-medium pr-1">{message}</span>
        </div>
    );
}
