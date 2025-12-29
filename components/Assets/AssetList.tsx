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
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    if (loading) {
        return (
            <Card>
                <p className="text-center py-12 text-[#94A3B8] font-body">Yükleniyor...</p>
            </Card>
        );
    }

    if (assets.length === 0) {
        return (
            <Card>
                <p className="text-center py-12 text-[#94A3B8] font-body">
                    Henüz varlık eklenmemiş
                </p>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-black/30">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-mono text-[#94A3B8] uppercase tracking-wider">
                                Varlık
                            </th>
                            <th className="px-6 py-4 text-right text-sm font-mono text-[#94A3B8] uppercase tracking-wider">
                                Miktar
                            </th>
                            <th className="px-6 py-4 text-right text-sm font-mono text-[#94A3B8] uppercase tracking-wider">
                                Alış Fiyatı
                            </th>
                            <th className="px-6 py-4 text-right text-sm font-mono text-[#94A3B8] uppercase tracking-wider">
                                Maliyet
                            </th>
                            <th className="px-6 py-4 text-right text-sm font-mono text-[#94A3B8] uppercase tracking-wider">
                                Güncel Değer
                            </th>
                            <th className="px-6 py-4 text-right text-sm font-mono text-[#94A3B8] uppercase tracking-wider">
                                Kar/Zarar
                            </th>
                            <th className="px-6 py-4 text-right text-sm font-mono text-[#94A3B8] uppercase tracking-wider">
                                İşlem
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {assets.map((asset) => {
                            // For static assets (car, home, land), use buy price as current if API returns 0
                            let currentPrice = prices.get(asset.assetType) || 0;
                            if (['car', 'home', 'land'].includes(asset.assetType) && currentPrice === 0) {
                                currentPrice = asset.buyPrice;
                            }

                            const totalCost = asset.quantity * asset.buyPrice;
                            const currentValue = asset.quantity * currentPrice;
                            const profit = currentValue - totalCost;
                            // Avoid division by zero
                            const profitPercent = totalCost > 0 ? (profit / totalCost) * 100 : 0;

                            return (
                                <tr key={asset.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-body text-white">
                                                {getAssetTypeName(asset.assetType)}
                                            </span>
                                            {asset.details && (
                                                <span className="text-xs text-[#94A3B8] font-mono mt-0.5">
                                                    {asset.assetType === 'car' && `${asset.details.brand} ${asset.details.model} (${asset.details.year})`}
                                                    {(asset.assetType === 'home' || asset.assetType === 'land') && `${asset.details.location} (${asset.details.m2}m²)`}
                                                </span>
                                            )}
                                            <span className="text-xs text-[#94A3B8]/60 font-mono">
                                                {new Date(asset.date).toLocaleDateString('tr-TR')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-mono text-white">
                                        {asset.quantity.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-mono text-white">
                                        {formatCurrency(asset.buyPrice)}
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-mono text-white font-semibold">
                                        {formatCurrency(totalCost)}
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-mono text-[#F7931A] font-semibold">
                                        {formatCurrency(currentValue)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`text-sm font-mono font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                                            </span>
                                            <div className={`flex items-center gap-1 text-xs font-mono ${profit >= 0 ? 'text-green-400/80' : 'text-red-400/80'}`}>
                                                {profit >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                <span>{profitPercent.toFixed(2)}%</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleDelete(asset.id!)}
                                            className="!p-2 hover:bg-red-500/20 hover:text-red-400"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
