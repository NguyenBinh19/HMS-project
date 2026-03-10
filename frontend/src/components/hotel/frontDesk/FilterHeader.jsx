import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const FilterHeader = ({ activeTab, setActiveTab, currentDate, setCurrentDate }) => {

    const tabs = [
        { id: 'arrival', label: 'Khách đến' },
        { id: 'departure', label: 'Khách đi' },
        { id: 'stay', label: 'Đang lưu trú' }
    ];

    return (
        <div className="p-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4 bg-white">
            {/* Điều khiển ngày tháng (UC050.0 Step 2) */}
            <div className="flex items-center gap-2">
                <button className="p-2 bg-slate-50 border rounded-xl hover:bg-slate-100">
                    <ChevronLeft size={18} />
                </button>
                <div className="px-4 py-2 bg-slate-50 border rounded-xl font-bold text-sm">
                    {currentDate}
                </div>
                <button className="p-2 bg-slate-50 border rounded-xl hover:bg-slate-100">
                    <ChevronRight size={18} />
                </button>
                <button
                    onClick={() => setCurrentDate("2026-03-10")} // Giả sử hôm nay là 10/03
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-wider ml-2"
                >
                    Hôm nay
                </button>
            </div>

            {/* Tab chuyển đổi (UC050.1) */}
            <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                            activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default FilterHeader;