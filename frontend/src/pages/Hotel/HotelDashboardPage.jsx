import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp, BedDouble, Star, Clock,
    RefreshCcw, Loader2, CheckCircle2,
    ChevronRight, LayoutGrid, MessageSquare
} from 'lucide-react';
import { bookingService } from '@/services/booking.service';
import { revenueService } from '@/services/revenue.service';
import { roomTypeService } from '@/services/roomtypes.service';
import { jwtDecode } from "jwt-decode";

const HotelDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const navigate = useNavigate();
    const [liveBookings, setLiveBookings] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [feedbackStats, setFeedbackStats] = useState(null);
    const [tasks, setTasks] = useState({ checkins: 0, checkouts: 0 });

    const getHotelIdFromToken = () => {
        const token = localStorage.getItem("accessToken");
        if (!token) return null;
        try {
            const decoded = jwtDecode(token);
            return decoded.hotelId || decoded.hotel_id || JSON.parse(localStorage.getItem("user"))?.hotelId;
        } catch (error) {
            return null;
        }
    };

    const fetchData = async () => {
        const hotelId = getHotelIdFromToken();
        if (!hotelId) return;

        setLoading(true);
        const today = new Date().toISOString().split('T')[0];

        try {
            const results = await Promise.allSettled([
                revenueService.getRevenueReport(hotelId, { startDate: today, endDate: today, granularity: 'DAILY' }),
                bookingService.viewAllBookingByAdmin(),
                bookingService.getHotelFeedbackStats(),
                bookingService.getCheckInToday(),
                bookingService.getTodayDepartures(),
                roomTypeService.getRoomTypesDetailByHotelId(hotelId)
            ]);

            if (results[0].status === 'fulfilled' && results[0].value.code === 1000) {
                setStats(results[0].value.result.summary);
            }

            if (results[1].status === 'fulfilled' && results[1].value.code === 1000) {
                const allBookings = results[1].value.result || [];
                const sorted = [...allBookings]
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5);
                setLiveBookings(sorted);
            }

            if (results[2].status === 'fulfilled') {
                setFeedbackStats(results[2].value.result);
            }

            setTasks({
                checkins: results[3].status === 'fulfilled' ? (results[3].value.result?.length || 0) : 0,
                checkouts: results[4].status === 'fulfilled' ? (results[4].value.result?.length || 0) : 0
            });

            if (results[5].status === 'fulfilled' && results[5].value.code === 1000) {
                setRoomTypes(results[5].value.result || []);
            }

        } catch (error) {
            console.error("Lỗi Dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 300000);
        return () => clearInterval(interval);
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    };

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F4F7FE]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={48} className="animate-spin text-[#4318FF]" />
                    <p className="text-[#1B2559] font-bold">Đang đồng bộ dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-10 bg-[#F4F7FE] min-h-screen font-sans antialiased text-[#1B2559]">
            <div className="max-w-[1600px] mx-auto space-y-10">

                {/* HEADER */}
                <div className="flex justify-between items-center">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-[#1B2559]">Dashboard</h1>
                        <p className="text-[#A3AED0] font-bold text-sm">Theo dõi hoạt động vận hành thời gian thực</p>
                    </div>
                    <button onClick={fetchData}
                            className="p-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all active:scale-95 text-[#4318FF]">
                        <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {/* KPI INDICATORS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
                    <StatCard
                        label="Doanh thu hôm nay"
                        value={formatCurrency(stats?.totalRevenue)}
                        sub={`${stats?.revenueGrowthPercent ? (stats.revenueGrowthPercent >= 0 ? '+' : '') + stats.revenueGrowthPercent : '0'}%`}
                        subColor={stats?.revenueGrowthPercent >= 0 ? "text-[#05CD99]" : "text-rose-500"}
                        footer="So với kỳ trước"
                        icon={<TrendingUp size={20} />}
                    />
                    <StatCard
                        label="Công suất phòng"
                        value={(stats?.occupancyRate || 0) + "%"}
                        progress={stats?.occupancyRate || 0}
                        footer={`Đã bán ${stats?.totalRoomNightsSold || 0}/${stats?.totalRoomNightsAvailable || 0} phòng`}
                        icon={<BedDouble size={20} />}
                    />
                    <StatCard
                        label="Giá trung bình (ADR)"
                        value={formatCurrency(stats?.adr)}
                        footer="Doanh thu TB trên mỗi phòng"
                        icon={<Star size={20} />}
                    />
                    <TrustScoreCard score={feedbackStats?.trustScore || 0} />
                </div>

                <div className="grid grid-cols-12 gap-8">
                    {/* LEFT COLUMN: Giao dịch mới nhất */}
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
                                    {liveBookings.map((b, idx) => (
                                        <tr key={idx} className="hover:bg-[#F4F7FE]/50 transition-all">
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-black">{b.guestName}</p>
                                                <p className="text-[11px] font-bold text-[#A3AED0]">{b.agencyName}</p>
                                            </td>
                                            <td className="px-4 py-6 text-xs font-bold text-[#A3AED0]">
                                                {b.checkInDate} <br/>
                                                <span className="text-[#1B2559]">{b.totalRooms} phòng</span>
                                            </td>
                                            <td className="px-4 py-6 text-sm font-black">{formatCurrency(b.finalAmount)}</td>
                                            <td className="px-4 py-6"><StatusBadge status={b.bookingStatus}/></td>
                                            <td className="px-8 py-6 text-right font-black text-[#4318FF] text-xs">{b.bookingCode}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Lịch trình & Kho phòng */}
                    <div className="col-span-12 lg:col-span-4 space-y-8">
                        {/* Task List */}
                        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
                            <h3 className="text-lg font-black uppercase mb-8 flex items-center gap-2">
                                <Clock size={20} className="text-[#4318FF]"/> Lịch trình hôm nay
                            </h3>
                            <div className="space-y-6">
                                <TaskItem
                                    color="#4318FF"
                                    title="Check-in sắp đến"
                                    desc={`${tasks.checkins} đơn đặt phòng`}
                                    link="Xem"
                                    onClick={() => navigate('/hotel/front-desk')}
                                />
                                <TaskItem
                                    color="#FFB547"
                                    title="Check-out hôm nay"
                                    desc={`${tasks.checkouts} đơn khách trả phòng`}
                                    link="Xem"
                                    onClick={() => navigate('/hotel/front-desk')}
                                />
                            </div>
                        </div>

                        {/* Room Type Inventory - Chuyển sang bên phải */}
                        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-black uppercase tracking-tighter">Kho phòng trống</h3>
                                <button
                                    onClick={() => navigate('/hotel/room-types')}
                                    className="text-[10px] font-black text-[#4318FF] uppercase hover:underline flex items-center gap-1"
                                >
                                    Chi tiết <ChevronRight size={14}/>
                                </button>
                            </div>
                            <div className="space-y-3">
                                {roomTypes.slice(0, 5).map((type) => (
                                    <div key={type.roomTypeId}
                                         className="flex justify-between items-center p-4 border border-slate-50 rounded-2xl bg-[#F4F7FE]/50 hover:bg-white hover:shadow-sm transition-all group cursor-pointer"
                                         onClick={() => navigate('/hotel/room-types')}
                                    >
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-black text-[#1B2559] truncate">{type.roomTitle}</p>
                                            <p className="text-[10px] font-bold text-[#A3AED0] uppercase">{type.bedType}</p>
                                        </div>
                                        <div className="text-right shrink-0 ml-4">
                                            <p className="text-lg font-black text-[#4318FF]">{type.availableRooms ?? 10}</p>
                                            <p className="text-[9px] font-black text-[#A3AED0] uppercase">Trống</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Operational Stats Sidebar */}
                        <div className="bg-gradient-to-br from-[#4318FF] to-[#707EFF] rounded-[32px] shadow-lg p-8 text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-lg font-black uppercase mb-6">Chỉ số vận hành</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                                        <span className="text-sm font-bold text-white/80">Tổng đơn đặt:</span>
                                        <span className="text-lg font-black">{stats?.totalBookings || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                                        <span className="text-sm font-bold text-white/80">RevPAR:</span>
                                        <span className="text-lg font-black">{formatCurrency(stats?.revPar)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3">
                                        <span className="text-sm font-bold text-white/80">Phòng đã bán:</span>
                                        <span className="text-lg font-black">{stats?.totalRoomNightsSold || 0}</span>
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

const StatCard = ({label, value, sub, subColor, footer, progress, icon}) => (
    <div className="bg-white p-7 rounded-[32px] shadow-sm border border-slate-100 group hover:shadow-md transition-all">
        <div className="flex justify-between items-start mb-4">
            <p className="text-[11px] font-black text-[#A3AED0] uppercase tracking-[0.15em]">{label}</p>
            <div className="p-3 bg-[#F4F7FE] text-[#4318FF] rounded-2xl group-hover:bg-[#4318FF] group-hover:text-white transition-all">{icon}</div>
        </div>
        <div className="space-y-1">
            <h2 className="text-2xl font-black text-[#1B2559]">{value}</h2>
            <p className={`text-xs font-bold ${subColor}`}>{sub}</p>
        </div>
        {progress !== undefined && (
            <div className="mt-4 h-1.5 w-full bg-[#F4F7FE] rounded-full overflow-hidden">
                <div className="h-full bg-[#4318FF]" style={{width: `${progress}%`}}></div>
            </div>
        )}
        <p className="mt-4 text-[10px] font-bold text-[#A3AED0] uppercase">{footer}</p>
    </div>
);

const TrustScoreCard = ({ score }) => (
    <div className="bg-white p-7 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center justify-center relative">
        <p className="absolute top-7 left-7 text-[11px] font-black text-[#A3AED0] uppercase tracking-[0.15em]">Tín nhiệm</p>
        <div className="relative w-20 h-20 flex items-center justify-center mt-4">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="40" cy="40" r="35" fill="transparent" stroke="#F4F7FE" strokeWidth="6" />
                <circle cx="40" cy="40" r="35" fill="transparent" stroke="#4318FF" strokeWidth="6" strokeDasharray="220" strokeDashoffset={220 - (score / 100) * 220} strokeLinecap="round" />
            </svg>
            <span className="text-xl font-black text-[#1B2559]">{score}</span>
        </div>
        <p className="mt-3 text-[10px] font-bold text-[#A3AED0] uppercase">Trust Score</p>
    </div>
);

const StatusBadge = ({ status }) => {
    const s = status?.toUpperCase();
    const config = {
        'BOOKED': 'bg-blue-100 text-blue-600',
        'CONFIRMED': 'bg-emerald-100 text-emerald-600',
        'CANCELLED': 'bg-rose-100 text-rose-600',
        'CHECKED-IN': 'bg-amber-100 text-amber-600',
        'COMPLETED': 'bg-slate-100 text-slate-600'
    };
    return (
        <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${config[s] || 'bg-slate-100 text-slate-600'}`}>
            {s || 'PENDING'}
        </span>
    );
};

const TaskItem = ({ color, title, desc, link, onClick }) => (
    <div
        className="flex gap-4 group cursor-pointer hover:bg-slate-50 p-2 -m-2 rounded-xl transition-all"
        onClick={onClick}
    >
        <div className="w-1 h-10 rounded-full" style={{backgroundColor: color}}></div>
        <div className="flex-1">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-black">{title}</h4>
                <span className="text-[10px] font-bold text-[#4318FF] uppercase group-hover:underline">
                    {link}
                </span>
            </div>
            <p className="text-xs font-bold text-[#A3AED0]">{desc}</p>
        </div>
    </div>
);

export default HotelDashboard;