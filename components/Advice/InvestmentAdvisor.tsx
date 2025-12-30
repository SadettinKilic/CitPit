import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { getPrices } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
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
            const user = getCurrentUser();
            const now = new Date();
            const turkishMonths = [
                'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
                'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
            ];
            const formattedDate = `${turkishMonths[now.getMonth()]} ${now.getFullYear()}`;

            const storedGoal = localStorage.getItem('finflow_goal');
            let goalDescription = 'varlıklarını artırma';
            if (storedGoal) {
                try {
                    const goalObj = JSON.parse(storedGoal);
                    if (goalObj.description) goalDescription = goalObj.description;
                } catch (e) { }
            }

            const res = await fetch('/api/advice', {
                method: 'POST',
                body: JSON.stringify({
                    balance,
                    goal: goalDescription,
                    prices, // Send real-time prices to AI
                    nick: user?.nick || 'FinFlow Kullanıcısı',
                    date: formattedDate
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
            <div onClick={handleOpen} className="w-full cursor-pointer group relative">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-indigo-500/10 rounded-xl blur-2xl group-hover:bg-indigo-500/20 transition-all duration-500" />

                <Card className="relative bg-white/[0.03] backdrop-blur-md border-white/10 hover:border-indigo-500/40 transition-all duration-500 overflow-hidden shadow-2xl active:scale-95 group">
                    {/* Animated background glow */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl opacity-50" />

                    <div className="relative z-10 flex items-center gap-4 p-4 md:p-5">
                        <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 text-indigo-400 group-hover:scale-110 group-hover:from-indigo-600/30 group-hover:to-purple-600/30 transition-all duration-500 shadow-xl shadow-indigo-500/10 border border-white/5 group-hover:border-indigo-500/30">
                            <Sparkles size={26} className="group-hover:animate-pulse-slow" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-heading font-bold text-base md:text-lg text-white group-hover:text-indigo-200 transition-colors leading-tight tracking-tight">
                                    AI Danışman
                                </h3>
                                <div className="flex gap-1.5 opacity-80">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                            <p className="text-[10px] md:text-xs text-indigo-400/70 group-hover:text-indigo-300 transition-colors leading-tight font-mono uppercase tracking-[0.15em] font-medium">
                                Akıllı Portföy Analizi
                            </p>
                        </div>
                    </div>

                    {/* Subtle Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
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
                            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-inner backdrop-blur-sm">
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
                            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 px-6 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
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
