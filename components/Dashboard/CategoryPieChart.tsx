'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getCategoryExpenses } from '@/lib/calculations';

const COLORS = ['#F7931A', '#EA580C', '#FFD600', '#FB923C', '#FDBA74', '#FED7AA'];

export function CategoryPieChart() {
    const [data, setData] = useState<{ category: string; amount: number }[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const categories = await getCategoryExpenses();
        setData(categories);
    };

    if (data.length === 0) {
        return (
            <Card>
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
        <Card>
            <h2 className="text-xl font-heading font-semibold mb-6 gradient-text">
                Kategori Bazlı Harcamalar
            </h2>

            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry: any) => `${entry.category} ${(entry.percent * 100).toFixed(0)}%`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#0F1115',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            fontFamily: 'var(--font-inter)',
                            color: '#fff',
                        }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Legend
                        wrapperStyle={{
                            fontFamily: 'var(--font-inter)',
                            fontSize: 14,
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </Card>
    );
}
