'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { StatCard } from '@/components/Dashboard/StatCard';
import { IncomeExpenseChart } from '@/components/Dashboard/IncomeExpenseChart';
import { CategoryPieChart } from '@/components/Dashboard/CategoryPieChart';
import { AssetOverview } from '@/components/Dashboard/AssetOverview';
import {
  calculateBalance,
  calculateMonthlyIncome,
  calculateMonthlyExpense,
  calculateTotalAssetValue
} from '@/lib/calculations';
import { Wallet, TrendingUp, TrendingDown, Coins } from 'lucide-react';

export default function Home() {
  const [balance, setBalance] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [totalAsset, setTotalAsset] = useState(0);

  useEffect(() => {
    loadStats();

    // Refresh data when window gains focus
    const handleFocus = () => loadStats();
    window.addEventListener('focus', handleFocus);

    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const loadStats = async () => {
    const bal = await calculateBalance();
    const income = await calculateMonthlyIncome();
    const expense = await calculateMonthlyExpense();
    const asset = await calculateTotalAssetValue();

    setBalance(bal);
    setMonthlyIncome(income);
    setMonthlyExpense(expense);
    setTotalAsset(asset);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-heading font-bold mb-2">
            <span className="text-white">Hoş Geldiniz,</span>{' '}
            <span className="gradient-text">FinFlow</span>
          </h1>
          <p className="text-[#94A3B8] font-body">
            Kişisel finans ve varlıklarınızın özeti
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Toplam Varlık"
            value={formatCurrency(totalAsset)}
            icon={Wallet}
          />
          <StatCard
            title="Bakiye"
            value={formatCurrency(balance)}
            icon={Coins}
            trend={balance >= 0 ? 'Pozitif' : 'Negatif'}
            trendUp={balance >= 0}
          />
          <StatCard
            title="Aylık Gelir"
            value={formatCurrency(monthlyIncome)}
            icon={TrendingUp}
          />
          <StatCard
            title="Aylık Gider"
            value={formatCurrency(monthlyExpense)}
            icon={TrendingDown}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <IncomeExpenseChart />
          <CategoryPieChart />
        </div>

        {/* Asset Overview */}
        <div>
          <h2 className="text-2xl font-heading font-semibold mb-6 gradient-text">
            Varlık Portföyü
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AssetOverview />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
