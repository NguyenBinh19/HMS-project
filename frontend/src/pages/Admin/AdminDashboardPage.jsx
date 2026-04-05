import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp, Wallet, Users, Calendar,
    ArrowUpRight, FileCheck, Landmark, AlertCircle,
    Search, Server, Zap, Globe, Download, Loader2, Clock, CheckCircle2
} from 'lucide-react';
import { userService } from '@/services/user.service';
import { kycService } from '@/services/kyc.service';
import { payoutService } from '@/services/payout.service';
import { bookingService } from '@/services/booking.service';

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [data, setData] = useState({
        activeUsers: 0,
        kycPending: [],
        payoutStats: null,
        bookings: [],
        stats: {
            totalRevenue: 0,
            pendingBookings: 0,
            confirmedBookings: 0,
            totalBookings: 0
        },
        chartData: [32, 48, 42, 56, 48, 52, 64] // Mock data cho chart
    });

    // Hàm định dạng tiền tệ VND
    const formatVND = (val) => new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(val || 0);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // Gọi API
                const [userRes, kycRes, payoutRes, bookingRes] = await Promise.all([
                    userService.getUserMetrics(),
                    kycService.getPartnerVerificationsByStatus('PENDING'),
                    payoutService.getPayoutList({ status: 'PENDING' }),
                    bookingService.viewAllBookingByAdmin({ size: 100 })
                ]);

                // 1. Xử lý dữ liệu User
                const activeUsersCount = userRes?.result?.activeUsers || 0;

                // 2. Xử lý dữ liệu KYC
                const kycList = Array.isArray(kycRes?.result) ? kycRes.result : [];

                // 3. Xử lý dữ liệu Payout
                const payoutData = payoutRes?.result || null;

                // 4. Xử lý dữ liệu Booking
                const allBookings = Array.isArray(bookingRes?.result) ? bookingRes.result : [];

                // Tính toán thống kê từ danh sách booking
                const bookingStats = allBookings.reduce((acc, curr) => {
                    acc.totalRevenue += (curr.finalAmount || 0);
                    const status = curr.bookingStatus?.toUpperCase();
                    if (status === 'BOOKED' || status === 'PENDING') acc.pendingBookings++;
                    if (status === 'CONFIRMED' || status === 'COMPLETED') acc.confirmedBookings++;
                    return acc;
                }, { totalRevenue: 0, pendingBookings: 0, confirmedBookings: 0 });

                setData({
                    activeUsers: activeUsersCount,
                    kycPending: kycList,
                    payoutStats: payoutData,
                    bookings: allBookings,
                    stats: {
                        ...bookingStats,
                        totalBookings: allBookings.length
                    },
                    chartData: [32, 48, 42, 56, 48, 52, 64]
                });
            } catch (error) {
                console.error("Dashboard Load Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC]">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                <p className="font-bold text-slate-600 tracking-tight">Đang đồng bộ dữ liệu hệ thống...</p>
            </div>
        );
    }

    return (
        <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans text-[#1B2559]">
            <div className="max-w-[1600px] mx-auto space-y-8">

                {/* 1. Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[24px] shadow-sm border border-slate-100">
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter">ADMIN DASHBOARD</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 text-blue-600">Hệ thống quản lý đối tác & đặt phòng</p>
                    </div>
                    {/*<div className="flex items-center gap-3">*/}
                    {/*    <div className="hidden lg:flex bg-slate-100 p-1 rounded-xl mr-4">*/}
                    {/*        {['Hôm nay', 'Tháng này'].map((tab, i) => (*/}
                    {/*            <button key={tab} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${i === 1 ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-blue-600'}`}>*/}
                    {/*                {tab}*/}
                    {/*            </button>*/}
                    {/*        ))}*/}
                    {/*    </div>*/}
                    {/*    <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-800 transition-all">*/}
                    {/*        <Download size={16} /> Xuất báo cáo*/}
                    {/*    </button>*/}
                    {/*</div>*/}
                </div>

                {/* 2. Top Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        label="Tổng giá trị Booking"
                        value={formatVND(data.stats.totalRevenue)}
                        // trend="+12.5%"
                        sub="Tổng doanh thu tích lũy"
                        icon={<TrendingUp size={20} />}
                        color="blue"
                    />
                    <StatCard
                        label="Lợi nhuận ước tính"
                        value={formatVND(data.stats.totalRevenue * 0.1)}
                        // trend="+8%"
                        sub="Tạm tính 10% hoa hồng sàn"
                        icon={<Wallet size={20} />}
                        color="emerald"
                    />
                    <StatCard
                        label="Người dùng Active"
                        value={data.activeUsers}
                        live
                        sub="Người dùng trực tuyến hiện tại"
                        icon={<Users size={20} />}
                        color="indigo"
                    />
                    <StatCard
                        label="Tổng số đơn phòng"
                        value={data.stats.totalBookings}
                        trend={data.stats.confirmedBookings > 0 ? "Ổn định" : null}
                        sub={`Thành công: ${data.stats.confirmedBookings} đơn`}
                        icon={<Calendar size={20} />}
                        color="orange"
                    />
                </div>

                {/* 3. Main Content: Bookings & Tasks */}
                <div className="grid grid-cols-12 gap-8">

                    {/* Recent Bookings Table */}
                    <div className="col-span-12 lg:col-span-8 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-black uppercase tracking-tighter">Giao dịch đặt phòng gần đây</h3>
                            <button onClick={() => navigate('/admin/view-booking')} className="text-xs font-bold text-blue-600 hover:underline">Xem tất cả</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-separate border-spacing-y-3">
                                <thead>
                                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <th className="pb-4 pl-4">Mã đơn</th>
                                    <th className="pb-4">Khách hàng</th>
                                    <th className="pb-4">Khách sạn</th>
                                    <th className="pb-4">Số tiền</th>
                                    <th className="pb-4 text-center">Trạng thái</th>
                                </tr>
                                </thead>
                                <tbody>
                                {data.bookings.slice(0, 6).map((b, i) => (
                                    <tr key={i} className="bg-slate-50/50 hover:bg-slate-50 transition-colors group">
                                        <td className="py-4 pl-4 rounded-l-2xl">
                                            <span className="text-xs font-black text-blue-600">#{b.bookingCode.split('-')[1] || b.bookingCode.slice(-5)}</span>
                                        </td>
                                        <td className="py-4">
                                            <p className="text-xs font-bold">{b.guestName}</p>
                                            <p className="text-[10px] text-slate-400">{b.agencyName}</p>
                                        </td>
                                        <td className="py-4">
                                            <p className="text-xs font-bold truncate max-w-[150px]">{b.hotelName}</p>
                                        </td>
                                        <td className="py-4">
                                            <span className="text-xs font-black">{formatVND(b.finalAmount)}</span>
                                        </td>
                                        <td className="py-4 pr-4 rounded-r-2xl text-center">
                                                <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase ${
                                                    b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'COMPLETED' || b.bookingStatus === 'paid'
                                                        ? 'bg-emerald-100 text-emerald-600'
                                                        : 'bg-amber-100 text-amber-600'
                                                }`}>
                                                    {b.bookingStatus}
                                                </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Urgent Tasks (KYC & Payout) */}
                    <div className="col-span-12 lg:col-span-4 space-y-6">
                        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="font-black uppercase tracking-tighter">Cần xử lý gấp</h3>
                                <span
                                    className="bg-red-100 text-red-600 text-[10px] px-2 py-1 rounded-lg font-black italic">
                                    {(data.kycPending?.length || 0) + (data.payoutStats?.readyCount || 0)} yêu cầu
                                </span>
                            </div>
                            <div className="space-y-4">
                                <UrgentItem
                                    icon={<FileCheck className="text-amber-600"/>}
                                    onClick={() => navigate('/admin/kyc-queue')}
                                    bg="bg-amber-50"
                                    title={`${data.kycPending?.length || 0} Đối tác chờ duyệt`}
                                    desc="Yêu cầu KYC Agency/Hotel mới"
                                />
                                {/*<UrgentItem*/}
                                {/*    icon={<Landmark className="text-emerald-600"/>}*/}
                                {/*    bg="bg-emerald-50"*/}
                                {/*    title={`${data.payoutStats?.readyCount || 0} Lệnh rút tiền`}*/}
                                {/*    desc={`Khả dụng: ${formatVND(data.payoutStats?.totalPayoutLiability)}`}*/}
                                {/*/>*/}
                                <div className="pt-4 border-t border-slate-100 mt-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">KYC Mới nhất</h4>
                                    {data.kycPending.slice(0, 2).map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center mb-2 p-2 rounded-xl hover:bg-slate-50">
                                            <span className="text-[11px] font-bold truncate max-w-[150px]">{item.legalName}</span>
                                            <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-black">{item.partnerType}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Zap Notification */}
                        <div className="bg-blue-600 p-6 rounded-[32px] text-white shadow-lg shadow-blue-200 relative overflow-hidden group">
                            <Zap className="absolute -right-4 -bottom-4 w-32 h-32 text-blue-500/30 group-hover:scale-110 transition-transform" />
                            <div className="relative z-10">
                                <h4 className="font-black italic tracking-tighter mb-2">HỆ THỐNG TỐI ƯU</h4>
                                <p className="text-xs font-medium text-blue-100">Tất cả dịch vụ đang hoạt động với hiệu suất 99.9%. Không ghi nhận lỗi thanh toán.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. System Health Section */}
                {/*<div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">*/}
                {/*    <div className="flex justify-between items-center mb-8">*/}
                {/*        <div className="flex items-center gap-2">*/}
                {/*            <Server size={20} className="text-slate-400" />*/}
                {/*            <h3 className="font-black uppercase tracking-tighter">Sức khỏe hệ thống (Realtime)</h3>*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">*/}
                {/*        <div className="space-y-6">*/}
                {/*            <HealthBar label="Database Latency" percent={24} color="bg-emerald-500" />*/}
                {/*            <HealthBar label="API Response Time" percent={35} color="bg-blue-500" />*/}
                {/*            <HealthBar label="Cloud Storage" percent={58} color="bg-indigo-500" />*/}
                {/*        </div>*/}
                {/*        <div className="grid grid-cols-2 gap-4">*/}
                {/*            <LatencyItem icon={<Globe size={16}/>} label="Booking Svc" time="120ms" status="Mượt" sColor="text-emerald-500" />*/}
                {/*            <LatencyItem icon={<CheckCircle2 size={16}/>} label="Auth Svc" time="45ms" status="Tốt" sColor="text-emerald-500" />*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*</div>*/}
            </div>
        </div>
    );
};

// --- Helpers & Sub-components ---

const HealthBar = ({ label, percent, color }) => (
    <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-tight text-slate-500">
            <span>{label}</span>
            <span>{percent}%</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-1000 ${color}`} style={{ width: `${percent}%` }}></div>
        </div>
    </div>
);

const StatCard = ({ label, value, trend, sub, icon, color, live }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-600",
        emerald: "bg-emerald-50 text-emerald-600",
        indigo: "bg-indigo-50 text-indigo-600",
        orange: "bg-orange-50 text-orange-600"
    };
    return (
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 hover:shadow-md transition-all group cursor-default">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl transition-transform group-hover:rotate-6 ${colors[color]}`}>{icon}</div>
                {trend && <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg tracking-tighter">↑ {trend}</span>}
                {live && <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1 uppercase tracking-widest">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-50"/> Live
                </span>}
            </div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{label}</p>
            <h2 className="text-2xl font-black text-[#1B2559] mb-2">{value}</h2>
            <p className="text-[10px] font-bold text-slate-400 italic">{sub}</p>
        </div>
    );
};

const UrgentItem = ({ icon, bg, title, desc, onClick }) => (
    <div onClick={onClick} className={`flex items-center gap-4 p-4 rounded-2xl ${bg} cursor-pointer hover:translate-x-2 transition-all border border-transparent hover:border-white shadow-sm hover:shadow-md`}>
        <div className="p-3 bg-white rounded-xl shadow-xs">{icon}</div>
        <div className="flex-1">
            <h4 className="text-xs font-black text-slate-800 tracking-tight">{title}</h4>
            <p className="text-[10px] font-bold text-slate-500">{desc}</p>
        </div>
        <ArrowUpRight size={16} className="text-slate-300" />
    </div>
);

const LatencyItem = ({ icon, label, time, status, sColor }) => (
    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-xs text-slate-400">{icon}</div>
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{label}</span>
        </div>
        <div className="text-right">
            <p className="text-xs font-black text-slate-800">{time}</p>
            <p className={`text-[9px] font-black uppercase ${sColor}`}>{status}</p>
        </div>
    </div>
);

export default AdminDashboard;