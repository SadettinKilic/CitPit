'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card } from '@/components/ui/Card';
import { getCurrentUser } from '@/lib/auth';

interface LeaderboardEntry {
    rank: number;
    nick: string;
    totalProfit: number;
    lastUpdate: string;
}

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<{ id: number; nick: string } | null>(null);

    useEffect(() => {
        fetchLeaderboard();
        setCurrentUser(getCurrentUser());

        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchLeaderboard, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const response = await fetch('/api/leaderboard/get');
            const data = await response.json();
            setLeaderboard(data.leaderboard || []);
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
        } finally {
            setLoading(false);
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

    const getRankIcon = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return null;
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-4xl font-heading font-bold gradient-text mb-2">
                        Leaderboard
                    </h1>
                    <p className="text-[#94A3B8] font-body">
                        En Başarılı FinFlow Yatırımcıları
                    </p>
                </div>

                {loading ? (
                    <Card>
                        <p className="text-center py-12 text-[#94A3B8] font-body">Yükleniyor...</p>
                    </Card>
                ) : leaderboard.length === 0 ? (
                    <Card>
                        <p className="text-center py-12 text-[#94A3B8] font-body">
                            Henüz liderlik tablosunda kimse yok
                        </p>
                    </Card>
                ) : (
                    <Card className="overflow-hidden p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-black/30">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-mono text-[#94A3B8] uppercase tracking-wider">
                                            Sıra
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-mono text-[#94A3B8] uppercase tracking-wider">
                                            Kullanıcı
                                        </th>
                                        <th className="px-6 py-4 text-right text-sm font-mono text-[#94A3B8] uppercase tracking-wider">
                                            Toplam Kar
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {leaderboard.map((entry) => {
                                        const isCurrentUser = currentUser?.nick === entry.nick;
                                        const rankIcon = getRankIcon(entry.rank);

                                        return (
                                            <tr
                                                key={entry.nick}
                                                className={`transition-colors ${isCurrentUser
                                                    ? 'bg-[#F7931A]/10 border-l-4 border-[#F7931A]'
                                                    : 'hover:bg-white/5'
                                                    }`}
                                            >
                                                <td className="px-6 py-4 text-sm font-mono text-white">
                                                    <div className="flex items-center gap-2">
                                                        {rankIcon && <span className="text-2xl">{rankIcon}</span>}
                                                        <span className="font-bold">#{entry.rank}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-body text-white">
                                                    <div className="flex items-center gap-2">
                                                        <span className={isCurrentUser ? 'font-bold text-[#F7931A]' : ''}>
                                                            {entry.nick}
                                                        </span>
                                                        {isCurrentUser && (
                                                            <span className="px-2 py-1 rounded-full text-xs bg-[#F7931A]/20 text-[#F7931A] border border-[#F7931A]/50">
                                                                SİZ
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className={`px-6 py-4 text-sm font-mono text-right font-bold ${entry.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'
                                                    }`}>
                                                    {entry.totalProfit >= 0 ? '+' : ''}{formatCurrency(entry.totalProfit)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                <p className="text-xs text-[#94A3B8] text-center font-body">
                    Liderlik tablosu her 30 saniyede bir otomatik güncellenir
                </p>
            </div>
        </AppLayout>
    );
}
