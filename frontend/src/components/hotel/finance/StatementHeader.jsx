import React from 'react';
import { ArrowDownCircle, ArrowUpCircle, Wallet, Calculator } from "lucide-react";

const StatementHeader = ({ gross, commission, adjustments, net }) => {
    const formatVN = (val) => new Intl.NumberFormat('vi-VN').format(val);

    const items = [
        { label: "Tổng doanh thu (Gross)", value: gross, color: "text-slate-600", icon: <ArrowUpCircle size={20}/> },
        { label: "Phí hoa hồng (Commission)", value: -commission, color: "text-red-500", icon: <ArrowDownCircle size={20}/> },
        { label: "Điều chỉnh/Hoàn tiền", value: adjustments, color: "text-amber-600", icon: <Calculator size={20}/> },
        { label: "Thực nhận (Net Payout)", value: net, color: "text-blue-600", icon: <Wallet size={20}/> },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {items.map((item, idx) => (
                <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-slate-400">
                        {item.icon}
                        <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                    </div>
                    <h3 className={`text-xl font-black ${item.color}`}>
                        {formatVN(item.value)} <span className="text-xs">đ</span>
                    </h3>
                </div>
            ))}
        </div>
    );
};

export default StatementHeader;