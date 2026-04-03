import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Trophy, Wallet, Users,
    Calendar, CheckCircle2, TrendingUp, Loader2, Star
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from 'recharts';

// Import dữ liệu từ file constant của bạn
import { MOCK_AGENCY_DATA, MOCK_CHART_DATA } from '@/constant/agency_mockData.js';

const DemoAgencyDashboard = () => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [agency] = useState(MOCK_AGENCY_DATA);

    const [chartData] = useState(MOCK_CHART_DATA || [
        { day: "01/04", revenue: 12000000 },
        { day: "02/04", revenue: 8500000 },
        { day: "03/04", revenue: 15000000 },
        { day: "04/04", revenue: 21000000 },
        { day: "05/04", revenue: 18000000 },
        { day: "06/04", revenue: 25000000 },
        { day: "Today", revenue: 32000000 },
    ]);

    const [activities] = useState([
        { time: "10:30", description: "Thanh toán đơn hàng #BK9902", amount: 4500000, direction: "OUT" },
        { time: "09:15", description: "Nạp tiền vào ví qua VNPay", amount: 10000000, direction: "IN" },
        { time: "Hôm qua", description: "Hoàn tiền hủy phòng #BK9850", amount: 1200000, direction: "IN" },
        { time: "Hôm qua", description: "Thanh toán đơn hàng #BK9901", amount: 2800000, direction: "OUT" },
    ]);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const formatVND = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                <p className="font-bold text-slate-600 uppercase tracking-widest text-[10px]">Đang khởi tạo dữ liệu đại lý...</p>
            </div>
        );
    }

    const availablePurchasingPower = agency.finance.walletBalance + (agency.finance.creditLimit - agency.finance.currentDebt);

    return (
        <div className="space-y-6">
            {/* Banner thông báo chế độ Demo */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-xl">
                        <Star size={18} className="animate-pulse" />
                    </div>
                    <p className="text-sm font-bold">Bạn đang trải nghiệm giao diện Đại lý với dữ liệu đã đồng bộ.</p>
                </div>
                <button
                    onClick={() => navigate('/demo')}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all"
                >
                    Đổi vai trò
                </button>
            </div>

            {/* 2. Tài chính Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Hạng */}
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hạng đại lý</p>
                            <div className="bg-amber-400 text-white px-4 py-1 rounded-lg font-black text-sm inline-block italic shadow-lg shadow-amber-100">
                                {agency.rank.name}
                            </div>
                        </div>
                        <Trophy className="text-amber-400 group-hover:scale-110 transition-transform" size={32} />
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 italic mb-3">{agency.rank.description}</p>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 transition-all duration-1000" style={{ width: `${agency.rank.progress}%` }} />
                    </div>
                    <p className="text-[9px] text-right mt-1 font-bold text-slate-400">{agency.rank.progress}% đến hạng PLATINUM</p>
                </div>

                {/* Sức mua */}
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sức mua khả dụng</p>
                        <Wallet className="text-emerald-500" size={20} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-4">
                        {formatVND(availablePurchasingPower)}
                    </h2>
                    <div className="space-y-2 text-[11px]">
                        <div className="flex justify-between font-bold">
                            <span className="text-slate-500">Ví tiền:</span>
                            <span className="text-slate-800">{formatVND(agency.finance.walletBalance)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                            <span className="text-slate-500">Tín dụng còn lại:</span>
                            <span className="text-slate-800">{formatVND(agency.finance.creditLimit - agency.finance.currentDebt)}</span>
                        </div>
                    </div>
                </div>

                {/* Dư nợ */}
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dư nợ tín dụng</p>
                    <h2 className="text-2xl font-black text-red-500 mb-1">{formatVND(agency.finance.currentDebt)}</h2>
                    <p className="text-[10px] font-bold text-slate-500 mb-6 italic">Hạn thanh toán: {agency.finance.dueDate}</p>
                    <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-black text-xs uppercase hover:bg-black transition-all">
                        Thanh toán ngay
                    </button>
                </div>
            </div>

            {/* 3. Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <StatCard icon={<CheckCircle2 className="text-emerald-500"/>} label="Đơn mới" value={agency.stats.newBookings} sub="Tăng 20% so với hôm qua" />
                <StatCard icon={<Calendar className="text-blue-500"/>} label="Sắp khởi hành" value={agency.stats.checkins} sub="Khách sẽ check-in sớm" />
                <StatCard icon={<Users className="text-slate-400"/>} label="Nhân sự" value={agency.stats.staff} sub="Đang trực tuyến" />
            </div>

            {/* 4. Chart & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                    <h3 className="font-black text-slate-800 uppercase tracking-tighter mb-8">Biểu đồ doanh thu 7 ngày</h3>
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

                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                    <h3 className="font-black text-slate-800 uppercase tracking-tighter mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-blue-600"/> Giao dịch gần đây
                    </h3>
                    <div className="space-y-6">
                        {activities.map((act, idx) => (
                            <ActivityItem
                                key={idx}
                                time={act.time}
                                desc={act.description}
                                amount={`${act.direction === 'IN' ? '+' : '-'}${formatVND(act.amount)}`}
                                type={act.direction === 'IN' ? 'success' : 'debt'}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Sub-components ---
const StatCard = ({icon, label, value, sub}) => (
    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-2 hover:translate-y-[-4px] transition-all">
        <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
        <div className="text-2xl font-black text-slate-900">{value}</div>
        <p className="text-[10px] font-black text-slate-800 uppercase">{label}</p>
        <p className="text-[9px] font-bold text-slate-400">{sub}</p>
    </div>
);

const ActivityItem = ({ time, desc, amount, type }) => (
    <div className="flex gap-4 items-start">
        <span className="text-[10px] font-black text-slate-400 mt-1 w-12">{time}</span>
        <div className="space-y-1">
            <p className="text-xs font-bold text-slate-700 leading-tight">{desc}</p>
            <p className={`text-[10px] font-black ${type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>{amount}</p>
        </div>
    </div>
);

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800">
                <p className="text-[10px] font-black uppercase mb-1">Ngày {payload[0].payload.day}</p>
                <p className="text-sm font-black text-blue-400">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payload[0].value)}</p>
            </div>
        );
    }
    return null;
};

export default DemoAgencyDashboard;