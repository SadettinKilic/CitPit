import React from 'react';
import { Card } from '../ui/Card';
import { LucideIcon } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';
import { CountUp } from '../ui/CountUp';

interface StatCardProps {
    title: string;
    value: number; // Changed to number for CountUp
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    loading?: boolean;
    prefix?: string;
}

export function StatCard({ title, value, icon: Icon, trend, trendUp, loading, prefix = '' }: StatCardProps) {
    return (
        <Card className="relative overflow-hidden">
            {/* Background Icon Watermark */}
            <div className="absolute top-4 right-4 opacity-10">
                <Icon size={80} className="text-[#F7931A]" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-[#EA580C]/20 border border-[#EA580C]/50 flex items-center justify-center glow-orange">
                        <Icon size={24} className="text-[#F7931A]" />
                    </div>
                    <h3 className="text-sm font-body text-[#94A3B8] uppercase tracking-wider">
                        {title}
                    </h3>
                </div>

                <div className="mb-2 min-h-[36px]">
                    {loading ? (
                        <Skeleton className="h-9 w-32" />
                    ) : (
                        <p className="text-3xl font-mono font-bold text-white">
                            <CountUp end={value} prefix={prefix} />
                        </p>
                    )}
                </div>

                {loading ? (
                    <Skeleton className="h-4 w-20 mt-1" />
                ) : trend && (
                    <p className={`text-sm font-body ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
                        {trendUp ? '↑' : '↓'} {trend}
                    </p>
                )}
            </div>
        </Card>
    );
}
