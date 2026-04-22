import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, Loader2, Search } from "lucide-react";
import { payoutService } from "@/services/payout.service.js";
import { format } from "date-fns";

const STATUS_CONFIG = {
    PENDING_CONFIRMATION: { label: "Chờ xác nhận", color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
    APPROVED: { label: "Sẵn sàng", color: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500" },
    PROCESSING: { label: "Đang xử lý", color: "bg-indigo-100 text-indigo-700 border-indigo-200", dot: "bg-indigo-500 animate-pulse" },
    PAID: { label: "Đã thanh toán", color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
    ROLLOVER: { label: "Chuyển kỳ sau", color: "bg-gray-100 text-gray-600 border-gray-200", dot: "bg-gray-400" },
    DISPUTED: { label: "Khiếu nại", color: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" },
    DRAFT: { label: "Nháp", color: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" },
};
const formatMoney = (val) => Number(val || 0).toLocaleString("vi-VN");

const PayoutStatementOverview = () => {
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [payoutData, setPayoutData] = useState({ payouts: [] });

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = { includeDisputed: true };
            if (dateFrom && dateTo) {
                params.periodStart = dateFrom;
                params.periodEnd = dateTo;
            }
            const res = await payoutService.getPayoutList(params);
            setPayoutData(res?.result || { payouts: [] });
        } catch (error) {
            console.error("Failed to load statement overview", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredRows = useMemo(() => {
        const rows = payoutData?.payouts || [];
        if (!searchTerm.trim()) return rows;
        const term = searchTerm.toLowerCase();
        return rows.filter((item) =>
            (item.hotelName || "").toLowerCase().includes(term)
            || (item.statementCode || "").toLowerCase().includes(term)
        );
    }, [payoutData, searchTerm]);

    const summary = useMemo(() => {
        const rows = filteredRows;
        const uniqueHotels = new Set(rows.map((r) => r.hotelId)).size;
        const totalNet = rows.reduce((sum, r) => sum + Number(r.netPayout || 0), 0);
        const paidNet = rows
            .filter((r) => r.status === "PAID")
            .reduce((sum, r) => sum + Number(r.netPayout || 0), 0);
        return {
            totalStatements: rows.length,
            totalHotels: uniqueHotels,
            totalNet,
            paidNet,
        };
    }, [filteredRows]);

    return (
        <div className="p-8 bg-[#f8fafc] min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 uppercase">Tổng Statement Khách Sạn</h1>
                    <p className="text-sm text-slate-500 font-medium">Theo dõi toàn bộ kỳ đối soát theo mốc thời gian</p>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Tìm kiếm</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Khách sạn hoặc mã sao kê"
                                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                            />
                            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Từ ngày</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Đến ngày</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={fetchData}
                            className="w-full py-3 rounded-xl bg-slate-900 text-white text-sm font-bold flex items-center justify-center gap-2"
                        >
                            <CalendarDays size={16} /> Lọc
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <SummaryCard label="Tổng sao kê" value={summary.totalStatements} color="text-slate-800" />
                    <SummaryCard label="Số khách sạn" value={summary.totalHotels} color="text-blue-700" />
                    <SummaryCard label="Tổng thực nhận" value={`${formatMoney(summary.totalNet)} VND`} color="text-slate-800" />
                    <SummaryCard label="Đã thanh toán" value={`${formatMoney(summary.paidNet)} VND`} color="text-emerald-700" />
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <tr>
                                    <th className="px-4 py-3">Mã sao kê</th>
                                    <th className="px-4 py-3">Khách sạn</th>
                                    <th className="px-4 py-3">Kỳ sao kê</th>
                                    <th className="px-4 py-3">Trạng thái</th>
                                    <th className="px-4 py-3 text-right">Thực nhận</th>
                                    <th className="px-4 py-3 text-right">Thời gian paid</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="py-16 text-center">
                                            <Loader2 size={30} className="animate-spin mx-auto text-blue-600" />
                                        </td>
                                    </tr>
                                ) : filteredRows.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-16 text-center text-xs text-slate-400 font-bold uppercase">Không có dữ liệu</td>
                                    </tr>
                                ) : (
                                    filteredRows.map((item) => (
                                        <tr key={item.statementId} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-3 font-black text-blue-700">{item.statementCode}</td>
                                            <td className="px-4 py-3 font-semibold text-slate-700">{item.hotelName}</td>
                                            <td className="px-4 py-3 text-slate-600">
                                                {item.periodStart ? format(new Date(item.periodStart), "dd/MM/yyyy") : "-"}
                                                <span className="mx-1">-</span>
                                                {item.periodEnd ? format(new Date(item.periodEnd), "dd/MM/yyyy") : "-"}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${STATUS_CONFIG[item.status]?.color || STATUS_CONFIG.DRAFT.color
                                                        }`}
                                                >
                                                    {STATUS_CONFIG[item.status]?.label || item.status || "N/A"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-black text-slate-800">{formatMoney(item.netPayout)}</td>
                                            <td className="px-4 py-3 text-right text-slate-600">
                                                {item.paidAt ? format(new Date(item.paidAt), "dd/MM/yyyy HH:mm") : "-"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SummaryCard = ({ label, value, color }) => (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <h3 className={`text-xl font-black ${color}`}>{value}</h3>
    </div>
);

export default PayoutStatementOverview;
