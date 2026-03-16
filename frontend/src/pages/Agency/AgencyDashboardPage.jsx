import React, { useState } from 'react';
import {
    Trophy, Wallet, AlertTriangle, Users,
    Calendar, MessageSquare, ArrowUpRight,
    Lock, CheckCircle2, AlertCircle, TrendingUp
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from 'recharts';

// Giả lập dữ liệu biểu đồ
const chartData = Array.from({ length: 15 }, (_, i) => ({
    day: (i + 1).toString().padStart(2, '0'),
    revenue: Math.floor(Math.random() * 10000000) + 5000000,
}));

const AgencyDashboard = () => {
    // Trạng thái tài khoản: 'NORMAL' | 'STAGE1' (Warning) | 'STAGE2' (Locked)
    const [accountStatus, setAccountStatus] = useState('NORMAL');

    // Style theo trạng thái nợ
    const getStatusConfig = () => {
        switch (accountStatus) {
            case 'STAGE1':
                return {
                    banner: "bg-amber-50 border-amber-200 text-amber-800",
                    bannerIcon: <AlertTriangle className="text-amber-500" />,
                    bannerMsg: "Tài khoản quá hạn. Lãi phạt 0.03%/ngày đang được áp dụng. Vui lòng thanh toán để tránh bị khóa hệ thống.",
                    isLocked: false
                };
            case 'STAGE2':
                return {
                    banner: "bg-red-600 border-red-700 text-white",
                    bannerIcon: <Lock className="text-white" />,
                    bannerMsg: "DỊCH VỤ ĐÃ BỊ KHÓA. Quá hạn > 15 ngày làm việc. Lãi phạt 0.05%/ngày. Vui lòng tất toán nợ để tiếp tục sử dụng.",
                    isLocked: true
                };
            default:
                return { banner: null, isLocked: false };
        }
    };

    const config = getStatusConfig();

    return (
        <div className={`p-6 bg-slate-50 min-h-screen space-y-6 ${config.isLocked ? 'grayscale-[0.5]' : ''}`}>

            {/* 1. Sticky Alert Banner */}
            {config.banner && (
                <div className={`flex items-center gap-3 p-4 rounded-2xl border shadow-sm animate-pulse ${config.banner}`}>
                    {config.bannerIcon}
                    <p className="font-bold text-sm tracking-tight">{config.bannerMsg}</p>
                </div>
            )}

            {/* 2. Top Widgets Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Rank Widget */}
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hạng thành viên</p>
                            <div className="bg-amber-500 text-white px-4 py-1 rounded-lg font-black text-sm inline-block italic">RANK A</div>
                        </div>
                        <Trophy className="text-amber-400" size={32} />
                    </div>
                    <div className="space-y-2">
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 w-[70%]" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-500">Cần thêm 20.000.000đ doanh số để lên Rank S</p>
                        <button className="text-blue-600 font-black text-[10px] uppercase hover:underline">Xem quyền lợi Rank</button>
                    </div>
                </div>

                {/* Financial Widget */}
                <div className={`bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 transition-all ${accountStatus === 'STAGE2' ? 'ring-2 ring-red-500' : ''}`}>
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tài chính (Sức mua)</p>
                        <Wallet className={accountStatus === 'NORMAL' ? 'text-emerald-500' : 'text-red-500'} size={20} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4">250.000.000 đ</h2>
                    <div className="space-y-2 text-xs mb-4">
                        <div className="flex justify-between">
              <span className="flex items-center gap-2 font-bold text-slate-500">
                <div className="w-2 h-2 rounded-full bg-emerald-500" /> Ví tiền mặt (Prepaid)
              </span>
                            <span className="font-black text-slate-800">150.000.000 đ</span>
                        </div>
                        <div className="flex justify-between">
              <span className="flex items-center gap-2 font-bold text-slate-500">
                <div className="w-2 h-2 rounded-full bg-blue-500" /> Tín dụng (Credit)
              </span>
                            <span className="font-black text-slate-800">100.000.000 đ</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button disabled={config.isLocked} className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-[10px] font-black uppercase disabled:bg-slate-300">Nạp tiền</button>
                        <button className="flex-1 border border-slate-200 py-2 rounded-xl text-[10px] font-black uppercase">Gia hạn hạn mức</button>
                    </div>
                </div>

                {/* Debt Widget */}
                <div className={`p-6 rounded-[32px] shadow-sm border transition-all ${accountStatus === 'NORMAL' ? 'bg-white border-slate-100' : 'bg-red-50 border-red-100'}`}>
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Nghĩa vụ nợ (Principal + Penalty)</p>
                    <h2 className="text-3xl font-black text-red-600 mb-1">15.000.000 đ</h2>
                    <p className="text-[10px] font-bold text-slate-500 mb-6 italic">Lãi phạt dự kiến: {accountStatus === 'NORMAL' ? '0đ' : '450.000đ'}</p>
                    <div className="flex items-center justify-between mb-4 text-[10px] font-black">
                        <span className="text-slate-400 uppercase">Hạn thanh toán:</span>
                        <span className="text-slate-900">25/11/2026</span>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-black text-xs uppercase shadow-lg shadow-blue-200 hover:bg-blue-700">
                        Thanh toán ngay
                    </button>
                </div>
            </div>

            {/* 3. Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <StatCard icon={<CheckCircle2 className="text-emerald-500"/>} label="Mới đặt" value="5" sub="Booking trong 24h qua" />
                <StatCard icon={<Calendar className="text-slate-400"/>} label="Sắp khởi hành" value="12" sub="Check-in trong 3 ngày tới" />
                <StatCard icon={<AlertCircle className="text-red-500"/>} label="Khiếu nại" value="1" sub="Cần xử lý gấp" highlight />
                <StatCard icon={<Users className="text-blue-500"/>} label="Nhân viên Active" value="3/5" sub="Online hôm nay" />
            </div>

            {/* 4. Chart & Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-black text-slate-800 uppercase tracking-tighter">Doanh số & Ngân sách</h3>
                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
                            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded-sm"/> Doanh số</span>
                            <span className="flex items-center gap-1"><div className="w-3 h-3 border-t-2 border-dashed border-red-400"/> Ngưỡng cảnh báo</span>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                                <YAxis hide />
                                <Tooltip cursor={{fill: '#f8fafc'}} content={<CustomTooltip />} />
                                <Bar dataKey="revenue" radius={[6, 6, 0, 0]} barSize={24}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 10 ? '#3b82f6' : '#93c5fd'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity - Audit */}
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                    <h3 className="font-black text-slate-800 uppercase tracking-tighter mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-blue-600"/> Hoạt động gần đây
                    </h3>
                    <div className="space-y-6">
                        <ActivityItem time="10:05" desc="Nhân viên A đặt thành công Mường Thanh Luxury" amount="-2.500.000đ" type="debt" />
                        <ActivityItem time="09:30" desc="Admin đã duyệt yêu cầu nạp tiền" amount="+50.000.000đ" type="success" />
                        <ActivityItem time="08:00" desc="Hệ thống tự động trừ nợ đến hạn" amount="-5.000.000đ" type="debt" />
                        <ActivityItem time="06:30" desc="Yêu cầu hạn mức mới được gửi đi" amount="Số tiền: 50.000.000đ" type="info" />
                    </div>
                </div>
            </div>

            {/* Control Panel (demo chuyển trạng thái) */}
            <div className="fixed bottom-4 right-4 bg-white p-2 rounded-full shadow-2xl border flex gap-2">
                <button onClick={() => setAccountStatus('NORMAL')} className="p-2 bg-emerald-500 text-white rounded-full"><CheckCircle2 size={16}/></button>
                <button onClick={() => setAccountStatus('STAGE1')} className="p-2 bg-amber-500 text-white rounded-full"><AlertTriangle size={16}/></button>
                <button onClick={() => setAccountStatus('STAGE2')} className="p-2 bg-red-500 text-white rounded-full"><Lock size={16}/></button>
            </div>
        </div>
    );
};

// --- Sub-components ---

const StatCard = ({ icon, label, value, sub, highlight }) => (
    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-2">
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
        <span className="text-[10px] font-black text-slate-400 mt-1">{time}</span>
        <div className="space-y-1">
            <p className="text-xs font-bold text-slate-700 leading-tight">{desc}</p>
            <p className={`text-[10px] font-black ${type === 'success' ? 'text-emerald-500' : type === 'debt' ? 'text-red-500' : 'text-blue-500'}`}>
                {amount}
            </p>
        </div>
    </div>
);

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800">
                <p className="text-[10px] font-black uppercase mb-1">Doanh số ngày {payload[0].payload.day}</p>
                <p className="text-sm font-black text-blue-400">{new Intl.NumberFormat('vi-VN').format(payload[0].value)} đ</p>
            </div>
        );
    }
    return null;
};

export default AgencyDashboard;