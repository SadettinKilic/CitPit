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
    const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

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
        setActiveIndex(undefined);
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
                            activeIndex={activeIndex}
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
                            animationDuration={1800}
                            animationEasing="ease-out"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    style={{
                                        filter: activeIndex === index ? 'drop-shadow(0 0 15px rgba(247, 147, 26, 0.6))' : 'none',
                                        transition: 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)'
                                    }}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-[#0F1115]/95 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-xl border-l-4" style={{ borderLeftColor: payload[0].payload.fill }}>
                                            <p className="text-[#94A3B8] text-[10px] font-mono uppercase tracking-wider mb-1">{payload[0].name}</p>
                                            <p className="text-white font-mono font-bold text-lg">
                                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(payload[0].value as number)}
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            content={(props) => {
                                const { payload } = props;
                                return (
                                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 px-2">
                                        {payload?.map((entry: any, index: number) => {
                                            const dataIndex = data.findIndex(d => d.category === entry.value);
                                            const item = data[dataIndex];
                                            return (
                                                <div
                                                    key={`legend-${index}`}
                                                    className={`flex items-center gap-2 cursor-pointer transition-all duration-700 py-1 px-2 rounded-lg ${activeIndex === dataIndex ? 'bg-white/5 scale-105' : 'opacity-50 hover:opacity-100 hover:bg-white/5'}`}
                                                    onMouseEnter={() => setActiveIndex(dataIndex)}
                                                    onMouseLeave={() => setActiveIndex(undefined)}
                                                >
                                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-medium text-white/90 leading-none">{entry.value}</span>
                                                        {activeIndex === dataIndex && (
                                                            <span className="text-[9px] font-mono text-[#F7931A] mt-1 animate-in fade-in slide-in-from-top-1 duration-500">
                                                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(item.amount)}
                                                            </span>
                                                        )}
                                                    </div>
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
