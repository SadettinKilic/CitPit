import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { getPrices } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';

interface InvestmentAdvisorProps {
    balance: number;
}

export function InvestmentAdvisor({ balance }: InvestmentAdvisorProps) {
    const [advice, setAdvice] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Initial load
    useEffect(() => {
        const cached = sessionStorage.getItem('finflow_advice');
        if (cached) {
            setAdvice(cached);
        }
    }, []);

    const getAdvice = async (forceRefresh = false) => {
        setLoading(true);
        setError(null);
        try {
            const prices = await getPrices();
            const res = await fetch('/api/advice', {
                method: 'POST',
                body: JSON.stringify({
                    balance,
                    goal: localStorage.getItem('finflow_goal') || 'balanced',
                    prices // Send real-time prices to AI
                }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (!res.ok) {
                if (res.status === 429) throw new Error('Çok fazla istek, lütfen bekleyin');
                throw new Error('Tavsiye alınamadı');
            }

            const data = await res.json();
            setAdvice(data.advice);
            sessionStorage.setItem('finflow_advice', data.advice);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = () => {
        setIsModalOpen(true);
        if (!advice && !loading) {
            getAdvice();
        }
    };

    return (
        <>
            {/* Trigger Card */}
            <div onClick={handleOpen} className="cursor-pointer group">
                <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300">
                    <div className="flex items-center gap-4 p-4">
                        <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h3 className="font-heading font-semibold text-white group-hover:text-indigo-300 transition-colors">
                                Yapay Zeka Tavsiyesi
                            </h3>
                            <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                Portföyünüz için akıllı öneriler almak için tıklayın
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Detailed Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Yapay Zeka Yatırım Danışmanı"
            >
                <div className="space-y-6">
                    {error ? (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400">
                            <AlertCircle size={20} />
                            <p>{error}</p>
                        </div>
                    ) : null}

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse" />
                                <Sparkles className="relative z-10 text-indigo-400 animate-spin-slow" size={48} />
                            </div>
                            <p className="text-gray-400 animate-pulse">Piyasa verileri analiz ediliyor...</p>
                        </div>
                    ) : (
                        <div className="prose prose-invert max-w-none">
                            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-inner">
                                <div className="flex items-start gap-4">
                                    <Sparkles className="text-indigo-400 shrink-0 mt-1" size={20} />
                                    <p className="text-lg leading-relaxed text-gray-200 whitespace-pre-wrap">
                                        {advice || 'Tavsiye oluşturuluyor...'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-4 border-t border-white/10">
                        <Button
                            onClick={() => getAdvice(true)}
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 px-6"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                            {loading ? 'Analiz Ediliyor' : 'Yeniden Analiz Et'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
