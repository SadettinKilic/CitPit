'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { PINScreen } from './PINScreen';
import { fetchPrices } from '@/lib/api';

export function AppLayout({ children }: { children: React.ReactNode }) {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is already unlocked in this session
        const sessionUnlocked = sessionStorage.getItem('finflow_unlocked');
        if (sessionUnlocked === 'true') {
            setIsUnlocked(true);
            // Fetch prices in background
            fetchPrices();
        }
        setIsLoading(false);
    }, []);

    const handleUnlock = () => {
        setIsUnlocked(true);
        // Store unlock state in sessionStorage (cleared when browser tab closes)
        sessionStorage.setItem('finflow_unlocked', 'true');
        // Fetch prices immediately on unlock
        // Fetch prices immediately on unlock
        fetchPrices();
        // Dispatch unlock event for other components to reload data
        window.dispatchEvent(new Event('finflow_unlock'));
    };

    if (isLoading) {
        // Show nothing or a minimal loader while checking session
        return null;
    }

    if (!isUnlocked) {
        return <PINScreen onUnlock={handleUnlock} />;
    }

    return (
        <div className="flex min-h-screen bg-[#030304]">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    );
}
