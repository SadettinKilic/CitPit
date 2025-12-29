'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface InvestmentAdvisorProps {
    balance: number;
}

export function InvestmentAdvisor({ balance }: InvestmentAdvisorProps) {
    const [advice, setAdvice] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const getAdvice = async () => {
        if (balance <= 0) {
            setAdvice('Yatırım tavsiyesi almak için önce bakiyenizi artırmalısınız.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/advice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    balance,
                    date: new Date().toLocaleDateString('tr-TR'),
                }),
            });

            const data = await response.json();

            if (data.success) {
                setAdvice(data.advice);
            } else {
                setError('Tavsiye alınamadı. API anahtarı eksik olabilir.');
            }
        } catch (err) {
            setError('Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Auto fetch advice if balance is positive and no advice yet
        if (balance > 0 && !advice && !loading) {
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
                size="sm"
                onClick={getAdvice}
                disabled={loading}
                className="mt-3 w-full text-xs text-[#94A3B8] hover:text-white flex items-center justify-center gap-1"
            >
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                Tavsiyeyi Yenile
            </Button>
        </Card>
    );
}
