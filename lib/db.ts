import Dexie, { type EntityTable } from 'dexie';
import type { AssetType } from './api';

// TypeScript Interfaces
export interface Transaction {
    id?: number;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    date: Date;
    note?: string;
    userId: number;
}

export interface Asset {
    id?: number;
    assetType: AssetType;
    quantity: number;
    buyPrice: number;
    date: Date;
    userId: number;
    details?: {
        brand?: string;
        model?: string;
        year?: number;
        km?: number;
        m2?: number;
        roomCount?: string; // 1+1, 2+1, etc.
        location?: string;
    };
}

export interface User {
    id?: number;
    nick: string;
    pin: string;
    createdAt: Date;
}

export interface Setting {
    id?: number;
    goldPrice?: number;
    silverPrice?: number;
    [key: string]: any;
}

const db = new Dexie('FinFlowDB') as Dexie & {
    transactions: EntityTable<Transaction, 'id'>;
    assets: EntityTable<Asset, 'id'>;
    users: EntityTable<User, 'id'>;
    settings: EntityTable<Setting, 'id'>;
};

db.version(2).stores({
    transactions: '++id, type, category, amount, date, userId',
    assets: '++id, assetType, quantity, buyPrice, date, userId',
    users: '++id, &nick, pin, createdAt',
    settings: '++id'
});

db.version(1).stores({
    transactions: '++id, type, category, amount, date, note',
    assets: '++id, assetType, weight, buyPrice, date',
    settings: '++id, goldPrice, silverPrice',
});

export { db };