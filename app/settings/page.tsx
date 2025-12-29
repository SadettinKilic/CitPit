import React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { APIStatus } from '@/components/Settings/APIStatus';
import { ExportImport } from '@/components/DataManagement/ExportImport';
import { InvestmentGoal } from '@/components/Settings/InvestmentGoal';

export default function SettingsPage() {
    return (
        <AppLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-4xl font-heading font-bold gradient-text mb-2">
                        Ayarlar
                    </h1>
                    <p className="text-[#94A3B8] font-body">
                        API durumu ve veri yönetimi
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <InvestmentGoal />
                        <APIStatus />
                    </div>
                    <ExportImport />
                </div>
            </div>
        </AppLayout>
    );
}
