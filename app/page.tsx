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
  calculateTotalAssetValue,
  calculateTotalProfit
} from '@/lib/calculations';
import { getCurrentUser } from '@/lib/auth';
import { Wallet, TrendingUp, TrendingDown, Coins } from 'lucide-react';

export default function Home() {
  const [balance, setBalance] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [totalAsset, setTotalAsset] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();

    // Refresh data when window gains focus or unlocked
    const handleRefresh = () => loadStats();

    window.addEventListener('focus', handleRefresh);
    window.addEventListener('finflow_unlock', handleRefresh);

    return () => {
      window.removeEventListener('focus', handleRefresh);
      window.removeEventListener('finflow_unlock', handleRefresh);
    };
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
    setLoading(false);

    // Submit to leaderboard (fire and forget)
    try {
      const profit = await calculateTotalProfit();
      const user = getCurrentUser();

      if (user) {
        fetch('/api/leaderboard/submit', {
          method: 'POST',
          body: JSON.stringify({ nick: user.nick, totalProfit: profit }),
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (e) {
      console.error('Leaderboard submit failed', e);
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
            value={totalAsset}
            icon={Wallet}
            loading={loading}
            prefix="₺"
          />
          <StatCard
            title="Bakiye"
            value={balance}
            icon={Coins}
            trend={balance >= 0 ? 'Pozitif' : 'Negatif'}
            trendUp={balance >= 0}
            loading={loading}
            prefix="₺"
          />
          <StatCard
            title="Aylık Gelir"
            value={monthlyIncome}
            icon={TrendingUp}
            loading={loading}
            prefix="₺"
          />
          <StatCard
            title="Aylık Gider"
            value={monthlyExpense}
            icon={TrendingDown}
            loading={loading}
            prefix="₺"
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
