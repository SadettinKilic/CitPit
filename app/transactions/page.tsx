'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { TransactionForm } from '@/components/Transactions/TransactionForm';
import { TransactionList } from '@/components/Transactions/TransactionList';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import type { Transaction } from '@/lib/db';

export default function TransactionsPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [refresh, setRefresh] = useState(0);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    const handleSuccess = () => {
        setRefresh(prev => prev + 1);
    };

    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setIsFormOpen(true);
    };

    const handleClose = () => {
        setIsFormOpen(false);
        setEditingTransaction(null);
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-heading font-bold gradient-text mb-2">
                            İşlemler
                        </h1>
                        <p className="text-[#94A3B8] font-body">
                            Gelir ve gider işlemlerinizi yönetin
                        </p>
                    </div>

                    <Button onClick={() => setIsFormOpen(true)} aria-label="Yeni İşlem Ekle" className="w-14 h-14 md:w-16 md:h-16 p-0 flex items-center justify-center rounded-2xl shadow-lg hover:scale-105 transition-transform">
                        <Plus className="w-34 h-34 md:w-12 md:h-12 text-white" strokeWidth={4} />
                    </Button>
                </div>

                <TransactionList refresh={refresh} onEdit={handleEdit} />

                <TransactionForm
                    isOpen={isFormOpen}
                    onClose={handleClose}
                    onSuccess={handleSuccess}
                    editingTransaction={editingTransaction}
                />
            </div>
        </AppLayout>
    );
}
