import React, { useState, useMemo } from 'react';
import {
    FileText, CheckCircle, AlertCircle, Download,
    ArrowLeft, History, Search, ExternalLink, Printer,
    ChevronLeft, ChevronRight
} from "lucide-react";
import StatementHeader from '@/components/hotel/finance/StatementHeader';

const SettlementDetail = () => {
    const [status, setStatus] = useState("Pending");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Logic Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;

    // Giả lập dữ liệu dài (20 bookings)
    const allTransactions = Array.from({ length: 20 }, (_, i) => ({
        id: `BK-90${20 + i}`,
        date: `${String(i + 1).padStart(2, '0')}/03/2026`,
        guest: ["Nguyễn Văn A", "Trần Thị B", "Lê Văn C", "Phạm Văn D"][i % 4],
        room: `${100 + i}`,
        gross: 1000000 + (i * 100000),
        commission: (1000000 + (i * 100000)) * 0.1,
        net: (1000000 + (i * 100000)) * 0.9
    }));

    // Lọc dữ liệu theo tìm kiếm
    const filteredData = useMemo(() => {
        return allTransactions.filter(tx =>
            tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.guest.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    // Tính toán dữ liệu hiển thị trên trang hiện tại
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const currentTableData = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * rowsPerPage;
        const lastPageIndex = firstPageIndex + rowsPerPage;
        return filteredData.slice(firstPageIndex, lastPageIndex);
    }, [currentPage, filteredData]);

    const handleConfirm = () => {
        if (window.confirm("Xác nhận đối soát?")) {
            setIsSubmitting(true);
            setTimeout(() => { setStatus("Approved"); setIsSubmitting(false); }, 800);
        }
    };

    return (
        <div className="p-8 bg-[#f8fafc] min-h-screen font-sans text-slate-800">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-black uppercase tracking-tighter">Đối soát </h1>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs"><Printer size={14}/></button>
                        <button className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center gap-2">
                            <Download size={14}/> EXCEL
                        </button>
                    </div>
                </div>

                <StatementHeader gross={46000000} commission={4600000} adjustments={-500000} net={40900000} />

                {/* Khối Bảng Dữ Liệu */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                        <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase text-[10px] tracking-widest">
                            <FileText size={16} className="text-blue-600" /> Danh sách giao dịch ({filteredData.length})
                        </h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input
                                type="text"
                                placeholder="Tìm khách hàng, mã đặt..."
                                className="pl-10 pr-4 py-2 bg-slate-50 rounded-full text-xs outline-none w-64 focus:bg-white border border-transparent focus:border-blue-100 transition-all"
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            />
                        </div>
                    </div>

                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                        <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <th className="px-8 py-4">Mã đặt</th>
                            <th className="px-8 py-4">Khách hàng</th>
                            <th className="px-8 py-4 text-right">Thực nhận (đ)</th>
                            <th className="px-8 py-4"></th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                        {currentTableData.map((tx, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/30 transition-colors group">
                                <td className="px-8 py-4 font-black text-blue-600">{tx.id}</td>
                                <td className="px-8 py-4 font-bold text-slate-700">{tx.guest}</td>
                                <td className="px-8 py-4 text-right font-black text-slate-900">{tx.net.toLocaleString()}</td>
                                <td className="px-8 py-4 text-right">
                                    <button className="text-slate-300 hover:text-blue-600"><ExternalLink size={14}/></button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {/* 5. PHẦN PHÂN TRANG (PAGINATION) */}
                    <div className="px-8 py-4 border-t border-slate-50 flex justify-between items-center bg-white">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Trang {currentPage} / {totalPages}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 border border-slate-100 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 border border-slate-100 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-all"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* 6. ACTION BAR (Gắn kết cuối bảng) */}
                    <div className="bg-slate-900 p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng cộng thực nhận</span>
                            <span className="text-3xl font-black text-white">40.900.000 <span className="text-sm font-normal text-slate-500 italic">VNĐ</span></span>
                        </div>

                        <div className="flex gap-3">
                            {status === "Pending" ? (
                                <>
                                    <button onClick={() => setStatus("Disputed")} className="px-6 py-3 border border-slate-700 text-slate-300 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all">Khiếu nại</button>
                                    <button
                                        onClick={handleConfirm}
                                        className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-500 shadow-xl shadow-blue-900/20 flex items-center gap-2 transition-all active:scale-95"
                                    >
                                        XÁC NHẬN CHI TRẢ <CheckCircle size={18} />
                                    </button>
                                </>
                            ) : (
                                <div className="flex items-center gap-3 text-emerald-400 font-bold text-xs bg-emerald-500/10 px-6 py-3 rounded-2xl border border-emerald-500/20">
                                    <CheckCircle size={16} /> ĐÃ XÁC NHẬN (Audit Log: #29381)
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettlementDetail;