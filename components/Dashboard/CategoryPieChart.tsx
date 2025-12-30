'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, Sector } from 'recharts';
import { getCategoryExpenses } from '@/lib/calculations';

const COLORS = ['#F7931A', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899'];

const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

    return (
        <g>
            <text x={cx} y={cy - 12} textAnchor="middle" fill="#94A3B8" className="text-[10px] font-mono uppercase tracking-widest">
                {payload.category}
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" fill="#fff" className="text-sm font-bold font-mono">
                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(value)}
            </text>
            <text x={cx} y={cy + 30} textAnchor="middle" fill={fill} className="text-[10px] font-bold">
                %{(percent * 100).toFixed(1)}
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 6}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + 8}
                outerRadius={outerRadius + 10}
                fill={fill}
            />
        </g>
    );
};

export function CategoryPieChart() {
    const [data, setData] = useState<{ category: string; amount: number }[]>([]);
    const [activeIndex, setActiveIndex] = useState<number>(-1);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const categories = await getCategoryExpenses();
        setData(categories);
    };

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    const onPieLeave = () => {
        setActiveIndex(-1);
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
        <Card className="flex flex-col h-full min-h-[450px] md:min-h-[400px]">
            <div className="mb-4">
                <h2 className="text-xl font-heading font-semibold gradient-text leading-tight">
                    Kategori Bazlı Giderler
                </h2>
                <p className="text-[10px] text-[#94A3B8] font-mono uppercase tracking-[0.2em] mt-1">Aylık Harcama Dağılımı</p>
            </div>

            <div className="flex-1 relative">
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
                            cy="45%"
                            innerRadius={70}
                            outerRadius={90}
                            paddingAngle={4}
                            onMouseEnter={onPieEnter}
                            onMouseLeave={onPieLeave}
                            stroke="none"
                            animationDuration={1200}
                            animationEasing="ease-out"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    className="outline-none cursor-pointer"
                                    style={{
                                        filter: activeIndex === index ? 'drop-shadow(0 0 15px rgba(247, 147, 26, 0.6))' : 'none',
                                        transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)'
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
                                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 px-2">
                                        {payload?.map((entry: any, index: number) => {
                                            const dataIndex = data.findIndex(d => d.category === entry.value);
                                            const isActive = activeIndex === dataIndex;
                                            return (
                                                <div
                                                    key={`legend-${index}`}
                                                    className={`flex items-center gap-2 cursor-pointer transition-all duration-300 py-1.5 px-3 rounded-xl border ${isActive
                                                        ? 'bg-white/10 border-white/20 scale-105 shadow-lg'
                                                        : 'bg-transparent border-transparent opacity-50 hover:opacity-100 hover:bg-white/5'
                                                        }`}
                                                    onMouseEnter={() => setActiveIndex(dataIndex)}
                                                    onMouseLeave={() => setActiveIndex(-1)}
                                                >
                                                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isActive ? 'scale-125 ring-2 ring-white/20' : ''}`} style={{ backgroundColor: entry.color }} />
                                                    <span className={`text-[10px] font-medium transition-colors duration-300 uppercase tracking-wider ${isActive ? 'text-white' : 'text-white/70'}`}>
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
