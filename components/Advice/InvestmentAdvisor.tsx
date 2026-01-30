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
            {/* Trigger Card - Glass on Hover */}
            <div onClick={handleOpen} className="w-full cursor-pointer relative group">
                {/* Background Glow - Pointer events none to prevent click blocking */}
                <div className="absolute inset-0 bg-indigo-500/0 rounded-xl blur-xl group-hover:bg-indigo-500/20 transition-all duration-500 pointer-events-none" />

                <Card className="relative bg-white/[0.02] border-white/[0.05] hover:bg-white/10 hover:backdrop-blur-lg hover:border-white/20 hover:shadow-lg transition-all duration-300 overflow-hidden active:scale-[0.98]">
                    {/* Sliding Shine Effect */}
                    <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none z-0" />

                    {/* Inner sheen effect - Visible on hover */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-transparent to-transparent group-hover:from-white/5 pointer-events-none transition-all duration-500 z-0" />

                    <div className="relative z-10 flex items-center px-4 py-4">
                        {/* Icon */}
                        <div className="shrink-0 mr-4 p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 text-indigo-400 group-hover:text-white group-hover:from-indigo-600/30 group-hover:to-purple-600/30 group-hover:scale-110 transition-all duration-300 border border-white/5 group-hover:border-white/10">
                            <Sparkles size={20} className="md:w-5 md:h-5" />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h3 className="font-heading font-bold text-base text-gray-300 group-hover:text-white transition-colors leading-tight">
                                AI Danışman
                            </h3>
                            <p className="text-xs text-gray-500 group-hover:text-indigo-200 transition-colors leading-tight font-medium mt-0.5">
                                Portföy Analizi
                            </p>
                        </div>

                        {/* Pulse indicator - Positioned to the right, avoiding overlap */}
                        <div className="hidden md:flex gap-1 ml-2 self-start mt-1 opacity-0 group-hover:opacity-80 transition-opacity duration-300 shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
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
