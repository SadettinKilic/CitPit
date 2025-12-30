'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { RefreshCw } from 'lucide-react';
import { getPrices, fetchPrices, getAssetTypeName, type AssetType, type AllPrices } from '@/lib/api';
import { Toast } from '../ui/Toast';

export function APIStatus() {
    const [prices, setPrices] = useState<AllPrices | null>(null);
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const loadPrices = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        const data = await getPrices();

        // Check if we have data and if it was just fetched via manual refresh, use current time
        // Otherwise use the data's update time
        if (data) {
            setPrices(data);
        }

        if (!silent) setLoading(false);
    }, []);

    // Initial load and auto-refresh interval
    useEffect(() => {
        loadPrices();

        const intervalId = setInterval(async () => {
            await fetchPrices(); // Force fetch new data in background
            const newData = await getPrices();
            if (newData) setPrices(newData);
        }, 60000); // 60 seconds

        return () => clearInterval(intervalId);
    }, [loadPrices]);

    const handleRefresh = async () => {
        setLoading(true);
        try {
            await fetchPrices(); // Force fetch
            const newData = await getPrices(); // Get the fresh data from cache
            if (newData) {
                setPrices(newData);
            }
            setToastMessage('Fiyatlar başarıyla güncellendi');
            setShowToast(true);
        } catch (error) {
            setToastMessage('Güncelleme başarısız oldu');
            setShowToast(true);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const assetTypes: AssetType[] = [
        'gold_gram',
        'gold_quarter',
        'gold_half',
        'gold_full',
        'gold_resat',
        'silver_gram',
        'usd',
        'eur',
    ];

    return (
        <>
            <Card>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-heading font-semibold text-white mb-1">
                                Canlı Piyasa Verileri
                            </h3>
                            <div className="flex items-center gap-2">
                                {prices && (
                                    <p className="text-xs text-[#94A3B8] font-mono">
                                        Son Güncelleme: {new Date(prices.lastUpdate).toLocaleTimeString('tr-TR')}
                                    </p>
                                )}
                                {loading && (
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F7931A] opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F7931A]"></span>
                                    </span>
                                )}
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={handleRefresh}
                            disabled={loading}
                            className="!p-2 relative group"
                        >
                            <RefreshCw size={18} className={`transition-all ${loading ? 'animate-spin text-[#F7931A]' : 'group-hover:text-[#F7931A]'}`} />
                        </Button>
                    </div>

                    {!prices ? (
                        loading ? (
                            <p className="text-center py-8 text-[#94A3B8] font-body">Veriler yükleniyor...</p>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-red-400 mb-2">Veri alınamadı</p>
                                <Button onClick={handleRefresh} variant="outline">Tekrar Dene</Button>
                            </div>
                        )
                    ) : (
                        <div className="space-y-2">
                            {assetTypes.map((type) => {
                                const data = prices[type];
                                const isPositive = data.change >= 0;

                                return (
                                    <div
                                        key={type}
                                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
                                    >
                                        <div className="flex-1">
                                            <p className="text-sm font-body text-white">{getAssetTypeName(type)}</p>
                                            <p className="text-xs text-[#94A3B8] font-mono">{data.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-mono font-bold text-[#F7931A]">
                                                {formatCurrency(data.buying)}
                                            </p>
                                            <div className={`flex items-center justify-end gap-1 text-xs font-mono ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                                <span>{isPositive ? '+' : ''}{data.change.toFixed(2)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </Card>

            <Toast
                message={toastMessage}
                isVisible={showToast}
                onClose={() => setShowToast(false)}
                type={toastMessage.includes('başarısız') ? 'error' : 'success'}
            />
        </>
    );
}
