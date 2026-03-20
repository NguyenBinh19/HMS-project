import React from 'react';
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const KPICard = ({ title, value, unit, trend, isUp }) => {
    // Định dạng số phân cách hàng nghìn kiểu VN (1.000.000)
    const displayValue = typeof value === 'number'
        ? new Intl.NumberFormat('vi-VN').format(value)
        : value;

    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
                {/* Chỉ báo màu sắc theo khuyến nghị UX của UC */}
                <div className={`flex items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-bold ${
                    isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                }`}>
                    {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {trend}%
                </div>
            </div>
            <div className="flex items-baseline gap-1">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                    {displayValue}
                </h2>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{unit}</span>
            </div>
        </div>
    );
};

export default KPICard;