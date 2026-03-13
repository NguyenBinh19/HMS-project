import React from 'react';
import {
    TrendingUp, Users, BedDouble, Star,
    ChevronRight, Eye, MessageSquare, AlertCircle,
    Clock, CheckCircle2, MoreHorizontal, ArrowUpRight,
    ShieldCheck, Calendar, Activity
} from 'lucide-react';

const HotelDashboard = () => {
    return (
        <div className="p-10 bg-[#F4F7FE] min-h-screen font-sans antialiased text-[#1B2559]">
            <div className="max-w-[1600px] mx-auto space-y-10">

                {/* HEADER AREA */}
                <div className="flex justify-between items-center">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tight text-[#1B2559]">Dashboard</h1>
                        <p className="text-[#A3AED0] font-bold text-sm flex items-center gap-2">
                            Theo dõi và quản lý toàn bộ hoạt động vận hành khách sạn
                        </p>
                    </div>
                </div>

                {/* 1. TOP INDICATORS (4 CARDS) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
                    <StatCard
                        label="Doanh thu hôm nay"
                        value="15.500.000 đ"
                        sub="+10% so với hôm qua"
                        subColor="text-[#05CD99]"
                        footer="Đã trừ phí hoa hồng sàn"
                        icon={<TrendingUp size={20} className="text-[#4318FF]" />}
                    />
                    <StatCard
                        label="Tỷ lệ lấp đầy"
                        value="85%"
                        progress={85}
                        footer="45/60 Phòng đã bán"
                        icon={<BedDouble size={20} className="text-[#4318FF]" />}
                    />
                    <StatCard
                        label="Giá bình quân (ADR)"
                        value="1.250.000 đ"
                        footer="Giá bán trung bình/đêm"
                        icon={<Star size={20} className="text-[#4318FF]" />}
                    />
                    <TrustScoreCard score={98} />
                </div>

                {/* 2. MAIN CONTENT GRID */}
                <div className="grid grid-cols-12 gap-8">

                    {/* Left Side: Live Feed Table (8 Columns) */}
                    <div className="col-span-12 lg:col-span-8 space-y-8">
                        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                                <h3 className="text-xl font-black uppercase tracking-tighter text-[#1B2559]">
                                    Đơn đặt phòng vừa nhận <span className="text-blue-500 ml-2">(Live)</span>
                                </h3>
                                <div className="flex items-center gap-2 text-[#4318FF] font-black text-xs cursor-pointer hover:underline">
                                    LÀM MỚI <Clock size={14}/>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#F4F7FE]/50">
                                    <tr className="text-[11px] font-black text-[#A3AED0] uppercase tracking-widest">
                                        <th className="px-8 py-5">Thời gian</th>
                                        <th className="px-4 py-5">Agency</th>
                                        <th className="px-4 py-5">Booking Info</th>
                                        <th className="px-4 py-5">Doanh thu</th>
                                        <th className="px-4 py-5">Trạng thái</th>
                                        <th className="px-8 py-5 text-right">Thao tác</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                    <BookingRow time="Vừa xong" agency="Saigontourist" rank="Rank S" rColor="bg-orange-100 text-orange-600" bId="#BK-8899" guest="Nguyen Van A" info="x2 Phòng | 20/05-22/05" rev="3.600.000 đ" />
                                    <BookingRow time="2 phút trước" agency="Vietravel" rank="Rank A" rColor="bg-blue-100 text-blue-600" bId="#BK-8900" guest="Le Thi B" info="x1 Phòng | 25/05-27/05" rev="2.800.000 đ" />
                                    <BookingRow time="5 phút trước" agency="Fiditour" rank="Rank A" rColor="bg-blue-100 text-blue-600" bId="#BK-8901" guest="Tran Thi C" info="x3 Phòng | 30/05-01/06" rev="5.200.000 đ" />
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Revenue Chart Placeholder (Giống mẫu 1) */}
                        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 h-[300px]">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl font-black uppercase tracking-tighter text-[#1B2559]">So sánh doanh thu</h3>
                                <div className="flex gap-4">
                                    <span className="flex items-center gap-2 text-[10px] font-bold text-[#A3AED0] uppercase"><div className="w-3 h-3 bg-blue-500 rounded-sm" /> Tháng này</span>
                                    <span className="flex items-center gap-2 text-[10px] font-bold text-[#A3AED0] uppercase"><div className="w-3 h-3 bg-slate-200 rounded-sm" /> Tháng trước</span>
                                </div>
                            </div>
                            <div className="flex items-end justify-between h-40 gap-3 px-4">
                                {[40, 70, 45, 90, 65, 80, 50, 85, 60, 95].map((h, i) => (
                                    <div key={i} className="flex-1 bg-slate-100 rounded-t-xl relative group">
                                        <div style={{height: `${h}%`}} className="bg-blue-500 rounded-t-xl transition-all group-hover:bg-blue-600"></div>
                                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#A3AED0]">T{i+1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Sidebar (4 Columns) */}
                    <div className="col-span-12 lg:col-span-4 space-y-8">

                        {/* Action Items (Việc cần xử lý) */}
                        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
                            <h3 className="text-lg font-black uppercase tracking-tight text-[#1B2559] mb-8">Việc cần xử lý</h3>
                            <div className="space-y-6">
                                <TaskItem color="#EE5D50" title="Khiếu nại (Dispute)" desc="Agency A yêu cầu hoàn tiền #BK-99..." link="Xem chi tiết" />
                                <TaskItem color="#FFB547" title="Sắp hết phòng" desc="Ngày 30/04 chỉ còn 1 phòng Deluxe." link="Quản lý phòng" />
                                <TaskItem color="#05CD99" title="Check-in" desc="5 đoàn khách sắp đến vào 14:00." link="Chuẩn bị phòng" />
                            </div>
                        </div>

                        {/* Quick Info & Stats */}
                        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
                            <h3 className="text-lg font-black uppercase tracking-tight text-[#1B2559] mb-6">Thông tin nhanh</h3>
                            <div className="space-y-4">
                                <InfoRow label="Tổng phòng" value="60" />
                                <InfoRow label="Đang lưu trú" value="22" />
                                <InfoRow label="Đặt trước" value="45" />
                                <InfoRow label="Tỷ lệ hủy" value="5%" valueColor="text-red-500" />
                            </div>
                            <button className="w-full mt-8 py-4 bg-[#F4F7FE] text-[#4318FF] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#4318FF] hover:text-white transition-all">
                                Xem toàn bộ kho phòng
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

// --- SUB COMPONENTS ---

const StatCard = ({ label, value, sub, subColor, footer, progress, icon }) => (
    <div className="bg-white p-7 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-md transition-all group">
        <div className="flex justify-between items-start mb-4">
            <p className="text-[11px] font-black text-[#A3AED0] uppercase tracking-[0.15em]">{label}</p>
            <div className="p-2 bg-[#F4F7FE] rounded-xl group-hover:bg-[#4318FF] group-hover:text-white transition-all">
                {icon}
            </div>
        </div>
        <div className="space-y-1">
            <h2 className="text-3xl font-black text-[#1B2559]">{value}</h2>
            {sub && <p className={`text-xs font-bold ${subColor}`}>{sub}</p>}
        </div>
        {progress !== undefined && (
            <div className="mt-4 h-2 w-full bg-[#F4F7FE] rounded-full overflow-hidden">
                <div className="h-full bg-[#4318FF]" style={{width: `${progress}%`}}></div>
            </div>
        )}
        <p className="mt-4 text-[10px] font-bold text-[#A3AED0] uppercase italic">{footer}</p>
    </div>
);

const TrustScoreCard = ({ score }) => (
    <div className="bg-white p-7 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center justify-center relative group">
        <p className="absolute top-7 left-7 text-[11px] font-black text-[#A3AED0] uppercase tracking-[0.15em]">Điểm tín nhiệm</p>
        <div className="relative w-24 h-24 flex items-center justify-center mt-4">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="48" cy="48" r="44" fill="transparent" stroke="#F4F7FE" strokeWidth="8" />
                <circle cx="48" cy="48" r="44" fill="transparent" stroke="#4318FF" strokeWidth="8" strokeDasharray="276" strokeDasharray={`${(score / 100) * 276} 276`} strokeLinecap="round" />
            </svg>
            <span className="text-2xl font-black text-[#1B2559]">{score}</span>
        </div>
        <p className="mt-3 text-[10px] font-black text-[#A3AED0] uppercase">Uy tín (80-100 điểm)</p>
    </div>
);

const BookingRow = ({ time, agency, rank, rColor, bId, guest, info, rev }) => (
    <tr className="hover:bg-[#F4F7FE]/50 transition-all group">
        <td className="px-8 py-6 text-xs font-black text-[#1B2559] uppercase italic">{time}</td>
        <td className="px-4 py-6">
            <div className="space-y-1">
                <p className="text-sm font-black text-[#1B2559]">{agency}</p>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase ${rColor}`}>🏆 {rank}</span>
            </div>
        </td>
        <td className="px-4 py-6">
            <div className="space-y-0.5 text-xs">
                <p className="font-black text-[#1B2559]">{guest} <span className="text-[#A3AED0] font-bold">{bId}</span></p>
                <p className="text-[#A3AED0] font-medium">{info}</p>
            </div>
        </td>
        <td className="px-4 py-6 text-sm font-black text-[#1B2559]">{rev}</td>
        <td className="px-4 py-6">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#05CD99] shadow-[0_0_8px_rgba(5,205,153,0.5)]"></div>
                <div className="text-[10px] font-black text-[#05CD99] uppercase">Confirmed <span className="text-slate-400 block text-[8px]">(Paid)</span></div>
            </div>
        </td>
        <td className="px-8 py-6 text-right">
            <button className="p-3 bg-white border border-slate-100 rounded-2xl text-[#4318FF] hover:bg-[#4318FF] hover:text-white transition-all shadow-sm">
                <ArrowUpRight size={18}/>
            </button>
        </td>
    </tr>
);

const TaskItem = ({ color, title, desc, link }) => (
    <div className="flex gap-4 group cursor-pointer">
        <div className="w-1.5 h-12 rounded-full" style={{backgroundColor: color}}></div>
        <div className="flex-1 space-y-1">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-black text-[#1B2559]">{title}</h4>
                <span className="text-[10px] font-black text-[#4318FF] uppercase tracking-wider group-hover:underline">{link}</span>
            </div>
            <p className="text-xs font-bold text-[#A3AED0] line-clamp-1">{desc}</p>
        </div>
    </div>
);

const InfoRow = ({ label, value, valueColor = "text-[#1B2559]" }) => (
    <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
        <span className="text-sm font-bold text-[#A3AED0]">{label}:</span>
        <span className={`text-sm font-black ${valueColor}`}>{value}</span>
    </div>
);

export default HotelDashboard;