'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowLeftRight, Coins, TrendingUp, Settings } from 'lucide-react';

const navigationItems = [
    { name: 'Genel Bakış', href: '/', icon: LayoutDashboard },
    { name: 'İşlemler', href: '/transactions', icon: ArrowLeftRight },
    { name: 'Varlıklar', href: '/assets', icon: Coins },
    { name: 'Liderler', href: '/leaderboard', icon: TrendingUp },
    { name: 'Ayarlar', href: '/settings', icon: Settings },
];

export function BottomNavigation() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0F1115]/95 backdrop-blur-lg border-t border-white/10 pb-safe md:hidden">
            <div className="flex items-center justify-around p-1">
                {navigationItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all duration-300 w-full ${isActive
                                ? 'text-[#F7931A]'
                                : 'text-[#94A3B8] hover:text-white'
                                }`}
                        >
                            <div className={`p-1 rounded-lg transition-all ${isActive ? 'bg-[#F7931A]/10 glow-orange' : ''}`}>
                                <Icon size={18} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
                            </div>
                            <span className="text-[9px] font-medium tracking-tight">
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
