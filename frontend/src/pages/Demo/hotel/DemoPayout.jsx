import { useState } from "react";
import { ChevronDown, ChevronUp, FileText, CheckCircle, Clock, AlertCircle, CheckSquare } from "lucide-react";
import { DEMO_PAYOUT_STATEMENTS, DEMO_PAYOUT_DETAIL } from "../mockData";

const formatCurrency = (n) =>
    new Intl.NumberFormat("vi-VN").format(n);

const statusConfig = {
    PAID: {
        label: "Đã thanh toán",
        icon: CheckCircle,
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
    },
    APPROVED: {
        label: "Đã xác nhận",
        icon: CheckSquare,
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
    },
    PENDING_CONFIRMATION: {
        label: "Chờ xác nhận",
        icon: Clock,
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
    },
    PROCESSING: {
        label: "Đang xử lý",
        icon: AlertCircle,
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
    },
};

const DemoPayout = () => {
    const [expandedId, setExpandedId] = useState(null);
    const [confirmed, setConfirmed] = useState(false);

    const toggleExpand = (id) =>
        setExpandedId(expandedId === id ? null : id);

    const totalPaid = DEMO_PAYOUT_STATEMENTS
        .filter((s) => s.status === "PAID")
        .reduce((sum, s) => sum + s.netPayout, 0);

    const totalPending = DEMO_PAYOUT_STATEMENTS
        .filter((s) => s.status !== "PAID")
        .reduce((sum, s) => sum + s.netPayout, 0);

    const handleConfirm = (stmtId) => {
        setConfirmed(true);
        setTimeout(() => setConfirmed(false), 3000);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Bảng kê thanh toán
                </h1>
                <p className="text-sm text-slate-400 font-medium">
                    Theo dõi trạng thái thanh toán và chi tiết các kỳ đối soát (Kỳ: 26 tháng trước - 25 tháng sau)
                </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Tổng đã thanh toán
                    </p>
                    <p className="text-2xl font-black text-green-600">
                        {formatCurrency(totalPaid)} VND
                    </p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Đang chờ xử lý
                    </p>
                    <p className="text-2xl font-black text-amber-600">
                        {formatCurrency(totalPending)} VND
                    </p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Số kỳ thanh toán
                    </p>
                    <p className="text-2xl font-black text-slate-800">
                        {DEMO_PAYOUT_STATEMENTS.length}
                    </p>
                </div>
            </div>

            {confirmed && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle size={20} className="text-green-600" />
                    <span className="text-sm font-bold text-green-700">
                        Xác nhận đối soát thành công! (Demo)
                    </span>
                </div>
            )}

            <div className="space-y-4">
                {DEMO_PAYOUT_STATEMENTS.map((stmt) => {
                    const sc = statusConfig[stmt.status] || statusConfig.PENDING_CONFIRMATION;
                    const StatusIcon = sc.icon;
                    const isExpanded = expandedId === stmt.id;

                    return (
                        <div
                            key={stmt.id}
                            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
                        >
                            <div
                                className="flex items-center justify-between px-6 py-5 cursor-pointer"
                                onClick={() => toggleExpand(stmt.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                                        <FileText
                                            size={20}
                                            className="text-blue-600"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-800">
                                            {stmt.periodLabel}
                                        </p>
                                        <p className="text-xs text-slate-400 font-medium">
                                            {stmt.totalBookings} đặt phòng · {stmt.statementCode}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-sm font-black text-slate-800">
                                            {formatCurrency(stmt.netPayout)} VND
                                        </p>
                                        <p className="text-[10px] text-slate-400">
                                            Hoa hồng:{" "}
                                            {formatCurrency(stmt.totalCommission)} VND
                                        </p>
                                    </div>
                                    <span
                                        className={`flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full ${sc.bg} ${sc.text} border ${sc.border}`}
                                    >
                                        <StatusIcon size={12} />
                                        {sc.label}
                                    </span>
                                    {stmt.status === "PENDING_CONFIRMATION" && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleConfirm(stmt.id);
                                            }}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-black hover:bg-blue-700 transition-colors"
                                        >
                                            Xác nhận
                                        </button>
                                    )}
                                    {isExpanded ? (
                                        <ChevronUp
                                            size={18}
                                            className="text-slate-400"
                                        />
                                    ) : (
                                        <ChevronDown
                                            size={18}
                                            className="text-slate-400"
                                        />
                                    )}
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="border-t border-slate-100 px-6 py-5 bg-slate-50/50">
                                    <div className="grid grid-cols-4 gap-4 mb-5">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                                                Tổng doanh thu
                                            </p>
                                            <p className="text-sm font-black text-slate-800">
                                                {formatCurrency(
                                                    DEMO_PAYOUT_DETAIL.grossRevenue
                                                )}{" "}
                                                VND
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                                                Hoa hồng nền tảng
                                            </p>
                                            <p className="text-sm font-black text-red-500">
                                                -
                                                {formatCurrency(
                                                    DEMO_PAYOUT_DETAIL.platformCommission
                                                )}{" "}
                                                VND
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                                                Thuế
                                            </p>
                                            <p className="text-sm font-black text-red-500">
                                                -
                                                {formatCurrency(
                                                    DEMO_PAYOUT_DETAIL.tax
                                                )}{" "}
                                                VND
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                                                Thực nhận
                                            </p>
                                            <p className="text-sm font-black text-green-600">
                                                {formatCurrency(
                                                    DEMO_PAYOUT_DETAIL.netPayout
                                                )}{" "}
                                                VND
                                            </p>
                                        </div>
                                    </div>
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <th className="text-left py-2">
                                                    Mã đặt phòng
                                                </th>
                                                <th className="text-left py-2">
                                                    Khách hàng
                                                </th>
                                                <th className="text-center py-2">
                                                    Đúng kỳ
                                                </th>
                                                <th className="text-right py-2">
                                                    Số tiền
                                                </th>
                                                <th className="text-right py-2">
                                                    Hoa hồng
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {DEMO_PAYOUT_DETAIL.bookings.map(
                                                (b, i) => (
                                                    <tr
                                                        key={i}
                                                        className="border-b border-slate-100"
                                                    >
                                                        <td className="py-2 font-bold text-blue-600">
                                                            {b.bookingCode}
                                                        </td>
                                                        <td className="py-2 text-slate-600">
                                                            {b.guestName}
                                                        </td>
                                                        <td className="py-2 text-center">
                                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                                                b.paidOnTime
                                                                    ? "bg-green-50 text-green-600"
                                                                    : "bg-amber-50 text-amber-600"
                                                            }`}>
                                                                {b.paidOnTime ? "Đúng kỳ" : "Sau kỳ"}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 text-right font-bold text-slate-700">
                                                            {formatCurrency(
                                                                b.amount
                                                            )}
                                                        </td>
                                                        <td className="py-2 text-right text-red-500 font-bold">
                                                            -
                                                            {formatCurrency(
                                                                b.commission
                                                            )}
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DemoPayout;
