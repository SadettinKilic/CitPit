import { db } from './db';
import type { Transaction, Asset } from './db';
import { getSellingPrice, type AssetType } from './api';
import { getCurrentUserId } from './auth';

// Get current user's transactions
async function getUserTransactions(): Promise<Transaction[]> {
    const userId = getCurrentUserId();
    if (!userId) return [];

    return await db.transactions.where('userId').equals(userId).toArray();
}

// Get current user's assets
async function getUserAssets(): Promise<Asset[]> {
    const userId = getCurrentUserId();
    if (!userId) return [];

    return await db.assets.where('userId').equals(userId).toArray();
}

// Bakiye hesaplama (Gelir - Gider)
export async function calculateBalance(): Promise<number> {
    const transactions = await getUserTransactions();

    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    return totalIncome - totalExpense;
}

// Aylık gelir hesaplama
export async function calculateMonthlyIncome(): Promise<number> {
    const userId = getCurrentUserId();
    if (!userId) return 0;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const transactions = await db.transactions
        .where('userId')
        .equals(userId)
        .and(t => {
            const date = new Date(t.date);
            return date >= startOfMonth && date <= endOfMonth && t.type === 'income';
        })
        .toArray();

    return transactions.reduce((sum, t) => sum + t.amount, 0);
}

// Aylık gider hesaplama
export async function calculateMonthlyExpense(): Promise<number> {
    const userId = getCurrentUserId();
    if (!userId) return 0;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const transactions = await db.transactions
        .where('userId')
        .equals(userId)
        .and(t => {
            const date = new Date(t.date);
            return date >= startOfMonth && date <= endOfMonth && t.type === 'expense';
        })
        .toArray();

    return transactions.reduce((sum, t) => sum + t.amount, 0);
}

// Kategori bazlı harcama dağılımı
export async function getCategoryExpenses(monthsBack: number = 0): Promise<{ category: string; amount: number }[]> {
    const transactions = await getUserTransactions();

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);

    const expenses = transactions.filter(t => {
        const date = new Date(t.date);
        return t.type === 'expense' && date >= startDate;
    });

    const categoryMap = new Map<string, number>();

    expenses.forEach(expense => {
        // Eğer kategori "Diğer" ise ve not varsa, notu kategori ismi olarak kullan
        let displayName = expense.category;
        if (expense.category === 'Diğer' && expense.note) {
            displayName = expense.note;
        }

        const current = categoryMap.get(displayName) || 0;
        categoryMap.set(displayName, current + expense.amount);
    });

    return Array.from(categoryMap.entries()).map(([category, amount]) => ({
        category,
        amount,
    }));
}

// Son 6 ay gelir/gider trendi
export async function getLast6MonthsTrend(): Promise<{
    month: string;
    income: number;
    expense: number;
}[]> {
    const userId = getCurrentUserId();
    if (!userId) return [];

    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const transactions = await db.transactions
        .where('userId')
        .equals(userId)
        .and(t => new Date(t.date) >= sixMonthsAgo)
        .toArray();

    // Ay bazında gruplama
    const monthlyData = new Map<string, { income: number; expense: number }>();

    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData.set(monthKey, { income: 0, expense: 0 });
    }

    transactions.forEach(t => {
        const date = new Date(t.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const data = monthlyData.get(monthKey);

        if (data) {
            if (t.type === 'income') {
                data.income += t.amount;
            } else {
                data.expense += t.amount;
            }
        }
    });

    const result: { month: string; income: number; expense: number }[] = [];

    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('tr-TR', { month: 'short' });
        const data = monthlyData.get(monthKey) || { income: 0, expense: 0 };

        result.push({
            month: monthName,
            income: data.income,
            expense: data.expense,
        });
    }

    return result;
}

// Tüm varlıkların toplam değerini hesapla (API fiyatları ile)
export async function calculateTotalAssetValue(): Promise<number> {
    const assets = await getUserAssets();

    let totalValue = 0;

    for (const asset of assets) {
        const currentPrice = await getSellingPrice(asset.assetType);
        totalValue += asset.quantity * currentPrice;
    }

    const balance = await calculateBalance();

    return totalValue + balance;
}

// Varlık tipine göre istatistikler
export async function getAssetStatsByType(assetType: AssetType): Promise<{
    totalQuantity: number;
    totalCost: number;
    currentValue: number;
    profit: number;
    profitPercentage: number;
}> {
    const assets = await getUserAssets();
    const filtered = assets.filter(a => a.assetType === assetType);

    const totalQuantity = filtered.reduce((sum, a) => sum + a.quantity, 0);
    const totalCost = filtered.reduce((sum, a) => sum + (a.quantity * a.buyPrice), 0);

    const currentPrice = await getSellingPrice(assetType);
    const currentValue = totalQuantity * currentPrice;
    const profit = currentValue - totalCost;
    const profitPercentage = totalCost > 0 ? (profit / totalCost) * 100 : 0;

    return {
        totalQuantity,
        totalCost,
        currentValue,
        profit,
        profitPercentage,
    };
}

// Tüm varlık tiplerinin istatistiklerini al
export async function getAllAssetStats(): Promise<{
    [key in AssetType]: {
        totalQuantity: number;
        totalCost: number;
        currentValue: number;
        profit: number;
        profitPercentage: number;
    }
}> {
    const assetTypes: AssetType[] = [
        'gold_gram',
        'gold_14karat',
        'gold_quarter',
        'gold_half',
        'gold_full',
        'gold_resat',
        'silver_gram',
        'usd',
        'eur',
        'home',
        'car',
        'land',
    ];

    const stats: any = {};

    for (const type of assetTypes) {
        stats[type] = await getAssetStatsByType(type);
    }

    return stats;
}

// Toplam kar hesaplama (leaderboard için)
export async function calculateTotalProfit(): Promise<number> {
    const assets = await getUserAssets();

    let totalProfit = 0;

    for (const asset of assets) {
        const currentPrice = await getSellingPrice(asset.assetType);
        const currentValue = asset.quantity * currentPrice;
        const cost = asset.quantity * asset.buyPrice;
        totalProfit += (currentValue - cost);
    }

    return totalProfit;
}

// Toplam kâr yüzdesi hesaplama (leaderboard için)
export async function calculateTotalProfitPercentage(): Promise<number> {
    const assets = await getUserAssets();

    let totalCost = 0;
    let totalProfit = 0;

    for (const asset of assets) {
        const currentPrice = await getSellingPrice(asset.assetType);
        const currentValue = asset.quantity * currentPrice;
        const cost = asset.quantity * asset.buyPrice;

        totalCost += cost;
        totalProfit += (currentValue - cost);
    }

    if (totalCost === 0) return 0;

    // Yüzdelik olarak döndür (örn: 58.2)
    return (totalProfit / totalCost) * 100;
}
