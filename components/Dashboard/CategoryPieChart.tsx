'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, Sector } from 'recharts';
import { getCategoryExpenses } from '@/lib/calculations';

const COLORS = ['#F7931A', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899'];

const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = sx + (cos >= 0 ? 1 : -1) * 22;
    const ey = sy;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#fff" className="text-sm font-semibold">
                {payload.category}
            </text>
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

    const onLegendEnter = (entry: any) => {
        const index = data.findIndex(d => d.category === entry.value);
        setActiveIndex(index);
    };

    if (data.length === 0) {
        return (
            <Card>
                <h2 className="text-xl font-heading font-semibold mb-6 gradient-text">
                    Kategori Bazlı Harcamalar
                </h2>
                <div className="h-[350px] flex items-center justify-center">
                    <p className="text-[#94A3B8] font-body">Henüz harcama verisi yok</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="flex flex-col h-full">
            <h2 className="text-xl font-heading font-semibold mb-2 gradient-text">
                Kategori Bazlı Giderler
            </h2>
            <p className="text-xs text-[#94A3B8] mb-6 font-mono uppercase tracking-widest">Aylık Dağılım</p>

            <div className="flex-1 min-h-[300px]">
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
                            outerRadius={95}
                            paddingAngle={5}
                            onMouseEnter={onPieEnter}
                            onMouseLeave={onPieLeave}
                            stroke="none"
                            animationDuration={1500}
                            animationEasing="ease-in-out"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    style={{
                                        filter: activeIndex === index ? 'drop-shadow(0 0 12px rgba(247, 147, 26, 0.5))' : 'none',
                                        transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)'
                                    }}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-[#0F1115]/80 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md transition-all duration-500">
                                            <p className="text-white font-bold mb-1">{payload[0].name}</p>
                                            <p className="text-[#F7931A] font-mono text-lg">
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
                            height={36}
                            content={(props) => {
                                const { payload } = props;
                                return (
                                    <div className="flex flex-wrap justify-center gap-4 mt-6">
                                        {payload?.map((entry: any, index: number) => {
                                            const dataIndex = data.findIndex(d => d.category === entry.value);
                                            return (
                                                <div
                                                    key={`legend-${index}`}
                                                    className={`flex items-center gap-2 cursor-pointer transition-all duration-500 ${activeIndex === dataIndex ? 'scale-110 translate-y-[-2px]' : 'opacity-60 hover:opacity-100'}`}
                                                    onMouseEnter={() => onPieEnter(null, dataIndex)}
                                                    onMouseLeave={onPieLeave}
                                                >
                                                    <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]" style={{ backgroundColor: entry.color }} />
                                                    <span className="text-[11px] font-medium text-white/90 tracking-wide uppercase">{entry.value}</span>
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
