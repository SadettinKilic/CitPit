'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input, Select, TextArea } from '../ui/Input';
import { Button } from '../ui/Button';
import { db, Transaction } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth';

interface TransactionFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editingTransaction?: Transaction | null;
}

const CATEGORIES = {
    income: ['Maaş', 'Freelance', 'Yatırım', 'Diğer'],
    expense: ['Market', 'Fatura', 'Kira', 'Ulaşım', 'Eğlence', 'Sağlık', 'Giyim', 'Diğer'],
};

export function TransactionForm({ isOpen, onClose, onSuccess, editingTransaction }: TransactionFormProps) {
    const [type, setType] = useState<'income' | 'expense'>(editingTransaction?.type || 'expense');
    const [category, setCategory] = useState(editingTransaction?.category || '');
    const [amount, setAmount] = useState(editingTransaction?.amount.toString() || '');
    const [date, setDate] = useState(
        editingTransaction?.date
            ? new Date(editingTransaction.date).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
    );
    const [note, setNote] = useState(editingTransaction?.note || '');
    const [loading, setLoading] = useState(false);

    // Update form when editingTransaction changes
    React.useEffect(() => {
        if (editingTransaction) {
            setType(editingTransaction.type);
            setCategory(editingTransaction.category);
            setAmount(editingTransaction.amount.toString());
            setDate(new Date(editingTransaction.date).toISOString().split('T')[0]);
            setNote(editingTransaction.note || '');
        } else {
            // Reset to defaults when not editing
            setType('expense');
            setCategory('');
            setAmount('');
            setDate(new Date().toISOString().split('T')[0]);
            setNote('');
        }
    }, [editingTransaction]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const userId = getCurrentUserId();
        if (!userId) {
            alert('Lütfen giriş yapın');
            setLoading(false);
            return;
        }

        try {
            if (editingTransaction && editingTransaction.id) {
                // Update existing transaction
                await db.transactions.update(editingTransaction.id, {
                    type,
                    category: category || CATEGORIES[type][0],
                    amount: parseFloat(amount),
                    date: new Date(date),
                    note: note || undefined,
                });
            } else {
                // Add new transaction
                await db.transactions.add({
                    type,
                    category: category || CATEGORIES[type][0],
                    amount: parseFloat(amount),
                    date: new Date(date),
                    note: note || undefined,
                    userId,
                });
            }

            // Reset form
            setType('expense');
            setCategory('');
            setAmount('');
            setDate(new Date().toISOString().split('T')[0]);
            setNote('');

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Transaction error:', error);
            alert(editingTransaction ? 'İşlem güncellenirken hata oluştu' : 'İşlem eklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const categories = CATEGORIES[type];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editingTransaction ? "İşlemi Düzenle" : "Yeni İşlem Ekle"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Select
                    label="İşlem Tipi"
                    value={type}
                    onChange={(e) => {
                        setType(e.target.value as 'income' | 'expense');
                        setCategory('');
                    }}
                    options={[
                        { value: 'income', label: 'Gelir' },
                        { value: 'expense', label: 'Gider' },
                    ]}
                />

                <Select
                    label="Kategori"
                    value={category || categories[0]}
                    onChange={(e) => setCategory(e.target.value)}
                    options={categories.map(cat => ({ value: cat, label: cat }))}
                />

                <Input
                    type="number"
                    label="Tutar (₺)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    required
                />

                <Input
                    type="date"
                    label="Tarih"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />

                <TextArea
                    label="Not (Opsiyonel)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Açıklama ekleyin..."
                />

                <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                        İptal
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1">
                        {loading ? (editingTransaction ? 'Güncelleniyor...' : 'Ekleniyor...') : (editingTransaction ? 'Güncelle' : 'Ekle')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
