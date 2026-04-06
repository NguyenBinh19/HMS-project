import { useNavigate } from "react-router-dom";
import {
    TrendingUp, BedDouble, Star, Clock,
    RefreshCcw, CheckCircle2, ChevronRight,
    CalendarCheck, CalendarMinus, ArrowUpRight
} from "lucide-react";
import {
    DEMO_DASHBOARD_STATS,
    DEMO_RECENT_BOOKINGS,
    DEMO_TASKS,
    DEMO_ROOM_TYPES,
} from "../mockData";

const STATUS_COLORS = {
    CONFIRMED: "bg-blue-100 text-blue-600",
    CHECKED_IN: "bg-amber-100 text-amber-600",
    CHECKED_OUT: "bg-slate-100 text-slate-600",
    COMPLETED: "bg-emerald-100 text-emerald-600",
    CANCELLED: "bg-rose-100 text-rose-600",
};

const STATUS_LABELS = {
    CONFIRMED: "Đã xác nhận",
    CHECKED_IN: "Đã nhận phòng",
    CHECKED_OUT: "Đã trả phòng",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
};

const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount || 0);

const DemoDashboard = () => {
    const s = DEMO_DASHBOARD_STATS;
    const navigate = useNavigate();

    return (
        <div className="p-10 bg-[#F4F7FE] min-h-screen font-sans antialiased text-[#1B2559]">
            <div className="max-w-[1600px] mx-auto space-y-10">

                {/* HEADER */}
                <div className="flex justify-between items-center">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-[#1B2559]">Dashboard</h1>
                        <p className="text-[#A3AED0] font-bold text-sm">Grand Palace Da Nang - Theo doi hoat dong van hanh thoi gian thuc</p>
                    </div>
                </div>

                {/* KPI INDICATORS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
                    <StatCard
                        label="Doanh thu hôm nay"
                        value={formatCurrency(s.totalRevenue)}
                        sub={`+${s.revenueGrowthPercent}%`}
                        subColor="text-[#05CD99]"
                        footer="So với kỳ trước"
                        icon={<TrendingUp size={20} />}
                    />
                    <StatCard
                        label="Công suất phòng"
                        value={s.occupancyRate + "%"}
                        progress={s.occupancyRate}
                        footer={`Đã bán ${s.roomsSold}/90 phòng`}
                        icon={<BedDouble size={20} />}
                    />
                    <StatCard
                        label="Giá trung bình (ADR)"
                        value={formatCurrency(s.adr)}
                        footer="Doanh thu TB trên mỗi phòng"
                        icon={<Star size={20} />}
                    />
                    <StatCard
                        label="RevPAR"
                        value={formatCurrency(s.revPar)}
                        footer="Doanh thu / phòng khả dụng"
                        icon={<Star size={20} />}
                    />
                </div>

                <div className="grid grid-cols-12 gap-8">
                    {/* LEFT COLUMN: Booking table */}
                    <div className="col-span-12 lg:col-span-8">
                        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden h-full">
                            <div className="p-8 flex justify-between items-center">
                                <h3 className="text-lg font-black uppercase tracking-tighter">5 Đơn gần nhất</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#F4F7FE]/50 text-[11px] font-black text-[#A3AED0] uppercase tracking-widest">
                                        <tr>
                                            <th className="px-8 py-5">Khách hàng</th>
                                            <th className="px-4 py-5">Lưu trú</th>
                                            <th className="px-4 py-5">Doanh thu</th>
                                            <th className="px-4 py-5">Trạng thái</th>
                                            <th className="px-8 py-5 text-right">Mã đơn</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {DEMO_RECENT_BOOKINGS.map((b, idx) => (
                                            <tr key={idx} className="hover:bg-[#F4F7FE]/50 transition-all">
                                                <td className="px-8 py-6">
                                                    <p className="text-sm font-black">{b.guestName}</p>
                                                    <p className="text-[11px] font-bold text-[#A3AED0]">{b.agencyName}</p>
                                                </td>
                                                <td className="px-4 py-6 text-xs font-bold text-[#A3AED0]">
                                                    {b.checkIn} <br/>
                                                    <span className="text-[#1B2559]">{b.roomType}</span>
                                                </td>
                                                <td className="px-4 py-6 text-sm font-black">{formatCurrency(b.revenue)}</td>
                                                <td className="px-4 py-6">
                                                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${STATUS_COLORS[b.status] || "bg-slate-100 text-slate-600"}`}>
                                                        {STATUS_LABELS[b.status] || b.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right font-black text-[#4318FF] text-xs">{b.bookingCode}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Tasks & Room inventory */}
                    <div className="col-span-12 lg:col-span-4 space-y-8">
                        {/* Task List */}
                        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
                            <h3 className="text-lg font-black uppercase mb-8 flex items-center gap-2">
                                <Clock size={20} className="text-[#4318FF]" /> Lịch trình hôm nay
                            </h3>
                            <div className="space-y-6">
                                <TaskItem
                                    color="#4318FF"
                                    title="Check-in sắp đến"
                                    desc={`${DEMO_TASKS.checkInsToday} đơn đặt phòng`}
                                    link="Xem"
                                />
                                <TaskItem
                                    color="#FFB547"
                                    title="Check-out hôm nay"
                                    desc={`${DEMO_TASKS.checkOutsToday} đơn khách trả phòng`}
                                    link="Xem"
                                />
                            </div>
                        </div>

                        {/* Room Type Inventory */}
                        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-black uppercase tracking-tighter">Kho phòng trống</h3>
                                <button
                                    onClick={() => navigate("/demo/hotel/room-types")}
                                    className="text-[10px] font-black text-[#4318FF] uppercase hover:underline flex items-center gap-1"
                                >
                                    Chi tiết <ChevronRight size={14} />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {DEMO_ROOM_TYPES.filter((r) => r.isActive).map((rt) => (
                                    <div
                                        key={rt.id}
                                        className="flex justify-between items-center p-4 border border-slate-50 rounded-2xl bg-[#F4F7FE]/50 hover:bg-white hover:shadow-sm transition-all group cursor-pointer"
                                        onClick={() => navigate("/demo/hotel/room-types")}
                                    >
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-black text-[#1B2559] truncate">{rt.title}</p>
                                            <p className="text-[10px] font-bold text-[#A3AED0] uppercase">{rt.description}</p>
                                        </div>
                                        <div className="text-right shrink-0 ml-4">
                                            <p className="text-lg font-black text-[#4318FF]">{rt.availableRooms}</p>
                                            <p className="text-[9px] font-black text-[#A3AED0] uppercase">Trống</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Operational Stats */}
                        <div className="bg-gradient-to-br from-[#4318FF] to-[#707EFF] rounded-[32px] shadow-lg p-8 text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-lg font-black uppercase mb-6">Chỉ số vận hành</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                                        <span className="text-sm font-bold text-white/80">Tổng đơn đặt:</span>
                                        <span className="text-lg font-black">{s.totalBookingsToday}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                                        <span className="text-sm font-bold text-white/80">RevPAR:</span>
                                        <span className="text-lg font-black">{formatCurrency(s.revPar)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3">
                                        <span className="text-sm font-bold text-white/80">Phòng đã bán:</span>
                                        <span className="text-lg font-black">{s.roomsSold}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, sub, subColor, footer, progress, icon }) => (
    <div className="bg-white p-7 rounded-[32px] shadow-sm border border-slate-100 group hover:shadow-md transition-all">
        <div className="flex justify-between items-start mb-4">
            <p className="text-[11px] font-black text-[#A3AED0] uppercase tracking-[0.15em]">{label}</p>
            <div className="p-3 bg-[#F4F7FE] text-[#4318FF] rounded-2xl group-hover:bg-[#4318FF] group-hover:text-white transition-all">{icon}</div>
        </div>
        <div className="space-y-1">
            <h2 className="text-2xl font-black text-[#1B2559]">{value}</h2>
            {sub && <p className={`text-xs font-bold ${subColor}`}>{sub}</p>}
        </div>
        {progress !== undefined && (
            <div className="mt-4 h-1.5 w-full bg-[#F4F7FE] rounded-full overflow-hidden">
                <div className="h-full bg-[#4318FF]" style={{ width: `${progress}%` }}></div>
            </div>
        )}
        <p className="mt-4 text-[10px] font-bold text-[#A3AED0] uppercase">{footer}</p>
    </div>
);

const TaskItem = ({ color, title, desc, link }) => (
    <div className="flex gap-4 group cursor-pointer hover:bg-slate-50 p-2 -m-2 rounded-xl transition-all">
        <div className="w-1 h-10 rounded-full" style={{ backgroundColor: color }}></div>
        <div className="flex-1">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-black">{title}</h4>
                <span className="text-[10px] font-bold text-[#4318FF] uppercase group-hover:underline">{link}</span>
            </div>
            <p className="text-xs font-bold text-[#A3AED0]">{desc}</p>
        </div>
    </div>
);

export default DemoDashboard;
