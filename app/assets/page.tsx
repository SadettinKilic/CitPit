'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { AssetForm } from '@/components/Assets/AssetForm';
import { AssetList } from '@/components/Assets/AssetList';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import type { Asset } from '@/lib/db';

export default function AssetsPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [refresh, setRefresh] = useState(0);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

    const handleSuccess = () => {
        setRefresh(prev => prev + 1);
    };

    const handleEdit = (asset: Asset) => {
        setEditingAsset(asset);
        setIsFormOpen(true);
    };

    const handleClose = () => {
        setIsFormOpen(false);
        setEditingAsset(null);
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-heading font-bold gradient-text mb-2">
                            Varlıklar
                        </h1>
                        <p className="text-[#94A3B8] font-body">
                            Altın ve gümüş varlıklarınızı takip edin
                        </p>
                    </div>

                    <Button onClick={() => setIsFormOpen(true)} aria-label="Yeni Varlık Ekle" className="w-14 h-14 md:w-16 md:h-16 p-0 flex items-center justify-center rounded-2xl shadow-lg hover:scale-105 transition-transform">
                        <Plus className="w-10 h-10 md:w-12 md:h-12 text-white" strokeWidth={3} />
                    </Button>
                </div>

                <AssetList refresh={refresh} onEdit={handleEdit} />

                <AssetForm
                    isOpen={isFormOpen}
                    onClose={handleClose}
                    onSuccess={handleSuccess}
                    editingAsset={editingAsset}
                />
            </div>
        </AppLayout>
    );
}
