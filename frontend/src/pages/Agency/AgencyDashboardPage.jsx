import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Trophy, Wallet, AlertTriangle, Users,
    Calendar, Lock, CheckCircle2, AlertCircle, TrendingUp, Loader2
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { jwtDecode } from "jwt-decode";

// Import các services
import { rankService } from '@/services/rank.service';
import { bookingService } from '@/services/booking.service';
import { staffService } from '@/services/staff.service';
import { agencyService } from '@/services/agency.service';
import api from "@/services/axios.config";

const AgencyDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [agencyId, setAgencyId] = useState(null);
    const navigate = useNavigate();
    // States dữ liệu
    const [rankData, setRankData] = useState(null);
    const [financeData, setFinanceData] = useState({ wallet: 0, credit: null });
    const [stats, setStats] = useState({ newBookings: 0, checkins: 0, complaints: 0, staff: 0 });
    const [chartData, setChartData] = useState([]);
    const [activities, setActivities] = useState([]);
    const [accountStatus, setAccountStatus] = useState('NORMAL');

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const id = decoded.agencyId || decoded.agency_id;
                setAgencyId(id);
            } catch (error) {
                console.error("Token decode error:", error);
            }
        }
    }, []);

    const fetchData = async () => {
        if (!agencyId) return;
        setLoading(true);

        try {
            // Lấy Profile để lấy rankId và Wallet
            const agencyProfileRes = await agencyService.getAgencyProfileDetail();
            const agencyData = agencyProfileRes?.result;
            const currentRankId = agencyData?.rankId;

            // Gọi đồng thời các API
            const results = await Promise.allSettled([
                rankService.getRankDetail(currentRankId),                            // Index 0
                api.get(`/agencies/${agencyId}/credit-summary`),                    // Index 1
                bookingService.getBookingHistory(),                                 // Index 2
                api.get(`/transaction-history/${agencyId}/transactions/recent?limit=4`), // Index 3
                staffService.getStaffList()                                         // Index 4
            ]);

            // Hàm helper để lấy giá trị value từ Promise.allSettled
            const getResValue = (idx) => results[idx].status === 'fulfilled' ? results[idx].value : null;

            // --- 0. XỬ LÝ RANK ---
            const rankRes = getResValue(0);
            if (rankRes?.result) {
                const r = rankRes.result;
                setRankData({
                    currentRankName: r.rankName,
                    color: r.color,
                    description: r.description,
                    rankCode: r.rankCode,
                    progressPercent: r.upgradeMinTotalRevenue === 0 ? 100 : 0
                });
            }

            // --- 1. XỬ LÝ TÀI CHÍNH ---
            const creditRes = getResValue(1);
            const creditData = creditRes?.data?.result;

            setFinanceData({
                wallet: agencyData?.walletBalance || 0,
                credit: creditData || null
            });

            if (creditData?.debt > 0) {
                const isOverdue = new Date(creditData.dueDate) < new Date();
                setAccountStatus(isOverdue ? 'STAGE2' : 'STAGE1');
            } else {
                setAccountStatus('NORMAL');
            }
            // --- 2. XỬ LÝ BOOKING ---
            const bookingRes = getResValue(2);
            const bookingList = bookingRes?.result?.content || [];

            const todayStr = new Date().toDateString();
            const threeDaysLater = new Date();
            threeDaysLater.setDate(threeDaysLater.getDate() + 3);

            let newCount = 0;
            let checkinCount = 0;
            const dailyRevMap = {};

            bookingList.forEach(b => {
                const createdAt = new Date(b.createdAt);
                const checkInDate = new Date(b.checkInDate);
                if (createdAt.toDateString() === todayStr) newCount++;
                if (checkInDate >= new Date() && checkInDate <= threeDaysLater && b.bookingStatus !== 'CANCELLED') {
                    checkinCount++;
                }
                // Gom dữ liệu biểu đồ
                const dateLabel = `${createdAt.getDate()}/${createdAt.getMonth() + 1}`;
                if (b.bookingStatus !== 'CANCELLED') {
                    dailyRevMap[dateLabel] = (dailyRevMap[dateLabel] || 0) + (b.finalAmount || 0);
                }
            });

            setStats(prev => ({ ...prev, newBookings: newCount, checkins: checkinCount }));
            setChartData(Object.keys(dailyRevMap).map(date => ({
                day: date,
                revenue: dailyRevMap[date]
            })).slice(-10));

            // --- 3. GIAO DỊCH GẦN NHẤT ---
            const transRes = getResValue(3);
            const transData = transRes?.data?.result;
            if (Array.isArray(transData)) {
                setActivities(transData);
            }
            // --- 4. NHÂN SỰ ---
            const staffRes = getResValue(4);
            const staffList = staffRes?.result || staffRes?.data?.result;
            if (Array.isArray(staffList)) {
                setStats(prev => ({ ...prev, staff: staffList.length }));
            }

        } catch (error) {
            console.error("Dashboard logic error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [agencyId]);

    const getStatusConfig = () => {
        switch (accountStatus) {
            case 'STAGE1':
                return {
                    banner: "bg-amber-50 border-amber-200 text-amber-800",
                    bannerIcon: <AlertTriangle className="text-amber-500" />,
                    bannerMsg: "Bạn đang có dư nợ chưa thanh toán. Vui lòng tất toán trước ngày hạn.",
                    isLocked: false
                };
            case 'STAGE2':
                return {
                    banner: "bg-red-600 border-red-700 text-white",
                    bannerIcon: <Lock className="text-white" />,
                    bannerMsg: "TÀI KHOẢN BỊ KHÓA GIAO DỊCH do nợ quá hạn. Vui lòng thanh toán để tiếp tục.",
                    isLocked: true
                };
            default:
                return { banner: null, isLocked: false };
        }
    };

    const config = getStatusConfig();
    const formatVND = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                <p className="font-bold text-slate-600 tracking-tight">Đang tải dữ liệu đại lý...</p>
            </div>
        );
    }

    return (
        <div className={`p-6 bg-slate-50 min-h-screen space-y-6 ${config.isLocked ? 'grayscale-[0.5]' : ''}`}>

            {/* 1. Alert Banner */}
            {config.banner && (
                <div
                    className={`flex items-center gap-3 p-4 rounded-2xl border shadow-sm animate-pulse ${config.banner}`}>
                    {config.bannerIcon}
                    <p className="font-bold text-sm tracking-tight">{config.bannerMsg}</p>
                </div>
            )}

            {/* 2. Tài chính Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Hạng */}
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                Hạng đại lý
                            </p>
                            <div
                                style={{
                                    backgroundColor: rankData?.color || '#94a3b8',
                                    boxShadow: `0 4px 12px ${rankData?.color}40`
                                }}
                                className="text-white px-4 py-1 rounded-lg font-black text-sm inline-block italic"
                            >
                                {rankData?.currentRankName || 'BASIC'}
                            </div>
                        </div>
                        <div className="p-2 rounded-full bg-slate-50">
                            {/* Có thể thay đổi Icon dựa trên rankData.icon nếu cần */}
                            <Trophy style={{ color: rankData?.color || '#94a3b8' }} size={28} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        {/* Hiển thị mô tả từ description trong JSON */}
                        <p className="text-[11px] font-bold text-slate-500 leading-tight italic">
                            {rankData?.description || 'Hạng thành viên cơ bản'}
                        </p>

                        {/* Thanh tiến trình */}
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full transition-all duration-1000 ease-out"
                                style={{
                                    width: `${rankData?.progressPercent || 0}%`,
                                    backgroundColor: rankData?.color || '#94a3b8'
                                }}
                            />
                        </div>
                        {rankData?.rankCode === 'BASIC'}
                    </div>
                </div>

                {/* Sức mua / Ví trả trước */}
                <div className={`bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 transition-all ${accountStatus === 'STAGE2' ? 'ring-2 ring-red-500' : ''}`}>
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sức mua (Ví + Tín dụng)</p>
                        <Wallet className="text-emerald-500" size={20} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-4">
                        {formatVND((financeData.wallet || 0) + (financeData.credit?.remainingCredit || 0))}
                    </h2>
                    <div className="space-y-2 text-[11px] mb-4">
                        <div className="flex justify-between">
                            <span className="font-bold text-slate-500 tracking-tight">Số dư ví:</span>
                            <span className="font-black text-slate-800">{formatVND(financeData.wallet)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-bold text-slate-500 tracking-tight">Tín dụng khả dụng:</span>
                            <span className="font-black text-slate-800">{formatVND(financeData.credit?.remainingCredit)}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/agency/prepaid')} // Điều hướng sang trang nạp ví
                        disabled={config.isLocked}
                        className="w-full bg-blue-600 text-white py-2 rounded-xl text-[10px] font-black uppercase disabled:bg-slate-300 hover:bg-blue-700 transition-colors"
                    >
                        Nạp tiền vào ví
                    </button>
                </div>

                {/* Dư nợ / Tín dụng */}
                <div className={`p-6 rounded-[32px] shadow-sm border transition-all ${accountStatus === 'NORMAL' ? 'bg-white border-slate-100' : 'bg-red-50 border-red-100'}`}>
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Dư nợ hiện tại</p>
                    <h2 className="text-2xl font-black text-red-600 mb-1">{formatVND(financeData.credit?.debt)}</h2>
                    <p className="text-[10px] font-bold text-slate-500 mb-6 italic tracking-tighter">
                        Hạn thanh toán: {financeData.credit?.dueDate || 'N/A'}
                    </p>
                    <button
                        onClick={() => navigate('/agency/credit-wallet')} // Điều hướng sang trang thanh toán nợ tín dụng
                        className="w-full bg-slate-900 text-white py-3 rounded-xl font-black text-xs uppercase shadow-lg hover:bg-black transition-all"
                    >
                        Thanh toán nợ
                    </button>
                </div>
            </div>

            {/* 3. Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <StatCard
                    icon={<CheckCircle2 className="text-emerald-500"/>}
                    label="Đơn mới"
                    value={stats.newBookings}
                    sub="Hôm nay"
                />
                <StatCard
                    icon={<Calendar className="text-slate-400"/>}
                    label="Sắp khởi hành"
                    value={stats.checkins}
                />
                <StatCard
                    icon={<Users className="text-blue-500"/>}
                    label="Nhân sự"
                    value={stats.staff}
                    sub="Thành viên"
                />
            </div>
            {/* 4. Chart & Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                    <h3 className="font-black text-slate-800 uppercase tracking-tighter mb-8">Doanh số đặt phòng gần
                        đây</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                                <XAxis dataKey="day" axisLine={false} tickLine={false}
                                       tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}}/>
                                <YAxis hide/>
                                <Tooltip cursor={{fill: '#f8fafc'}} content={<CustomTooltip/>}/>
                                <Bar dataKey="revenue" radius={[6, 6, 0, 0]} barSize={32}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`}
                                              fill={index === chartData.length - 1 ? '#3b82f6' : '#93c5fd'}/>
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                    <h3 className="font-black text-slate-800 uppercase tracking-tighter mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-blue-600"/> Giao dịch gần nhất
                    </h3>
                    <div className="space-y-6">
                        {activities.length > 0 ? activities.map((act, idx) => (
                            <ActivityItem
                                key={idx}
                                time={new Date(act.transactionDate).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                                desc={act.description}
                                amount={`${act.direction === 'IN' ? '+' : '-'}${formatVND(act.amount)}`}
                                type={act.direction === 'IN' ? 'success' : 'debt'}
                            />
                        )) : (
                            <div className="flex flex-col items-center py-10 opacity-40">
                                <TrendingUp size={40} className="mb-2"/>
                                <p className="text-xs font-bold italic">Chưa có giao dịch nào</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Sub-components ---
const StatCard = ({icon, label, value, sub, highlight}) => (
    <div
        className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-2">
        <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
        <div className="text-2xl font-black text-slate-900">{value}</div>
        <div>
            <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{label}</p>
            <p className={`text-[9px] font-bold ${highlight ? 'text-red-500' : 'text-slate-400'}`}>{sub}</p>
        </div>
    </div>
);

const ActivityItem = ({ time, desc, amount, type }) => (
    <div className="flex gap-4 items-start">
        <span className="text-[10px] font-black text-slate-400 mt-1 whitespace-nowrap">{time}</span>
        <div className="space-y-1 overflow-hidden">
            <p className="text-xs font-bold text-slate-700 leading-tight truncate">{desc}</p>
            <p className={`text-[10px] font-black ${type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                {amount}
            </p>
        </div>
    </div>
);

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800">
                <p className="text-[10px] font-black uppercase mb-1">Ngày {payload[0].payload.day}</p>
                <p className="text-sm font-black text-blue-400">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payload[0].value)}
                </p>
            </div>
        );
    }
    return null;
};

export default AgencyDashboard;