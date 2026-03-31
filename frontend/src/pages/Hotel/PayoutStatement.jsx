import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    FileText, CheckCircle, AlertCircle, Download,
    ArrowLeft, History, Search, ExternalLink, Printer,
    ChevronLeft, ChevronRight, Loader2
} from "lucide-react";
import StatementHeader from '@/components/hotel/finance/StatementHeader';
import { payoutService } from '@/services/payout.service';
import { toast } from 'react-hot-toast';

const STATUS_MAP = {
    PENDING_CONFIRMATION: { label: "Chờ xác nhận", color: "bg-amber-100 text-amber-700" },
    APPROVED: { label: "Đã xác nhận", color: "bg-emerald-100 text-emerald-700" },
    PROCESSING: { label: "Đang xử lý", color: "bg-blue-100 text-blue-700" },
    PAID: { label: "Đã thanh toán", color: "bg-green-100 text-green-700" },
    DISPUTED: { label: "Khiếu nại", color: "bg-red-100 text-red-700" },
    ROLLOVER: { label: "Chuyển kỳ sau", color: "bg-slate-100 text-slate-600" },
};

const formatVN = (val) => val != null ? new Intl.NumberFormat('vi-VN').format(val) : '0';

// ===================== STATEMENT LIST VIEW =====================
const StatementListView = ({ hotelId, onSelectStatement }) => {
    const [statements, setStatements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatements = async () => {
            setLoading(true);
            try {
                const res = await payoutService.getHotelStatements(hotelId);
                if (res.code === 1000) {
                    setStatements(res.result || []);
                }
            } catch (error) {
                console.error("Lỗi tải danh sách đối soát:", error);
                toast.error("Không thể tải danh sách đối soát");
            } finally {
                setLoading(false);
            }
        };
        if (hotelId) fetchStatements();
    }, [hotelId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    if (statements.length === 0) {
        return (
            <div className="text-center py-20 text-slate-400">
                <FileText size={48} className="mx-auto mb-4 opacity-40" />
                <p className="font-bold">Chưa có bảng đối soát nào</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-50">
                <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase text-[10px] tracking-widest">
                    <History size={16} className="text-blue-600" /> Tất cả các kỳ đối soát ({statements.length})
                </h3>
            </div>
            <table className="w-full text-left text-sm border-collapse">
                <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="px-8 py-4">Mã</th>
                        <th className="px-8 py-4">Kỳ</th>
                        <th className="px-8 py-4">Bookings</th>
                        <th className="px-8 py-4 text-right">Thực nhận</th>
                        <th className="px-8 py-4">Trạng thái</th>
                        <th className="px-8 py-4"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {statements.map((stmt) => {
                        const statusInfo = STATUS_MAP[stmt.status] || { label: stmt.status, color: "bg-slate-100 text-slate-600" };
                        return (
                            <tr key={stmt.statementId} className="hover:bg-slate-50/30 transition-colors group">
                                <td className="px-8 py-4 font-black text-blue-600">{stmt.statementCode}</td>
                                <td className="px-8 py-4 font-bold text-slate-700">
                                    {stmt.periodStart} ~ {stmt.periodEnd}
                                </td>
                                <td className="px-8 py-4 font-bold text-slate-600">{stmt.totalBookings}</td>
                                <td className="px-8 py-4 text-right font-black text-slate-900">
                                    {formatVN(stmt.netPayout)} <span className="text-xs text-slate-400">d</span>
                                </td>
                                <td className="px-8 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${statusInfo.color}`}>
                                        {statusInfo.label}
                                    </span>
                                </td>
                                <td className="px-8 py-4 text-right">
                                    <button
                                        onClick={() => onSelectStatement(stmt.statementId)}
                                        className="text-slate-300 hover:text-blue-600 transition-colors"
                                    >
                                        <ExternalLink size={14} />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

// ===================== STATEMENT DETAIL VIEW =====================
const StatementDetailView = ({ statementId, onBack }) => {
    const [statement, setStatement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;

    const fetchDetail = useCallback(async () => {
        setLoading(true);
        try {
            const res = await payoutService.getHotelStatementDetail(statementId);
            if (res.code === 1000) {
                setStatement(res.result);
            }
        } catch (error) {
            console.error("Lỗi tải chi tiết đối soát:", error);
            toast.error("Không thể tải chi tiết đối soát");
        } finally {
            setLoading(false);
        }
    }, [statementId]);

    useEffect(() => {
        if (statementId) fetchDetail();
    }, [statementId, fetchDetail]);

    const lineItems = statement?.lineItems || [];

    const filteredData = useMemo(() => {
        return lineItems.filter(item =>
            (item.bookingCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.agencyName || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, lineItems]);

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const currentTableData = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * rowsPerPage;
        const lastPageIndex = firstPageIndex + rowsPerPage;
        return filteredData.slice(firstPageIndex, lastPageIndex);
    }, [currentPage, filteredData]);

    const handleConfirm = async () => {
        if (!window.confirm("Xác nhận đối soát kỳ này?")) return;
        setIsSubmitting(true);
        try {
            const res = await payoutService.confirmPayout(statementId);
            if (res.code === 1000) {
                toast.success("Xac nhan doi soat thanh cong!");
                setStatement(res.result);
            }
        } catch (error) {
            console.error("Lỗi xác nhận đối soát:", error);
            toast.error(error.response?.data?.message || "Xác nhận thất bại");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDispute = async () => {
        const reason = window.prompt("Nhập lý do khiếu nại:");
        if (!reason) return;
        setIsSubmitting(true);
        try {
            const res = await payoutService.disputePayout(statementId, "OTHER", reason);
            if (res.code === 1000) {
                toast.success("Gửi đơn khiếu nại thành công!");
                setStatement(res.result);
            }
        } catch (error) {
            console.error("Lỗi gửi khiếu nại:", error);
            toast.error(error.response?.data?.message || "Gửi đơn khiếu nại thất bại");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    if (!statement) {
        return <div className="text-center py-20 text-slate-400">Không tìm thấy dữ liệu đối soát</div>;
    }

    const status = statement.status;
    const isPending = status === "PENDING_CONFIRMATION";

    return (
        <>
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter">Đối soát</h1>
                        <span className="text-xs text-slate-400 font-bold">{statement.statementCode} | {statement.periodStart} ~ {statement.periodEnd}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs"><Printer size={14}/></button>
                    <button className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center gap-2">
                        <Download size={14}/> EXCEL
                    </button>
                </div>
            </div>

            <StatementHeader
                gross={statement.grossRevenue || 0}
                commission={statement.totalCommission || 0}
                adjustments={statement.adjustments || 0}
                net={statement.netPayout || 0}
            />

            {/* Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase text-[10px] tracking-widest">
                        <FileText size={16} className="text-blue-600" /> Danh sách giao dịch ({filteredData.length})
                    </h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            placeholder="Tim ma dat, dai ly..."
                            className="pl-10 pr-4 py-2 bg-slate-50 rounded-full text-xs outline-none w-64 focus:bg-white border border-transparent focus:border-blue-100 transition-all"
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                </div>

                <table className="w-full text-left text-sm border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <th className="px-8 py-4">Mã đặt</th>
                            <th className="px-8 py-4">Đại lý</th>
                            <th className="px-8 py-4">Check-in</th>
                            <th className="px-8 py-4">Đêm</th>
                            <th className="px-8 py-4 text-right">Tổng (d)</th>
                            <th className="px-8 py-4 text-right">Hoa hồng (d)</th>
                            <th className="px-8 py-4 text-right">Thực nhận (d)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {currentTableData.map((item) => (
                            <tr key={item.lineItemId} className="hover:bg-slate-50/30 transition-colors">
                                <td className="px-8 py-4 font-black text-blue-600">{item.bookingCode}</td>
                                <td className="px-8 py-4 font-bold text-slate-700">{item.agencyName || '-'}</td>
                                <td className="px-8 py-4 text-slate-600">{item.checkInDate}</td>
                                <td className="px-8 py-4 text-slate-600">{item.roomNights}</td>
                                <td className="px-8 py-4 text-right font-bold text-slate-900">{formatVN(item.grossAmount)}</td>
                                <td className="px-8 py-4 text-right font-bold text-red-500">-{formatVN(item.commissionAmount)}</td>
                                <td className="px-8 py-4 text-right font-black text-slate-900">{formatVN(item.netAmount)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
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
                )}

                {/* Action Bar */}
                <div className="bg-slate-900 p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng cộng thực nhận</span>
                        <span className="text-3xl font-black text-white">
                            {formatVN(statement.netPayout)} <span className="text-sm font-normal text-slate-500 italic">VND</span>
                        </span>
                    </div>

                    <div className="flex gap-3">
                        {isPending ? (
                            <>
                                <button
                                    onClick={handleDispute}
                                    disabled={isSubmitting}
                                    className="px-6 py-3 border border-slate-700 text-slate-300 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50"
                                >
                                    Khiếu nại
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={isSubmitting}
                                    className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-500 shadow-xl shadow-blue-900/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                    XÁC NHẬN CHI TRẢ
                                </button>
                            </>
                        ) : (
                            <div className={`flex items-center gap-3 font-bold text-xs px-6 py-3 rounded-2xl border ${
                                status === "DISPUTED"
                                    ? "text-red-400 bg-red-500/10 border-red-500/20"
                                    : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                            }`}>
                                {status === "DISPUTED" ? (
                                    <><AlertCircle size={16} /> ĐÃ KHIẾU NẠI</>
                                ) : (
                                    <><CheckCircle size={16} /> ĐÃ XÁC NHẬN {statement.confirmedAt ? ` (${new Date(statement.confirmedAt).toLocaleDateString('vi-VN')})` : ''}</>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

// ===================== MAIN COMPONENT =====================
const SettlementDetail = ({ hotelId: propHotelId }) => {
    const [selectedStatementId, setSelectedStatementId] = useState(null);

    // Get hotelId from props or localStorage
    const hotelId = useMemo(() => {
        if (propHotelId) return propHotelId;
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            return user?.hotelId || null;
        } catch { return null; }
    }, [propHotelId]);

    return (
        <div className="p-8 bg-[#f8fafc] min-h-screen font-sans text-slate-800">
            <div className="max-w-7xl mx-auto space-y-6">
                {!selectedStatementId ? (
                    <>
                        <div className="flex items-center gap-4 mb-4">
                            <h1 className="text-2xl font-black uppercase tracking-tighter">Đối Soát</h1>
                        </div>
                        <StatementListView hotelId={hotelId} onSelectStatement={setSelectedStatementId} />
                    </>
                ) : (
                    <StatementDetailView
                        statementId={selectedStatementId}
                        onBack={() => setSelectedStatementId(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default SettlementDetail;