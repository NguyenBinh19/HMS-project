import React, { useState } from 'react';
import { Search, Filter, Copy, AlertCircle, CheckCircle2, Zap } from "lucide-react";
import PayoutStats from '@/components/admin/financial/PayoutStats';
import PayoutModal from '@/components/admin/financial/PayoutModal';

const PayoutList = () => {
    const [activeTab, setActiveTab] = useState("Pending");
    const [selectedPayout, setSelectedPayout] = useState(null);

    const payouts = [
        { id: "#WD-2026-001", time: "20/05/2026 08:00", hotel: "Mường Thanh Luxury", bank: "Vietcombank", bankNo: "0071000xxxx", company: "CTY CP DU LỊCH MƯỜNG THANH", net: 50000000, fee: 11000, walletBalance: 55000000, isEnough: true },
        { id: "#WD-2026-003", time: "19/05/2026 16:30", hotel: "Grand Hotel Saigon", bank: "ACB", bankNo: "265897xxx", company: "GRAND HOTEL SAIGON CO., LTD.", net: 75000000, fee: 7500, walletBalance: 45000000, isEnough: false },
    ];

    return (
        <div className="p-8 bg-[#f8fafc] min-h-screen font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-2xl font-black text-slate-800">XỬ LÝ GIAO DỊCH THANH TOÁN</h1>
                    <p className="text-slate-500 text-sm font-medium">Payout Request Management (Quản lý Yêu cầu Rút tiền)</p>
                </header>

                <PayoutStats />

                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-lg font-black text-slate-800 mb-1">Bảng lệnh rút tiền</h2>
                        <p className="text-slate-400 text-xs font-medium mb-6">Các lệnh rút tiền từ Khách sạn cần xử lý</p>

                        {/* Tabs */}
                        <div className="flex gap-8 border-b border-slate-100 mb-6">
                            {["Chờ xử lý (Pending)", "Đang xử lý (Processing)", "Hoàn thành", "Đã từ chối"].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-4 text-sm font-bold transition-all ${tab.includes(activeTab) ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Ngân hàng thụ hưởng</label>
                                <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none">
                                    <option>Tất cả ngân hàng</option>
                                    <option>Vietcombank</option>
                                    <option>Techcombank</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Tìm kiếm</label>
                                <div className="relative">
                                    <input type="text" placeholder="Tìm theo Mã lệnh (#WD...) hoặc Tên Khách sạn" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-blue-200" />
                                    <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 p-2 rounded-lg text-white"><Search size={16}/></button>
                                </div>
                            </div>
                        </div>

                        {/* Table Header */}
                        <div className="grid grid-cols-6 gap-4 px-4 py-3 bg-slate-50 rounded-xl mb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <div className="col-span-1">Thông tin lệnh</div>
                            <div className="col-span-1">Người thụ hưởng</div>
                            <div className="col-span-1">Số tiền</div>
                            <div className="col-span-2">Đối soát ví</div>
                            <div className="col-span-1 text-center">Hành động</div>
                        </div>

                        {/* Data Rows */}
                        <div className="space-y-4">
                            {payouts.map((p, idx) => (
                                <div key={idx} className="grid grid-cols-6 gap-4 px-4 py-6 border-b border-slate-50 items-center">
                                    <div className="col-span-1">
                                        <p className="font-black text-slate-800 text-sm mb-1">{p.id}</p>
                                        <p className="text-[10px] text-slate-400 font-bold leading-relaxed">{p.time}</p>
                                    </div>
                                    <div className="col-span-1">
                                        <p className="font-black text-slate-700 text-[13px] mb-1">{p.hotel}</p>
                                        <p className="text-[11px] text-slate-400 font-medium">{p.bank}</p>
                                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                                            {p.bankNo} <Copy size={12} className="cursor-pointer hover:text-blue-500" />
                                        </div>
                                    </div>
                                    <div className="col-span-1">
                                        <p className="font-black text-slate-800 text-sm">{p.net.toLocaleString()} đ</p>
                                        <p className="text-[10px] text-slate-400 font-medium">Khách thực nhận: {(p.net - 10000).toLocaleString()} đ</p>
                                        <div className="mt-2 p-2 bg-blue-50 rounded-lg text-[10px] font-bold text-blue-600 border-l-2 border-blue-400">
                                            Phí: {p.fee.toLocaleString()} đ (Trừ sàn)
                                        </div>
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <div className="text-[11px] font-medium text-slate-500">Số dư ví KS: {p.walletBalance.toLocaleString()} đ</div>
                                        {p.isEnough ? (
                                            <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-black uppercase tracking-tighter">
                                                <CheckCircle2 size={14} /> Đủ tiền
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-red-500 text-[11px] font-black uppercase tracking-tighter">
                                                <AlertCircle size={14} /> Không đủ tiền
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-span-1 flex gap-2 justify-center">
                                        <button
                                            onClick={() => setSelectedPayout(p)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-black text-[10px] flex items-center gap-1 shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
                                        >
                                            <Zap size={12} fill="currentColor"/> XỬ LÝ
                                        </button>
                                        <button className="px-4 py-2 bg-red-500 text-white rounded-xl font-black text-[10px] hover:bg-red-600 transition-all">TỪ CHỐI</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <PayoutModal
                isOpen={!!selectedPayout}
                onClose={() => setSelectedPayout(null)}
                data={selectedPayout || {}}
            />
        </div>
    );
};

export default PayoutList;