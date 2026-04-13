import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Wallet, AlertTriangle, Calendar, Lock,
    CheckCircle2, XCircle, Clock, TrendingUp, Loader2,
    ChevronRight, ExternalLink, ArrowDownRight, ArrowUpRight
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { jwtDecode } from "jwt-decode";

// Services
import { bookingService } from '@/services/booking.service';
import { agencyService } from '@/services/agency.service';
import api from "@/services/axios.config";

const AgencyDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [agencyId, setAgencyId] = useState(null);
    const navigate = useNavigate();

    // Data states
    const [finance, setFinance] = useState({ wallet: 0, credit: null });
    const [monthlyStats, setMonthlyStats] = useState({ total: 0, completed: 0, cancelled: 0, others: 0 });
    const [upcoming, setUpcoming] = useState({ day0: [], day1: [], day2: [] });
    const [chartData, setChartData] = useState([]);
    const [activities, setActivities] = useState([]); // State cho giao dịch
    const [accountStatus, setAccountStatus] = useState('NORMAL');

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setAgencyId(decoded.agencyId || decoded.agency_id);
            } catch (error) { console.error("Token error", error); }
        }
    }, []);

    const fetchData = async () => {
        if (!agencyId) return;
        setLoading(true);
        try {
            const profileRes = await agencyService.getAgencyProfileDetail();
            const agency = profileRes?.result;

            const [creditRes, bookingRes, transRes] = await Promise.allSettled([
                api.get(`/agencies/${agencyId}/credit-summary`),
                bookingService.getBookingHistory(),
                api.get(`/transaction-history/${agencyId}/transactions/recent?limit=5`)
            ]);

            const getRes = (res) => res.status === 'fulfilled' ? res.value : null;

            // 1. Xử lý Tài chính
            const credit = getRes(creditRes)?.data?.result;
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const dueDate = credit?.dueDate ? new Date(credit.dueDate) : null;
            const isOverdue = credit?.debt > 0 && dueDate && dueDate < today;

            setFinance({ wallet: agency?.walletBalance || 0, credit });
            setAccountStatus(isOverdue ? 'STAGE2' : (credit?.debt > 0 ? 'STAGE1' : 'NORMAL'));

            // 2. Thống kê & Lịch trình
            const bookings = getRes(bookingRes)?.result?.content || [];
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

            let stats = { total: 0, completed: 0, cancelled: 0, others: 0 };
            let d0 = [], d1 = [], d2 = [];
            const revMap = {};

            bookings.forEach(b => {
                const createdAt = new Date(b.createdAt);
                const checkInClean = new Date(b.checkInDate).setHours(0,0,0,0);

                if (createdAt >= startOfMonth) {
                    stats.total++;
                    if (b.bookingStatus === 'COMPLETED' ) stats.completed++;
                    else if (b.bookingStatus === 'CANCELLED') stats.cancelled++;
                    else stats.others++;
                }

                const diffDays = Math.round((checkInClean - today.getTime()) / (1000 * 60 * 60 * 24));
                if (b.bookingStatus !== 'CANCELLED') {
                    if (diffDays === 0) d0.push(b);
                    else if (diffDays === 1) d1.push(b);
                    else if (diffDays === 2) d2.push(b);
                    const dayLabel = `${createdAt.getDate()}/${createdAt.getMonth() + 1}`;
                    revMap[dayLabel] = (revMap[dayLabel] || 0) + b.finalAmount;
                }
            });

            setMonthlyStats(stats);
            setUpcoming({ day0: d0, day1: d1, day2: d2 });
            setChartData(Object.keys(revMap).map(k => ({ day: k, revenue: revMap[k] })).slice(-7));

            // 3. Giao dịch gần nhất
            setActivities(getRes(transRes)?.data?.result || []);

        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [agencyId]);

    const formatVND = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-slate-50 text-indigo-600">
            <Loader2 className="animate-spin" size={40}/>
        </div>
    );

    return (
        <div className="p-8 bg-[#FBFBFE] min-h-screen space-y-8">
            {/* Banner Cảnh báo nợ (Giữ nguyên) */}
            {accountStatus !== 'NORMAL' && (
                <div className={`p-4 rounded-[24px] border-2 flex items-center justify-between animate-pulse ${
                    accountStatus === 'STAGE2' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'
                }`}>
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl ${accountStatus === 'STAGE2' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>
                            {accountStatus === 'STAGE2' ? <Lock size={20}/> : <AlertTriangle size={20}/>}
                        </div>
                        <div>
                            <p className={`font-black text-xs uppercase ${accountStatus === 'STAGE2' ? 'text-red-600' : 'text-amber-700'}`}>
                                {accountStatus === 'STAGE2' ? "Tài khoản bị khóa" : "Nhắc nhở công nợ"}
                            </p>
                            <p className="text-sm font-bold text-slate-600">
                                {accountStatus === 'STAGE2' ? "Vui lòng thanh toán nợ quá hạn." : `Vui lòng thanh toán trước ngày: ${finance.credit?.dueDate}`}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/agency/credit-wallet')} className="px-6 py-2 bg-white rounded-xl shadow-sm text-xs font-black uppercase tracking-tighter">Thanh toán</button>
                </div>
            )}

            {/* Tài chính Section (Giữ nguyên) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Sức mua khả dụng</p>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                            {formatVND(finance.wallet + (finance.credit?.remainingCredit || 0))}
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-50">
                        <div>
                            <p className="text-[10px] font-black text-emerald-500 uppercase">Ví trả trước</p>
                            <p className="text-lg font-black text-slate-800">{formatVND(finance.wallet)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-indigo-500 uppercase">Tín dụng trống</p>
                            <p className="text-lg font-black text-slate-800">{formatVND(finance.credit?.remainingCredit)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 grid grid-cols-2 gap-6 relative overflow-hidden">
                    <div className="border-r border-slate-50 pr-4 flex flex-col justify-between">
                        <div>
                            <p className="text-[11px] font-black text-amber-500 uppercase mb-1">Dư nợ còn hạn</p>
                            <h2 className="text-2xl font-black text-slate-800">
                                {accountStatus === 'STAGE1' ? formatVND(finance.credit?.debt) : '0 ₫'}
                            </h2>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold tracking-tighter italic">Hạn: {finance.credit?.dueDate || '---'}</p>
                    </div>
                    <div className="flex flex-col justify-between">
                        <div>
                            <p className="text-[11px] font-black text-red-500 uppercase mb-1">Dư nợ quá hạn</p>
                            <h2 className="text-2xl font-black text-red-600">
                                {accountStatus === 'STAGE2' ? formatVND(finance.credit?.debt) : '0 ₫'}
                            </h2>
                        </div>
                        <button onClick={() => navigate('/agency/credit-wallet')} className="w-full py-2 bg-slate-900 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-indigo-600 transition-all">
                            Thanh toán
                        </button>
                    </div>
                </div>
            </div>

            {/* Chỉ số nhanh (Giữ nguyên) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <MetricCard label="Đơn trong tháng" value={monthlyStats.total} icon={<Calendar size={18}/>} color="text-indigo-600" bg="bg-indigo-50" />
                <MetricCard label="Thành công" value={monthlyStats.completed} icon={<CheckCircle2 size={18}/>} color="text-emerald-600" bg="bg-emerald-50" />
                <MetricCard label="Đã hủy" value={monthlyStats.cancelled} icon={<XCircle size={18}/>} color="text-rose-600" bg="bg-rose-50" />
                <MetricCard label="Trạng thái khác" value={monthlyStats.others} icon={<Clock size={18}/>} color="text-slate-600" bg="bg-slate-100" />
            </div>

            {/* Phần 3 Cột: Lịch trình - Doanh số - Giao dịch */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. Lịch khởi hành (Giữ nguyên) */}
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
                            <Clock size={16} className="text-indigo-600"/> Lịch trình sắp tới
                        </h3>
                        <button onClick={() => navigate('/agency/booking-list')} className="text-[10px] font-black text-indigo-600 hover:underline flex items-center gap-1">
                            Tất cả <ExternalLink size={12}/>
                        </button>
                    </div>
                    <div className="space-y-8 flex-1">
                        <UpcomingSection title="Hôm nay" list={upcoming.day0} navigate={navigate} />
                        <UpcomingSection title="Ngày mai" list={upcoming.day1} navigate={navigate} />
                        <UpcomingSection title="Ngày kia" list={upcoming.day2} navigate={navigate} />
                    </div>
                </div>

                {/* 2. Biểu đồ Doanh số (Đã thu gọn để nhường chỗ) */}
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
                    <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-8">Doanh số 7 ngày</h3>
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ left: -35 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} dy={10}/>
                                <YAxis hide/>
                                <Tooltip cursor={{fill: '#F8FAFC'}} content={<CustomTooltip/>}/>
                                <Bar dataKey="revenue" radius={[6, 6, 6, 6]} barSize={25}>
                                    {chartData.map((entry, i) => (
                                        <Cell key={i} fill={i === chartData.length - 1 ? '#4F46E5' : '#E2E8F0'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Giao dịch gần nhất (Thêm mới) */}
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
                            <TrendingUp size={16} className="text-emerald-600"/> Giao dịch mới
                        </h3>
                        <button onClick={() => navigate('/agency/transaction-history')} className="text-[10px] font-black text-indigo-600 hover:underline">
                            Xem tất cả
                        </button>
                    </div>
                    <div className="space-y-5 flex-1">
                        {activities.length > 0 ? activities.map((act, idx) => (
                            <div key={idx} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${act.direction === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                        {act.direction === 'IN' ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-black text-slate-700 line-clamp-1">{act.description}</span>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                            {new Date(act.transactionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                                <span className={`text-[11px] font-black whitespace-nowrap ${act.direction === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {act.direction === 'IN' ? '+' : '-'}{formatVND(act.amount).replace('₫', '')}
                                </span>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center h-full opacity-30 italic text-[10px]">Chưa có giao dịch</div>
                        )}
                    </div>
                    <div className="mt-6 p-4 bg-slate-50 rounded-2xl">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Ghi chú</p>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Giao dịch được cập nhật thời gian thực từ ví và hạn mức tín dụng.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-components giữ nguyên như cũ
const MetricCard = ({ label, value, icon, color, bg }) => (
    <div className="bg-white p-6 rounded-[28px] border border-slate-50 shadow-sm flex items-center gap-5">
        <div className={`p-3 rounded-2xl ${bg} ${color}`}>{icon}</div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-xl font-black text-slate-900">{value}</p>
        </div>
    </div>
);

const UpcomingSection = ({ title, list, navigate }) => {
    const LIMIT = 2; // Giảm limit xuống 2 để cân đối giao diện 3 cột
    const displayedItems = list.slice(0, LIMIT);
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
                <div className="h-px bg-slate-50 flex-1"></div>
            </div>
            <div className="space-y-2">
                {list.length > 0 ? (
                    <>
                        {displayedItems.map(item => (
                            <div key={item.bookingId} onClick={() => navigate(`/agency/booking-list/detail/${item.bookingCode}`)}
                                 className="group flex items-center justify-between p-3 bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl cursor-pointer transition-all">
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-black text-slate-700 group-hover:text-indigo-600">{item.bookingCode}</span>
                                    <span className="text-[9px] font-bold text-slate-400 truncate w-24">{item.guestName || "Khách lẻ"}</span>
                                </div>
                                <ChevronRight size={12} className="text-slate-300 group-hover:translate-x-1 transition-transform"/>
                            </div>
                        ))}
                    </>
                ) : <p className="text-[10px] text-slate-300 italic pl-2">Trống</p>}
            </div>
        </div>
    );
};

const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
        return (
            <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl">
                <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Ngày {payload[0].payload.day}</p>
                <p className="text-sm font-black">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payload[0].value)}</p>
            </div>
        );
    }
    return null;
};

export default AgencyDashboard;