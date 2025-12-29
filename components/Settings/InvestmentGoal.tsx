'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Target, TrendingUp, Car, Home, Map as MapIcon, DollarSign, Save } from 'lucide-react';
import { calculateTotalAssetValue } from '@/lib/calculations';
import { Toast } from '../ui/Toast';

export type GoalType = 'home' | 'car' | 'land' | 'custom' | 'none';

export interface InvestmentGoalData {
    type: GoalType;
    amount: number;
    description: string;
}

export function InvestmentGoal() {
    const [goalType, setGoalType] = useState<GoalType>('none');
    const [amount, setAmount] = useState<number>(0);
    const [currentNetWorth, setCurrentNetWorth] = useState(0);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        // Load goal from storage
        const savedGoal = localStorage.getItem('finflow_goal');
        if (savedGoal) {
            try {
                const parsed = JSON.parse(savedGoal);
                setGoalType(parsed.type);
                setAmount(parsed.amount);
            } catch (e) { }
        }

        // Load current net worth
        calculateTotalAssetValue().then(setCurrentNetWorth);
    }, []);

    const handleSave = () => {
        const goalData: InvestmentGoalData = {
            type: goalType,
            amount: Number(amount),
            description: getGoalLabel(goalType)
        };
        localStorage.setItem('finflow_goal', JSON.stringify(goalData));
        setShowToast(true);
    };

    const getGoalLabel = (type: GoalType) => {
        switch (type) {
            case 'home': return 'Ev Almak';
            case 'car': return 'Araba Almak';
            case 'land': return 'Arsa Yatırımı';
            case 'custom': return 'Maddi Hedef';
            default: return 'Hedef Seçiniz';
        }
    };

    const progress = amount > 0 ? Math.min((currentNetWorth / amount) * 100, 100) : 0;
    const remaining = Math.max(amount - currentNetWorth, 0);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <Card>
            <div className="flex items-center gap-2 mb-6">
                <Target className="text-[#F7931A]" size={24} />
                <h3 className="text-xl font-heading font-semibold text-white">Yatırım Hedefi</h3>
            </div>

            <div className="space-y-6">
                {/* Goal Selection */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button
                        onClick={() => setGoalType('home')}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${goalType === 'home'
                                ? 'bg-[#F7931A]/20 border-[#F7931A] text-white'
                                : 'bg-white/5 border-white/10 text-[#94A3B8] hover:bg-white/10'
                            }`}
                    >
                        <Home size={24} />
                        <span className="text-sm font-medium">Ev</span>
                    </button>
                    <button
                        onClick={() => setGoalType('car')}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${goalType === 'car'
                                ? 'bg-[#F7931A]/20 border-[#F7931A] text-white'
                                : 'bg-white/5 border-white/10 text-[#94A3B8] hover:bg-white/10'
                            }`}
                    >
                        <Car size={24} />
                        <span className="text-sm font-medium">Araba</span>
                    </button>
                    <button
                        onClick={() => setGoalType('land')}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${goalType === 'land'
                                ? 'bg-[#F7931A]/20 border-[#F7931A] text-white'
                                : 'bg-white/5 border-white/10 text-[#94A3B8] hover:bg-white/10'
                            }`}
                    >
                        <MapIcon size={24} />
                        <span className="text-sm font-medium">Arsa</span>
                    </button>
                    <button
                        onClick={() => setGoalType('custom')}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${goalType === 'custom'
                                ? 'bg-[#F7931A]/20 border-[#F7931A] text-white'
                                : 'bg-white/5 border-white/10 text-[#94A3B8] hover:bg-white/10'
                            }`}
                    >
                        <DollarSign size={24} />
                        <span className="text-sm font-medium">Limit</span>
                    </button>
                </div>

                {/* Amount Input */}
                {goalType !== 'none' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div>
                            <label className="text-sm text-[#94A3B8] mb-2 block">Hedeflenen Tutar (TL)</label>
                            <input
                                type="number"
                                value={amount || ''}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#F7931A] transition-colors font-mono text-lg"
                                placeholder="Örn: 2000000"
                            />
                        </div>

                        {/* Progress Visualization */}
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-[#94A3B8]">İlerleme Durumu</span>
                                <span className="text-white font-mono font-bold">{progress.toFixed(1)}%</span>
                            </div>
                            <div className="h-4 bg-black/40 rounded-full overflow-hidden mb-2">
                                <div
                                    className="h-full bg-gradient-to-r from-[#EA580C] to-[#F7931A] transition-all duration-1000 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs font-mono">
                                <span className="text-green-400">Mevcut: {formatCurrency(currentNetWorth)}</span>
                                <span className="text-[#94A3B8]">Kalan: {formatCurrency(remaining)}</span>
                            </div>
                        </div>

                        <Button onClick={handleSave} className="w-full flex items-center justify-center gap-2">
                            <Save size={18} />
                            Hedefi Kaydet
                        </Button>
                    </div>
                )}
            </div>

            <Toast
                message="Yatırım hedefiniz kaydedildi"
                isVisible={showToast}
                onClose={() => setShowToast(false)}
                type="success"
            />
        </Card>
    );
}
