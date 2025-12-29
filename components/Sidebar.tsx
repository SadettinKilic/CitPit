'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowLeftRight, Coins, Settings, TrendingUp, LogOut, User } from 'lucide-react';
import { getCurrentUser, logoutUser } from '@/lib/auth';
import { InvestmentAdvisor } from './Advice/InvestmentAdvisor';

const navigationItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'İşlemler', href: '/transactions', icon: ArrowLeftRight },
    { name: 'Varlıklar', href: '/assets', icon: Coins },
    { name: 'Leaderboard', href: '/leaderboard', icon: TrendingUp },
    { name: 'Ayarlar', href: '/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const [currentUser, setCurrentUser] = useState<{ nick: string } | null>(null);
    const [totalBalance, setTotalBalance] = useState(0);

    useEffect(() => {
        setCurrentUser(getCurrentUser());
        loadBalance();

        // Refresh balance periodically for the advisor
        const interval = setInterval(loadBalance, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadBalance = async () => {
        const { calculateBalance } = await import('@/lib/calculations');
        const bal = await calculateBalance();
        setTotalBalance(bal);
    };

    const handleLogout = () => {
        if (confirm('Çıkış kilitlenecek. Devam etmek istiyor musunuz?')) {
            logoutUser();
        }
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0F1115] border-r border-white/10 p-6 hidden md:flex flex-col z-50">
            {/* Logo */}
            <div className="mb-8">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#EA580C] to-[#F7931A] flex items-center justify-center glow-orange">
                        <TrendingUp size={24} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-heading font-bold gradient-text">
                        FinFlow
                    </h1>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
                {navigationItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-mono text-sm tracking-wider transition-all duration-300 ${isActive
                                ? 'bg-gradient-to-r from-[#EA580C]/20 to-[#F7931A]/20 text-[#F7931A] border border-[#F7931A]/50 glow-orange'
                                : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Icon size={20} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Advisor */}
            <div className="space-y-4 pt-4 border-t border-white/10">
                <InvestmentAdvisor balance={totalBalance} />

                {currentUser && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5/50">
                        <div className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center text-[#F7931A]">
                            <User size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{currentUser.nick}</p>
                            <p className="text-xs text-[#94A3B8]">Aktif Oturum</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-[#94A3B8] hover:text-white"
                            title="Çıkış Yap"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                )}

                <p className="text-xs text-[#94A3B8] font-mono text-center">
                    FinFlow v2.0
                </p>
            </div>
        </aside>
    );
}
