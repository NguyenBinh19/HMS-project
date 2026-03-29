import React from 'react';
import {
    TrendingUp, Wallet, Users, Calendar,
    ArrowUpRight, FileCheck, Landmark, AlertCircle,
    Search, Server, Zap, Globe, Download
} from 'lucide-react';

const AdminDashboard = () => {
    return (
        <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans text-[#1B2559]">
            <div className="max-w-[1600px] mx-auto space-y-8">

                {/* 1. Header & Filters */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[24px] shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-black">ADMIN DASHBOARD</h1>
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            {['Hôm nay', '7 ngày qua', 'Tháng này', 'Quý này'].map((tab, i) => (
                                <button key={tab} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${i === 0 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-blue-600'}`}>
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                            <Calendar size={16} className="text-slate-400 mr-2" />
                            <input type="text" placeholder="01/01/2026 - 31/01/2026" className="bg-transparent border-none text-xs font-bold outline-none w-44" />
                        </div>
                        <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-800 transition-all">
                            <Download size={16} /> Xuất báo cáo
                        </button>
                    </div>
                </div>

                {/* 2. Top Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        label="Tổng giá trị giao dịch (GMV)" value="5.200.000.000 đ" trend="+12%"
                        sub="Tổng số tiền Agency đã thanh toán" icon={<TrendingUp size={20} />} color="blue"
                    />
                    <StatCard
                        label="Doanh thu hoa hồng (Net)" value="520.000.000 đ" trend="+8%"
                        sub="Phần trăm sàn được hưởng" icon={<Wallet size={20} />} color="emerald"
                    />
                    <StatCard
                        label="Người dùng đang hoạt động" value="450" live
                        sub="Agency: 300 | Khách: 150" icon={<Users size={20} />} color="indigo"
                    />
                    <StatCard
                        label="Số đơn đặt phòng" value="1.250" trend="+5%"
                        sub="Thành công: 1.000 | Khiếu nại: 50" icon={<Calendar size={20} />} color="orange"
                    />
                </div>

                {/* 3. Analytics & Urgent Tasks Area */}
                <div className="grid grid-cols-12 gap-8">

                    {/* User Trend Chart (8 Columns) */}
                    <div className="col-span-12 lg:col-span-8 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-black uppercase tracking-tighter">Xu hướng người dùng mới</h3>
                            <span className="text-xs text-slate-400 font-bold">(30 ngày gần nhất)</span>
                        </div>
                        <div className="space-y-4">
                            {[32, 48, 42, 56, 48, 52, 64].map((val, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <span className="w-16 text-[10px] font-black text-slate-400 uppercase tracking-tighter">Ngày {i*5 + 1}</span>
                                    <div className="flex-1 h-8 bg-slate-50 rounded-lg overflow-hidden relative">
                                        <div style={{ width: `${val}%` }} className="h-full bg-blue-500 rounded-lg transition-all hover:bg-blue-600 cursor-pointer"></div>
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black">{val}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 p-4 bg-blue-50 rounded-2xl flex items-center gap-3 border border-blue-100">
                            <Zap size={18} className="text-blue-600 animate-pulse" />
                            <p className="text-xs font-bold text-blue-700">Cảnh báo: Chiến dịch Marketing đang thu hút Agency hiệu quả hơn tuần qua.</p>
                        </div>
                    </div>

                    {/* Urgent Tasks (4 Columns) */}
                    <div className="col-span-12 lg:col-span-4 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-black uppercase tracking-tighter">Cần xử lý gấp</h3>
                            <span className="bg-red-100 text-red-600 text-[10px] px-2 py-1 rounded-lg font-black italic">17 yêu cầu</span>
                        </div>
                        <div className="space-y-4">
                            <UrgentItem icon={<FileCheck className="text-amber-600"/>} bg="bg-amber-50" title="5 Hồ sơ KYC mới" desc="Chờ duyệt tính danh Agency" />
                            <UrgentItem icon={<Landmark className="text-emerald-600"/>} bg="bg-emerald-50" title="10 Lệnh rút tiền" desc="Tổng giá trị 800.000.000 đ" />
                            <UrgentItem icon={<AlertCircle className="text-red-600"/>} bg="bg-red-50" title="2 Khiếu nại" desc="Agency khiếu nại Khách sạn" />
                        </div>
                    </div>
                </div>

                {/* 4. System Health Section */}
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-black uppercase tracking-tighter">Sức khỏe hệ thống</h3>
                        <span className="text-[10px] font-bold text-slate-400 italic">Cập nhật: 1 phút trước</span>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Server Status */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-black uppercase"><span>CPU Load</span><span>45%</span></div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[45%]"></div></div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-black uppercase"><span>RAM Usage</span><span>60%</span></div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[60%]"></div></div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-black uppercase"><span>Dung lượng CS dữ liệu</span><span>50GB / 100GB</span></div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 w-[50%]"></div></div>
                            </div>
                        </div>
                        {/* API Latency */}
                        <div className="grid grid-cols-1 gap-4">
                            <LatencyItem icon={<Search size={16}/>} label="Search Engine" time="120ms" status="Mượt" sColor="text-emerald-500" />
                            <LatencyItem icon={<Globe size={16}/>} label="Booking Service" time="300ms" status="Hơi chậm" sColor="text-amber-500" />
                            <LatencyItem icon={<Zap size={16}/>} label="Payment Gateway" time="Connected" status="Ổn định" sColor="text-emerald-500" />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

// --- Sub-components ---

const StatCard = ({ label, value, trend, sub, icon, color, live }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-600",
        emerald: "bg-emerald-50 text-emerald-600",
        indigo: "bg-indigo-50 text-indigo-600",
        orange: "bg-orange-50 text-orange-600"
    };
    return (
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${colors[color]}`}>{icon}</div>
                {trend && <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">↑ {trend}</span>}
                {live && <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"/> Online</span>}
            </div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <h2 className="text-2xl font-black text-[#1B2559] mb-2">{value}</h2>
            <p className="text-[10px] font-bold text-slate-400">{sub}</p>
        </div>
    );
};

const UrgentItem = ({ icon, bg, title, desc }) => (
    <div className={`flex items-center gap-4 p-4 rounded-2xl ${bg} cursor-pointer hover:scale-[1.02] transition-all`}>
        <div className="p-3 bg-white rounded-xl shadow-sm">{icon}</div>
        <div className="flex-1">
            <h4 className="text-sm font-black text-slate-800">{title}</h4>
            <p className="text-[10px] font-bold text-slate-500">{desc}</p>
        </div>
        <ArrowUpRight size={16} className="text-slate-400" />
    </div>
);

const LatencyItem = ({ icon, label, time, status, sColor }) => (
    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-xs text-slate-400">{icon}</div>
            <span className="text-xs font-black text-slate-700">{label}</span>
        </div>
        <div className="text-right">
            <p className="text-xs font-black text-slate-800">{time}</p>
            <p className={`text-[9px] font-black uppercase ${sColor}`}>{status}</p>
        </div>
    </div>
);

export default AdminDashboard;