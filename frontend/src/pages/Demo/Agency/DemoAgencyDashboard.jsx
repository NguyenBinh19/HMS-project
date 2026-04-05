import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Trophy, Wallet, AlertTriangle, Users,
    Calendar, Lock, CheckCircle2, TrendingUp, Loader2, Star,
    ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from 'recharts';

// Import dữ liệu Mock chuẩn SQL
import {
    MOCK_AGENCY_DATA,
    MOCK_CHART_DATA,
    MOCK_TRANSACTIONS
} from '@/constant/agency_mockData.js';

const DemoAgencyDashboard = () => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Sử dụng dữ liệu Mock làm State
    const agency = MOCK_AGENCY_DATA;
    const chartData = MOCK_CHART_DATA;
    const transactions = MOCK_TRANSACTIONS;

    // Giả lập trạng thái tài khoản dựa trên dữ liệu nợ (STAGE1: có nợ, STAGE2: nợ quá hạn)
    // Ở đây demo trạng thái NORMAL hoặc STAGE1 dựa trên currentCredit
    const accountStatus = agency.finance.currentCredit > 0 ? 'STAGE1' : 'NORMAL';

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const getStatusConfig = () => {
        switch (accountStatus) {
            case 'STAGE1':
                return {
                    banner: "bg-amber-50 border-amber-200 text-amber-800",
                    bannerIcon: <AlertTriangle className="text-amber-500" />,
                    bannerMsg: "Bạn đang có dư nợ công nợ chưa thanh toán. Vui lòng tất toán đúng hạn.",
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
    const formatVND = (val) => new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    }).format(val || 0);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                <p className="font-bold text-slate-600 uppercase tracking-widest text-[10px]">Đang đồng bộ dữ liệu HMS v2...</p>
            </div>
        );
    }

    return (
        <div className={`space-y-6 text-left transition-all duration-500 ${config.isLocked ? 'grayscale-[0.5] pointer-events-none select-none' : ''}`}>

            {/* 1. Alert Banner - Giống code chính */}

                <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-xl">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-xl">
                            <Star size={18} className="animate-pulse" />
                        </div>
                        <p className="text-sm font-bold">Bạn đang trải nghiệm giao diện Đại lý với dữ liệu đã đồng bộ.</p>
                    </div>
                    <button onClick={() => navigate('/demo')} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all">
                        Đổi vai trò
                    </button>
                </div>


            {/* 2. Tài chính Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Hạng Đại lý */}
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hạng đại lý</p>
                            <div
                                className="text-white px-4 py-1 rounded-lg font-black text-sm inline-block italic shadow-lg"
                                style={{ backgroundColor: agency.rank.color, boxShadow: `0 4px 12px ${agency.rank.color}40` }}
                            >
                                {agency.rank.name}
                            </div>
                        </div>
                        <Trophy style={{ color: agency.rank.color }} className="group-hover:scale-110 transition-transform" size={28} />
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 leading-tight italic mb-3">
                        {agency.rank.description}
                    </p>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full transition-all duration-1000 ease-out"
                            style={{ width: `${agency.rank.progress}%`, backgroundColor: agency.rank.color }}
                        />
                    </div>
                    <p className="text-[9px] text-right mt-1 font-bold text-slate-400 uppercase tracking-tighter">
                        {agency.rank.progress}% đến hạng PLATINUM
                    </p>
                </div>

                {/* Sức mua khả dụng */}
                <div className={`bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 transition-all ${accountStatus === 'STAGE2' ? 'ring-2 ring-red-500' : ''}`}>
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sức mua (Ví + Tín dụng)</p>
                        <Wallet className="text-emerald-500" size={20} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tighter">
                        {formatVND(agency.finance.walletBalance + agency.finance.availableCredit)}
                    </h2>
                    <div className="space-y-2 text-[11px] mb-4">
                        <div className="flex justify-between">
                            <span className="font-bold text-slate-500 tracking-tight italic">Số dư ví:</span>
                            <span className="font-black text-slate-800">{formatVND(agency.finance.walletBalance)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-bold text-slate-500 tracking-tight italic">Tín dụng khả dụng:</span>
                            <span className="font-black text-emerald-600">{formatVND(agency.finance.availableCredit)}</span>
                        </div>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 rounded-xl text-[10px] font-black uppercase hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100">
                        Nạp tiền vào ví
                    </button>
                </div>

                {/* Dư nợ công nợ */}
                <div className={`p-6 rounded-[32px] shadow-sm border transition-all ${accountStatus === 'NORMAL' ? 'bg-white border-slate-100' : 'bg-red-50 border-red-100'}`}>
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Dư nợ hiện tại</p>
                    <h2 className="text-2xl font-black text-red-600 mb-1 tracking-tighter">
                        {formatVND(agency.finance.currentCredit)}
                    </h2>
                    <p className="text-[10px] font-bold text-slate-500 mb-6 italic tracking-tighter">
                        Hạn thanh toán: {agency.finance.dueDate}
                    </p>
                    <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-black text-xs uppercase shadow-lg hover:bg-black transition-all active:scale-95">
                        Thanh toán nợ
                    </button>
                </div>
            </div>

            {/* 3. Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <StatCard icon={<CheckCircle2 className="text-emerald-500"/>} label="Đơn mới" value={agency.stats.newBookings} sub="Hôm nay" />
                <StatCard icon={<Calendar className="text-blue-500"/>} label="Sắp khởi hành" value={agency.stats.checkins} sub="Check-in tới" />
                <StatCard icon={<Users className="text-slate-400"/>} label="Nhân sự" value={agency.stats.staff} sub="Thành viên" />
            </div>

            {/* 4. Chart & Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Biểu đồ doanh thu */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                    <h3 className="font-black text-slate-800 uppercase tracking-tighter mb-8 flex items-center justify-between">
                        Doanh số đặt phòng gần đây
                        <span className="text-[10px] text-blue-600 bg-blue-50 px-3 py-1 rounded-full tracking-widest uppercase">VNĐ</span>
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}}/>
                                <YAxis hide/>
                                <Tooltip cursor={{fill: '#f8fafc'}} content={<CustomTooltip/>}/>
                                <Bar dataKey="revenue" radius={[6, 6, 0, 0]} barSize={32}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#3b82f6' : '#93c5fd'}/>
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Giao dịch gần nhất */}
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                    <h3 className="font-black text-slate-800 uppercase tracking-tighter mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-blue-600"/> Giao dịch gần nhất
                    </h3>
                    <div className="space-y-6">
                        {transactions.map((trans) => (
                            <ActivityItem
                                key={trans.id}
                                time={trans.createdAt.split(' ')[1]}
                                desc={trans.description}
                                amount={`${trans.direction === 'IN' ? '+' : '-'}${formatVND(trans.amount)}`}
                                type={trans.direction === 'IN' ? 'success' : 'danger'}
                                icon={trans.direction === 'IN' ? <ArrowUpRight size={12}/> : <ArrowDownLeft size={12}/>}
                            />
                        ))}
                    </div>
                    <button className="w-full mt-8 py-2 text-[10px] font-black text-slate-400 uppercase hover:text-blue-600 transition-colors border-t border-slate-50 pt-4 tracking-widest">
                        Xem tất cả lịch sử
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Sub-components (Giữ style code chính) ---
const StatCard = ({icon, label, value, sub}) => (
    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-2 hover:translate-y-[-4px] transition-all cursor-default group">
        <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-blue-50 transition-colors">{icon}</div>
        <div className="text-2xl font-black text-slate-900 tracking-tighter">{value}</div>
        <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{label}</p>
        <p className="text-[9px] font-bold text-slate-400 uppercase italic">{sub}</p>
    </div>
);

const ActivityItem = ({ time, desc, amount, type, icon }) => (
    <div className="flex gap-4 items-start group">
        <div className={`mt-1 p-1.5 rounded-lg shrink-0 ${type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {icon}
        </div>
        <div className="space-y-0.5 flex-1 overflow-hidden text-left">
            <p className="text-[11px] font-black text-slate-700 leading-tight truncate">{desc}</p>
            <div className="flex justify-between items-center">
                <span className={`text-[10px] font-black ${type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>{amount}</span>
                <span className="text-[9px] font-bold text-slate-300">{time}</span>
            </div>
        </div>
    </div>
);

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800">
                <p className="text-[10px] font-black uppercase mb-1 opacity-60 tracking-widest">Ngày {payload[0].payload.day}</p>
                <p className="text-sm font-black text-blue-400 leading-none">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(payload[0].value)}
                </p>
            </div>
        );
    }
    return null;
};

export default DemoAgencyDashboard;