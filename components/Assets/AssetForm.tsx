'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { db } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth';
import { getAssetTypeOptions, getBuyingPrice, type AssetType } from '@/lib/api';

interface AssetFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AssetForm({ isOpen, onClose, onSuccess }: AssetFormProps) {
    const [assetType, setAssetType] = useState<AssetType>('gold_gram');
    const [quantity, setQuantity] = useState('');
    const [buyPrice, setBuyPrice] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [currentPrice, setCurrentPrice] = useState<number>(0);

    // Dynamic fields
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [km, setKm] = useState('');
    const [m2, setM2] = useState('');
    const [roomCount, setRoomCount] = useState('2+1');
    const [location, setLocation] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadCurrentPrice();
        }
    }, [assetType, isOpen]);

    const loadCurrentPrice = async () => {
        // Only fetch API price for standard assets
        if (!['car', 'home', 'land'].includes(assetType)) {
            const price = await getBuyingPrice(assetType);
            setCurrentPrice(price);
            setBuyPrice(price.toString());
        } else {
            setCurrentPrice(0);
            setBuyPrice('');
        }
    };

    const handleAiValuation = async () => {
        setAiLoading(true);
        try {
            const response = await fetch('/api/valuation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: assetType,
                    details: {
                        brand, model, year: parseInt(year), km: parseInt(km),
                        m2: parseInt(m2), location, roomCount
                    }
                })
            });
            const data = await response.json();
            if (data.success) {
                setBuyPrice(data.estimatedPrice.toString());
            } else {
                alert('Fiyat tahmini alınamadı: ' + (data.error || 'Bilinmeyen hata'));
            }
        } catch (error) {
            console.error(error);
            alert('AI servisine erişilemedi');
        } finally {
            setAiLoading(false);
        }
    };

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
            const details: any = {};
            if (assetType === 'car') {
                details.brand = brand;
                details.model = model;
                details.year = parseInt(year);
                details.km = parseInt(km);
            } else if (assetType === 'home') {
                details.location = location;
                details.m2 = parseInt(m2);
                details.roomCount = roomCount;
            } else if (assetType === 'land') {
                details.location = location;
                details.m2 = parseInt(m2);
            }

            await db.assets.add({
                assetType,
                quantity: parseFloat(quantity) || 1, // Default to 1 for unique assets like car/home
                buyPrice: parseFloat(buyPrice),
                date: new Date(date),
                userId,
                details
            });

            // Reset form
            setAssetType('gold_gram');
            setQuantity('');
            setBuyPrice('');
            setBrand(''); setModel(''); setYear(''); setKm(''); setM2(''); setLocation(''); setRoomCount('2+1');
            setDate(new Date().toISOString().split('T')[0]);

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Asset error:', error);
            alert('Varlık eklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const isAiSupported = ['car', 'home', 'land'].includes(assetType);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Yeni Varlık Ekle">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Select
                    label="Varlık Tipi"
                    value={assetType}
                    onChange={(e) => setAssetType(e.target.value as AssetType)}
                    options={getAssetTypeOptions()}
                />

                {/* Standard Asset Price Display */}
                {currentPrice > 0 && !isAiSupported && (
                    <div className="bg-[#F7931A]/10 border border-[#F7931A]/30 rounded-lg p-3">
                        <p className="text-xs text-[#94A3B8] font-body mb-1">Güncel Fiyat</p>
                        <p className="text-lg font-mono font-bold text-[#F7931A]">
                            ₺{currentPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                )}

                {/* Dynamic Fields */}
                {assetType === 'car' && (
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="Marka" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="BMW" required />
                        <Input label="Model" value={model} onChange={(e) => setModel(e.target.value)} placeholder="320i" required />
                        <Input label="Yıl" type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2020" required />
                        <Input label="KM" type="number" value={km} onChange={(e) => setKm(e.target.value)} placeholder="50000" required />
                    </div>
                )}

                {(assetType === 'home' || assetType === 'land') && (
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="Konum (İl/İlçe)" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="İstanbul, Kadıköy" required className="col-span-2" />
                        <Input label="Büyüklük (m²)" type="number" value={m2} onChange={(e) => setM2(e.target.value)} placeholder="100" required className={assetType === 'home' ? '' : 'col-span-2'} />
                        {assetType === 'home' && (
                            <Select
                                label="Oda Sayısı"
                                value={roomCount}
                                onChange={(e) => setRoomCount(e.target.value)}
                                options={[
                                    { value: '1+0', label: '1+0' },
                                    { value: '1+1', label: '1+1' },
                                    { value: '2+1', label: '2+1' },
                                    { value: '3+1', label: '3+1' },
                                    { value: '4+1', label: '4+1' },
                                    { value: '5+1', label: '5+1' },
                                    { value: 'Villa', label: 'Villa' },
                                ]}
                            />
                        )}
                    </div>
                )}

                {!isAiSupported && (
                    <Input
                        type="number"
                        label="Miktar / Adet"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        required
                    />
                )}

                <div className="flex items-end gap-2">
                    <div className="flex-1">
                        <Input
                            type="number"
                            label="Değer / Fiyat (₺)"
                            value={buyPrice}
                            onChange={(e) => setBuyPrice(e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            required
                        />
                    </div>
                    {isAiSupported && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleAiValuation}
                            disabled={aiLoading}
                            className="mb-[2px] bg-[#F7931A]/10 border-[#F7931A]/30 text-[#F7931A] hover:bg-[#F7931A]/20"
                        >
                            {aiLoading ? 'Hesap...' : 'AI Fiyatla'}
                        </Button>
                    )}
                </div>

                <Input
                    type="date"
                    label="Alınma Tarihi"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />

                <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                        İptal
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1">
                        {loading ? 'Ekleniyor...' : 'Ekle'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
