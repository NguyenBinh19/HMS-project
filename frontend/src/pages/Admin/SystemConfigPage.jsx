import React, { useState } from 'react';
import RankCycleTab from '@/components/admin/systemConfig/RankCycleTab.jsx';

const SystemConfigPage = () => {
    const [activeTab, setActiveTab] = useState('RANK_CYCLE');

    const tabs = [
        { id: 'FINANCE', label: 'Tài chính' },
        { id: 'OPERATION', label: 'Vận hành & TTL' },
        { id: 'RANK_CYCLE', label: 'Chu kỳ xếp hạng' },
        { id: 'NOTI', label: 'Thông báo' },
    ];

    return (
        <div className="p-8 bg-[#f8fafc] min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-black text-slate-800 mb-8 uppercase">Cấu hình hệ thống</h1>

                {/* Tab Header */}
                <div className="flex border-b border-slate-200 mb-8 gap-8">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-4 text-sm font-bold transition-all relative ${
                                activeTab === tab.id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="bg-white p-2 rounded-[32px]">
                    {activeTab === 'RANK_CYCLE' && <RankCycleTab />}
                    {/* Các tab khác tương tự... */}
                </div>
            </div>
        </div>
    );
};

export default SystemConfigPage;