'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { db } from '@/lib/db';
import { Download, Upload } from 'lucide-react';

export function ExportImport() {
    const handleExport = async () => {
        try {
            const transactions = await db.transactions.toArray();
            const assets = await db.assets.toArray();
            const settings = await db.settings.toArray();

            const exportData = {
                transactions,
                assets,
                settings,
                exportDate: new Date().toISOString(),
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `finflow-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            alert('Veriler başarıyla dışa aktarıldı');
        } catch (error) {
            console.error('Export error:', error);
            alert('Dışa aktarma sırasında hata oluştu');
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            if (!data.transactions || !data.assets || !data.settings) {
                alert('Geçersiz dosya formatı');
                return;
            }

            if (!confirm('Mevcut tüm veriler silinecek ve yedek yüklenecek. Devam etmek istiyor musunuz?')) {
                return;
            }

            // Clear existing data
            await db.transactions.clear();
            await db.assets.clear();
            await db.settings.clear();

            // Import new data
            await db.transactions.bulkAdd(data.transactions);
            await db.assets.bulkAdd(data.assets);
            await db.settings.bulkAdd(data.settings);

            alert('Veriler başarıyla içe aktarıldı. Sayfa yenilenecek.');
            window.location.reload();
        } catch (error) {
            console.error('Import error:', error);
            alert('İçe aktarma sırasında hata oluştu');
        }

        // Reset input
        e.target.value = '';
    };

    return (
        <Card className="h-fit"> {/* Kartın aşağı uzamasını engellemek için h-fit ekledik */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-[#F7931A]/20 border border-[#F7931A]/50 flex items-center justify-center glow-orange">
                    <Download size={24} className="text-[#F7931A]" />
                </div>
                <h2 className="text-2xl font-heading font-semibold gradient-text">
                    Veri Yönetimi
                </h2>
            </div>

            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-body text-[#94A3B8] mb-2">
                        Verileri Dışa Aktar (Yedekleme)
                    </h3>
                    {/* flex items-center justify-center ekleyerek tam ortaladık */}
                    <Button onClick={handleExport} variant="outline" className="w-full flex items-center justify-center gap-2">
                        <Download size={20} />
                        <span>JSON Olarak İndir</span>
                    </Button>
                </div>

                <div className="pt-4 border-t border-white/10">
                    <h3 className="text-sm font-body text-[#94A3B8] mb-2">
                        Verileri İçe Aktar (Geri Yükleme)
                    </h3>
                    <label className="block">
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            className="hidden"
                            id="import-file"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full flex items-center justify-center gap-2"
                            onClick={() => document.getElementById('import-file')?.click()}
                        >
                            <Upload size={20} />
                            <span>JSON Dosyası Seç</span>
                        </Button>
                    </label>
                </div>
            </div>
        </Card>
    );
}
