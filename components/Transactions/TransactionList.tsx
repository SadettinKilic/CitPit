'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { db, Transaction } from '@/lib/db';
import { Trash2 } from 'lucide-react';

interface TransactionListProps {
    refresh: number;
}

export function TransactionList({ refresh }: TransactionListProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [expandedTxId, setExpandedTxId] = useState<number | null>(null);

    useEffect(() => {
        loadTransactions();
    }, [refresh]);

    const loadTransactions = async () => {
        const allTransactions = await db.transactions.orderBy('date').reverse().toArray();
        setTransactions(allTransactions);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Bu işlemi silmek istediğinizden emin misiniz?')) {
            await db.transactions.delete(id);
            loadTransactions();
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

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('tr-TR');
    };

    if (transactions.length === 0) {
        return (
            <Card variant="glass">
                <div className="text-center py-12">
                    <p className="text-[#94A3B8] font-body">Henüz işlem kaydı yok</p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Desktop View */}
            <div className="hidden md:block">
                <Card className="overflow-hidden p-0" variant="glass">
                    <table className="w-full">
                        <thead className="bg-white/5 border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-mono text-[#94A3B8] uppercase tracking-wider">Tarih</th>
                                <th className="px-6 py-4 text-left text-xs font-mono text-[#94A3B8] uppercase tracking-wider">Tip</th>
                                <th className="px-6 py-4 text-left text-xs font-mono text-[#94A3B8] uppercase tracking-wider">Kategori</th>
                                <th className="px-6 py-4 text-left text-xs font-mono text-[#94A3B8] uppercase tracking-wider">Not</th>
                                <th className="px-6 py-4 text-right text-xs font-mono text-[#94A3B8] uppercase tracking-wider">Tutar</th>
                                <th className="px-6 py-4 text-center text-xs font-mono text-[#94A3B8] uppercase tracking-wider">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10 text-white">
                            {transactions.map((transaction) => (
                                <tr key={transaction.id} className="hover:bg-white/5 transition-colors duration-300">
                                    <td className="px-6 py-4 text-sm font-body">{formatDate(transaction.date)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-mono uppercase ${transaction.type === 'income'
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                            }`}>
                                            {transaction.type === 'income' ? 'Gelir' : 'Gider'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-body font-medium">{transaction.category}</td>
                                    <td className="px-6 py-4 text-sm font-body text-[#94A3B8] italic">{transaction.note || '-'}</td>
                                    <td className={`px-6 py-4 text-sm font-mono text-right font-bold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => transaction.id && handleDelete(transaction.id)}
                                            className="text-red-400/60 hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-3">
                {transactions.map((transaction) => {
                    const isExpanded = expandedTxId === transaction.id;
                    return (
                        <Card
                            key={transaction.id}
                            variant="glass"
                            className={`transition-all duration-300 px-5 py-4 ${isExpanded ? 'border-[#F7931A]/50 bg-white/5' : 'hover:border-white/20'}`}
                            onClick={() => setExpandedTxId(isExpanded ? null : transaction.id!)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[#94A3B8] text-[10px] font-mono uppercase tracking-widest mb-1 leading-none">
                                        {formatDate(transaction.date)} • {transaction.category}
                                    </span>
                                    <span className={`text-lg font-bold font-mono ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                    </span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono uppercase mb-2 ${transaction.type === 'income'
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                                        : 'bg-red-500/20 text-red-400 border border-red-500/20'
                                        }`}>
                                        {transaction.type === 'income' ? 'Gelir' : 'Gider'}
                                    </span>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="mt-4 pt-4 border-t border-white/10 space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                                    <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                                        <p className="text-[10px] text-[#94A3B8] uppercase font-mono mb-1">İşlem Notu</p>
                                        <p className="text-sm text-white italic">
                                            {transaction.note || 'Not eklenmemiş'}
                                        </p>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                transaction.id && handleDelete(transaction.id);
                                            }}
                                            className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 bg-red-500/10 px-4 py-2 rounded-lg transition-colors border border-red-500/20"
                                        >
                                            <Trash2 size={14} /> İşlemi Sil
                                        </button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
