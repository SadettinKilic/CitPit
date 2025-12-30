'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Card } from '../ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Sector } from 'recharts';
import { getCategoryExpenses } from '@/lib/calculations';

const COLORS = ['#F7931A', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899'];

// Simplified ActiveShape - only handles the slice expansion and outer glow
const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

    return (
        <g>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 8}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + 10}
                outerRadius={outerRadius + 12}
                fill={fill}
                style={{ opacity: 0.3 }}
            />
        </g>
    );
};

export function CategoryPieChart() {
    const [data, setData] = useState<{ category: string; amount: number }[]>([]);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const categories = await getCategoryExpenses();
        // Sort by amount descending for a better visual look and stability
        const sortedData = categories.sort((a, b) => b.amount - a.amount);
        setData(sortedData);
    };

    const activeIndex = useMemo(() =>
        activeCategory ? data.findIndex(d => d.category === activeCategory) : -1
        , [activeCategory, data]);

    const activeData = useMemo(() =>
        activeIndex !== -1 ? data[activeIndex] : null
        , [activeIndex, data]);

    const totalAmount = useMemo(() =>
        data.reduce((sum, item) => sum + item.amount, 0)
        , [data]);

    const onPieEnter = (_: any, index: number) => {
        if (data[index]) {
            setActiveCategory(data[index].category);
        }
    };

    const onPieLeave = () => {
        setActiveCategory(null);
    };

    if (data.length === 0) {
        return (
            <Card className="h-full">
                <h2 className="text-xl font-heading font-semibold mb-6 gradient-text">
                    Kategori Bazlı Harcamalar
                </h2>
                <div className="h-[300px] flex items-center justify-center">
                    <p className="text-[#94A3B8] font-body">Henüz harcama verisi yok</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="flex flex-col h-full min-h-[450px]">
            <div className="mb-4">
                <h2 className="text-xl font-heading font-semibold gradient-text leading-tight">
                    Kategori Bazlı Giderler
                </h2>
                <p className="text-[10px] text-[#94A3B8] font-mono uppercase tracking-[0.2em] mt-1">Aylık Harcama Dağılımı</p>
            </div>

            <div className="flex-1 min-h-[300px] relative">
                {/* Manual Center Display - Independent of Recharts activeShape trigger */}
                {activeData && (
                    <div
                        className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center p-4"
                        style={{ paddingBottom: '10%' }} // Compensate for Legend height at the bottom
                    >
                        <div className="flex flex-col items-center justify-center text-center">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-[#94A3B8] mb-1 line-clamp-1 w-full px-2">
                                {activeData.category}
                            </span>
                            <span className="text-sm font-bold font-mono text-white mb-0.5 leading-none">
                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(activeData.amount)}
                            </span>
                            <span
                                className="text-[10px] font-bold mt-1"
                                style={{ color: COLORS[activeIndex % COLORS.length] }}
                            >
                                %{((activeData.amount / totalAmount) * 100).toFixed(1)}
                            </span>
                        </div>
                    </div>
                )}

                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            // @ts-ignore
                            activeIndex={activeIndex === -1 ? undefined : activeIndex}
                            activeShape={renderActiveShape}
                            data={data}
                            dataKey="amount"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={85}
                            paddingAngle={5}
                            onMouseEnter={onPieEnter}
                            onMouseLeave={onPieLeave}
                            // Also handle click for mobile/touch
                            onClick={onPieEnter}
                            stroke="none"
                            animationDuration={800}
                            animationEasing="ease-out"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    className="outline-none cursor-pointer transition-all duration-300"
                                    style={{
                                        filter: activeIndex === index ? 'drop-shadow(0 0 12px rgba(255, 255, 255, 0.2))' : 'none',
                                    }}
                                />
                            ))}
                        </Pie>
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            content={(props) => {
                                const { payload } = props;
                                return (
                                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-8 px-4">
                                        {payload?.map((entry: any, index: number) => {
                                            const isActive = activeCategory === entry.value;
                                            return (
                                                <div
                                                    key={`legend-${index}`}
                                                    className="flex items-center gap-2 cursor-pointer transition-all duration-300"
                                                    onMouseEnter={() => setActiveCategory(entry.value)}
                                                    onMouseLeave={() => setActiveCategory(null)}
                                                    onClick={() => setActiveCategory(entry.value === activeCategory ? null : entry.value)}
                                                >
                                                    <div
                                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${isActive ? 'scale-125 ring-2 ring-white/10' : ''}`}
                                                        style={{ backgroundColor: entry.color }}
                                                    />
                                                    <span className={`text-[10px] font-medium transition-all duration-300 uppercase tracking-wider ${isActive ? 'text-white font-bold' : 'text-white/40'}`}>
                                                        {entry.value}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
