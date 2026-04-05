import {
    TrendingUp, BarChart3, BedDouble, Star,
    CalendarCheck, CalendarMinus, ArrowUpRight
} from "lucide-react";
import {
    DEMO_DASHBOARD_STATS,
    DEMO_RECENT_BOOKINGS,
    DEMO_TASKS,
    DEMO_ROOM_TYPES,
} from "../mockData";

const STATUS_COLORS = {
    CONFIRMED: "bg-blue-100 text-blue-700",
    CHECKED_IN: "bg-green-100 text-green-700",
    CHECKED_OUT: "bg-slate-100 text-slate-600",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-600",
};

const STATUS_LABELS = {
    CONFIRMED: "Đã xác nhận",
    CHECKED_IN: "Đã nhận phòng",
    CHECKED_OUT: "Đã trả phòng",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
};

const formatCurrency = (n) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const DemoDashboard = () => {
    const s = DEMO_DASHBOARD_STATS;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Dashboard
                </h1>
                <p className="text-sm text-slate-400 font-medium">
                Grand Palace Đà Nẵng - Tổng quan hoạt động hôm nay
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                            Doanh thu hôm nay
                        </span>
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-slate-900">
                        {formatCurrency(s.totalRevenue)}
                    </p>
                    <span className="text-xs font-bold text-green-600 flex items-center gap-1 mt-1">
                        <ArrowUpRight size={14} /> +{s.revenueGrowthPercent}% so với hôm qua
                    </span>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                            Tỷ lệ lấp đầy
                        </span>
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                            <BarChart3 size={20} />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-slate-900">
                        {s.occupancyRate}%
                    </p>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                        <div
                            className="bg-emerald-500 h-2 rounded-full"
                            style={{ width: `${s.occupancyRate}%` }}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                            ADR
                        </span>
                        <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                            <BedDouble size={20} />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-slate-900">
                        {formatCurrency(s.adr)}
                    </p>
                    <span className="text-xs text-slate-400 font-medium">
                        Giá phòng trung bình / đêm
                    </span>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                            RevPAR
                        </span>
                        <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                            <Star size={20} />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-slate-900">
                        {formatCurrency(s.revPar)}
                    </p>
                    <span className="text-xs text-slate-400 font-medium">
                        Doanh thu / phòng khả dụng
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent bookings */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                            Booking gần đây
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                                    <th className="text-left px-6 py-3">Mã</th>
                                    <th className="text-left px-3 py-3">Khách</th>
                                    <th className="text-left px-3 py-3">Phòng</th>
                                    <th className="text-left px-3 py-3">Check-in</th>
                                    <th className="text-right px-3 py-3">Doanh thu</th>
                                    <th className="text-center px-6 py-3">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {DEMO_RECENT_BOOKINGS.map((b) => (
                                    <tr
                                        key={b.bookingCode}
                                        className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                                    >
                                        <td className="px-6 py-3 text-xs font-bold text-blue-600">
                                            {b.bookingCode}
                                        </td>
                                        <td className="px-3 py-3">
                                            <p className="text-sm font-bold text-slate-800">
                                                {b.guestName}
                                            </p>
                                            <p className="text-[10px] text-slate-400">
                                                {b.agencyName}
                                            </p>
                                        </td>
                                        <td className="px-3 py-3 text-sm text-slate-600">
                                            {b.roomType}
                                        </td>
                                        <td className="px-3 py-3 text-sm text-slate-600">
                                            {b.checkIn}
                                        </td>
                                        <td className="px-3 py-3 text-sm font-bold text-slate-900 text-right">
                                            {formatCurrency(b.revenue)}
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <span
                                                className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase ${
                                                    STATUS_COLORS[b.status] || "bg-slate-100 text-slate-500"
                                                }`}
                                            >
                                                {STATUS_LABELS[b.status] || b.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right sidebar */}
                <div className="space-y-6">
                    {/* Tasks */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-4">
                            Lịch trình hôm nay
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-4 p-3 bg-green-50 rounded-xl">
                                <CalendarCheck
                                    size={20}
                                    className="text-green-600"
                                />
                                <div>
                                    <p className="text-sm font-bold text-slate-800">
                                        Check-in
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {DEMO_TASKS.checkInsToday} khách
                                    </p>
                                </div>
                                <span className="ml-auto text-lg font-black text-green-600">
                                    {DEMO_TASKS.checkInsToday}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 p-3 bg-amber-50 rounded-xl">
                                <CalendarMinus
                                    size={20}
                                    className="text-amber-600"
                                />
                                <div>
                                    <p className="text-sm font-bold text-slate-800">
                                        Check-out
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {DEMO_TASKS.checkOutsToday} khách
                                    </p>
                                </div>
                                <span className="ml-auto text-lg font-black text-amber-600">
                                    {DEMO_TASKS.checkOutsToday}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Room inventory */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-4">
                            Tồn kho phòng
                        </h3>
                        <div className="space-y-3">
                            {DEMO_ROOM_TYPES.filter((r) => r.isActive).map(
                                (rt) => (
                                    <div
                                        key={rt.id}
                                        className="flex items-center justify-between"
                                    >
                                        <span className="text-sm font-medium text-slate-600">
                                            {rt.title}
                                        </span>
                                        <span className="text-sm font-black text-blue-600">
                                            {rt.availableRooms}/{rt.totalRooms}
                                        </span>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
                        <h3 className="text-xs font-black uppercase tracking-widest text-blue-200 mb-4">
                            Thống kê nhanh
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-blue-100">
                                    Tổng booking
                                </span>
                                <span className="font-black">
                                    {s.totalBookingsToday}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-blue-100">
                                    Phòng đã bán
                                </span>
                                <span className="font-black">
                                    {s.roomsSold}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-blue-100">
                                    RevPAR
                                </span>
                                <span className="font-black">
                                    {formatCurrency(s.revPar)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DemoDashboard;
