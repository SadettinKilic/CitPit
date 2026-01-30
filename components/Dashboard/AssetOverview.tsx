'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { getAllAssetStats } from '@/lib/calculations';
import { getAssetTypeName, type AssetType } from '@/lib/api';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function AssetOverview() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        const allStats = await getAllAssetStats();
        setStats(allStats);
        setLoading(false);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (loading) {
        return <Card><p className="text-center py-8 text-[#94A3B8]">Yükleniyor...</p></Card>;
    }

    // Include ALL asset types in portfolio
    const assetTypes: AssetType[] = [
        'gold_gram',
        'gold_14karat',  // Added 14 Ayar Altın
        'gold_quarter',
        'gold_half',
        'gold_full',
        'gold_resat',
        'silver_gram',   // Added Gümüş
        'usd',
        'eur',
        'home',          // Added Ev
        'car',           // Added Araba
        'land',          // Added Arsa
    ];

    const activeAssets = assetTypes.filter(type => stats[type]?.totalQuantity > 0);

    if (activeAssets.length === 0) {
        return (
            <Card className="col-span-2">
                <p className="text-center py-8 text-[#94A3B8] font-body">
                    Henüz varlık eklenmemiş
                </p>
            </Card>
        );
    }

    return (
        <>
            {activeAssets.map((assetType) => {
                const data = stats[assetType];
                const isProfit = data.profit >= 0;

                return (
                    <Card key={assetType} variant="glass" className="relative overflow-hidden hover:border-[#F7931A]/30 transition-all duration-300">
                        {/* Background watermark - smaller on mobile */}
                        <div className="absolute top-0 right-0 opacity-[0.03] text-[80px] md:text-[120px] font-bold pointer-events-none">
                            {isProfit ? '📈' : '📉'}
                        </div>

                        <div className="relative z-10 space-y-3 md:space-y-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs md:text-sm text-[#94A3B8] font-body mb-1">
                                        {getAssetTypeName(assetType)}
                                    </p>
                                    <p className="text-2xl md:text-3xl font-mono font-bold text-white">
                                        {data.totalQuantity.toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2 pt-3 md:pt-4 border-t border-white/10">
                                <div className="flex justify-between text-xs md:text-sm">
                                    <span className="text-[#94A3B8] font-body">Maliyet:</span>
                                    <span className="font-mono text-white">{formatCurrency(data.totalCost)}</span>
                                </div>
                                <div className="flex justify-between text-xs md:text-sm">
                                    <span className="text-[#94A3B8] font-body">Güncel Değer:</span>
                                    <span className="font-mono text-[#F7931A] font-semibold">
                                        {formatCurrency(data.currentValue)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                                    <span className="text-[#94A3B8] font-body text-xs md:text-sm">Kar/Zarar:</span>
                                    <div className="flex items-center gap-2">
                                        {isProfit ? (
                                            <TrendingUp size={14} className="text-green-400 md:w-4 md:h-4" />
                                        ) : (
                                            <TrendingDown size={14} className="text-red-400 md:w-4 md:h-4" />
                                        )}
                                        <div className="text-right">
                                            <p className={`font-mono font-bold text-sm md:text-base ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                                                {isProfit ? '+' : ''}{formatCurrency(data.profit)}
                                            </p>
                                            <p className={`text-[10px] md:text-xs font-mono ${isProfit ? 'text-green-400/70' : 'text-red-400/70'}`}>
                                                {data.profitPercentage.toFixed(2)}%
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </>
    );
}
