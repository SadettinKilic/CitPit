'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { getPrices } from '@/lib/api';

interface InvestmentAdvisorProps {
    balance: number;
}

export function InvestmentAdvisor({ balance }: InvestmentAdvisorProps) {
    const [advice, setAdvice] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const getAdvice = async (forceRefresh = false) => {
        if (balance <= 0) {
            setAdvice('Yatırım tavsiyesi almak için önce bakiyenizi artırmalısınız.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            import { getPrices } from '@/lib/api';

            // ... (in getAdvice function)
            try {
                // Get goal data
                const savedGoal = localStorage.getItem('finflow_goal');
                const goal = savedGoal ? JSON.parse(savedGoal) : null;

                // Get current market prices
                const prices = await getPrices();

                const response = await fetch('/api/advice', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        balance,
                        goal,
                        prices, // Send real-time prices
                        date: new Date().toLocaleDateString('tr-TR'),
                    }),
                });

                const data = await response.json();

                if (data.success) {
                    setAdvice(data.advice);
                    sessionStorage.setItem('finflow_advice', data.advice);
                } else {
                    setError(data.error || 'Tavsiye alınamadı. API anahtarı eksik olabilir.');
                }
            } catch (err) {
                setError('Bir hata oluştu.');
            } finally {
                setLoading(false);
            }
        };

        useEffect(() => {
            const cachedAdvice = sessionStorage.getItem('finflow_advice');
            if (cachedAdvice) {
                setAdvice(cachedAdvice);
            } else if (balance > 0 && !loading && !advice) {
                getAdvice();
            }
        }, [balance]);

        return (
            <Card className="mt-6 bg-gradient-to-br from-[#0F1115] to-[#1a1a1a] border-[#F7931A]/20">
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={18} className="text-[#F7931A]" />
                    <h3 className="text-sm font-heading font-bold text-white">Yatırım Asistanı</h3>
                </div>

                <div className="min-h-[80px]">
                    {loading ? (
                        <div className="flex items-center justify-center py-4">
                            <span className="flex h-3 w-3 relative mr-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F7931A] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#F7931A]"></span>
                            </span>
                            <span className="text-xs text-[#94A3B8] animate-pulse">Analiz ediliyor...</span>
                        </div>
                    ) : error ? (
                        <div className="text-red-400 text-xs">{error}</div>
                    ) : (
                        <p className="text-xs text-gray-300 leading-relaxed font-body">
                            {advice || 'Bakiye bilgisi bekleniyor...'}
                        </p>
                    )}
                </div>

                <Button
                    variant="ghost"

                    onClick={() => getAdvice(true)}
                    disabled={loading}
                    className="mt-3 w-full text-xs text-[#94A3B8] hover:text-white flex items-center justify-center gap-1"
                >
                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                    Tavsiyeyi Yenile
                </Button>
            </Card>
        );
    }
