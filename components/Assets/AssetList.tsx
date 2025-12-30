'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { db } from '@/lib/db';
import type { Asset } from '@/lib/db';
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { getSellingPrice, getAssetTypeName } from '@/lib/api';
import { getCurrentUserId } from '@/lib/auth';

interface AssetListProps {
    refresh?: number;
}

export function AssetList({ refresh }: AssetListProps) {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [prices, setPrices] = useState<Map<string, number>>(new Map());
    const [loading, setLoading] = useState(true);
    const [expandedAssetId, setExpandedAssetId] = useState<number | null>(null);

    useEffect(() => {
        loadAssets();
    }, [refresh]);

    const loadAssets = async () => {
        setLoading(true);
        const userId = getCurrentUserId();
        if (!userId) {
            setAssets([]);
            setLoading(false);
            return;
        }

        const allAssets = await db.assets.where('userId').equals(userId).reverse().toArray();
        setAssets(allAssets);

        // Load current prices
        const priceMap = new Map<string, number>();
        for (const asset of allAssets) {
            if (!priceMap.has(asset.assetType)) {
                const price = await getSellingPrice(asset.assetType);
                priceMap.set(asset.assetType, price);
            }
        }
        setPrices(priceMap);
        setLoading(false);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Bu varlığı silmek istediğinize emin misiniz?')) {
            await db.assets.delete(id);
            loadAssets();
        }
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
        return (
            <Card variant="glass">
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="w-8 h-8 border-2 border-[#F7931A] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[#94A3B8] font-body animate-pulse">Varlıklar yükleniyor...</p>
                </div>
            </Card>
        );
    }

    if (assets.length === 0) {
        return (
            <Card variant="glass">
                <p className="text-center py-12 text-[#94A3B8] font-body">
                    Henüz varlık eklenmemiş
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Desktop View */}
            <div className="hidden md:block">
                <Card className="overflow-hidden p-0" variant="glass">
                    <table className="w-full">
                        <thead className="bg-white/5 border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-mono text-[#94A3B8] uppercase tracking-wider">Varlık</th>
                                <th className="px-6 py-4 text-right text-xs font-mono text-[#94A3B8] uppercase tracking-wider">Miktar</th>
                                <th className="px-6 py-4 text-right text-xs font-mono text-[#94A3B8] uppercase tracking-wider">Alış Fiyatı</th>
                                <th className="px-6 py-4 text-right text-xs font-mono text-[#94A3B8] uppercase tracking-wider">Maliyet</th>
                                <th className="px-6 py-4 text-right text-xs font-mono text-[#94A3B8] uppercase tracking-wider">Güncel</th>
                                <th className="px-6 py-4 text-right text-xs font-mono text-[#94A3B8] uppercase tracking-wider">Kar/Zarar</th>
                                <th className="px-6 py-4 text-right text-xs font-mono text-[#94A3B8] uppercase tracking-wider">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10 text-white">
                            {assets.map((asset) => {
                                let currentPrice = prices.get(asset.assetType) || 0;
                                if (['car', 'home', 'land'].includes(asset.assetType) && currentPrice === 0) {
                                    currentPrice = asset.buyPrice;
                                }
                                const totalCost = asset.quantity * asset.buyPrice;
                                const currentValue = asset.quantity * currentPrice;
                                const profit = currentValue - totalCost;
                                const profitPercent = totalCost > 0 ? (profit / totalCost) * 100 : 0;

                                return (
                                    <tr key={asset.id} className="hover:bg-white/5 transition-colors duration-300">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{getAssetTypeName(asset.assetType)}</span>
                                                <span className="text-[10px] text-[#94A3B8] font-mono lowercase">
                                                    {new Date(asset.date).toLocaleDateString('tr-TR')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-sm">{asset.quantity.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right font-mono text-sm">{formatCurrency(asset.buyPrice)}</td>
                                        <td className="px-6 py-4 text-right font-mono text-sm font-medium">{formatCurrency(totalCost)}</td>
                                        <td className="px-6 py-4 text-right font-mono text-sm font-bold text-[#F7931A]">{formatCurrency(currentValue)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className={`font-mono font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                                                </span>
                                                <span className={`text-[10px] font-mono ${profit >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>
                                                    %{profitPercent.toFixed(2)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleDelete(asset.id!)} className="p-2 hover:bg-red-500/20 text-red-400/60 hover:text-red-400 rounded-lg transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </Card>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-3">
                {assets.map((asset) => {
                    let currentPrice = prices.get(asset.assetType) || 0;
                    if (['car', 'home', 'land'].includes(asset.assetType) && currentPrice === 0) {
                        currentPrice = asset.buyPrice;
                    }
                    const totalCost = asset.quantity * asset.buyPrice;
                    const currentValue = asset.quantity * currentPrice;
                    const profit = currentValue - totalCost;
                    const isExpanded = expandedAssetId === asset.id;

                    return (
                        <Card
                            key={asset.id}
                            variant="glass"
                            className={`transition-all duration-300 ${isExpanded ? 'border-[#F7931A]/50 bg-white/5' : 'hover:border-white/20'}`}
                            onClick={() => setExpandedAssetId(isExpanded ? null : asset.id!)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[#94A3B8] text-[10px] font-mono uppercase tracking-widest mb-1">
                                        {getAssetTypeName(asset.assetType)}
                                    </span>
                                    <span className="text-lg font-bold text-white leading-tight">
                                        {formatCurrency(currentValue)}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className={`text-sm font-mono font-bold block ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {profit >= 0 ? '+' : ''}{((profit / (totalCost || 1)) * 100).toFixed(1)}%
                                    </span>
                                    <span className="text-[10px] text-[#94A3B8] font-mono">
                                        {asset.quantity.toFixed(1)} Birim
                                    </span>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="mt-4 pt-4 border-t border-white/10 space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] text-[#94A3B8] uppercase font-mono">Maliyet</p>
                                            <p className="text-white font-mono text-sm">{formatCurrency(totalCost)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-[#94A3B8] uppercase font-mono text-right">Net Kâr</p>
                                            <p className={`text-right font-mono text-sm font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {formatCurrency(profit)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-[#94A3B8] uppercase font-mono">Alış Tarihi</p>
                                            <p className="text-white font-mono text-xs">{new Date(asset.date).toLocaleDateString('tr-TR')}</p>
                                        </div>
                                        <div className="flex items-end justify-end">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(asset.id!);
                                                }}
                                                className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors border border-red-500/20"
                                            >
                                                <Trash2 size={14} /> Sil
                                            </button>
                                        </div>
                                    </div>
                                    {asset.details && (asset.assetType === 'car' || asset.assetType === 'home' || asset.assetType === 'land') && (
                                        <div className="bg-black/20 p-2 rounded-lg border border-white/5">
                                            <p className="text-[10px] text-[#94A3B8] uppercase font-mono mb-1">Varlık Detayları</p>
                                            <p className="text-xs text-white tracking-wide">
                                                {asset.assetType === 'car' && `${asset.details.brand} ${asset.details.model} (${asset.details.year}) - ${asset.details.km}km`}
                                                {asset.assetType === 'home' && `${asset.details.location}, ${asset.details.roomCount} (${asset.details.m2}m²)`}
                                                {asset.assetType === 'land' && `${asset.details.location} (${asset.details.m2}m²)`}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
