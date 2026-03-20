import React, { useState } from 'react';
import {
    BarChart3, Download, Calendar, Filter,
    DollarSign, PieChart, TrendingUp, ChevronDown
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';
import KPICard from '@/components/hotel/report/KPICard';

const RevenueReport = () => {
    // 1. Lựa chọn tham số (UC069.0 - Bước 2)
    const [dateRange, setDateRange] = useState("30_ngay");
    const [granularity, setGranularity] = useState("daily"); // daily, weekly, monthly
    const [agencyFilter, setAgencyFilter] = useState("Tat_ca");

    // Dữ liệu mô phỏng theo Logic tính toán KPI (Bước 5)
    const mockData = {
        summary: [
            { title: "Tổng doanh thu Net", value: 1240500000, unit: "VNĐ", trend: "12.5", isUp: true },
            { title: "Công suất phòng", value: 78.2, unit: "%", trend: "5.2", isUp: true },
            { title: "Giá trung bình (ADR)", value: 1580000, unit: "VNĐ", trend: "2.1", isUp: false },
            { title: "Doanh thu/Phòng (RevPAR)", value: 1235000, unit: "VNĐ", trend: "8.4", isUp: true }
        ],
        chart: [
            { name: '01/02', doanh_thu: 45000000 },
            { name: '05/02', doanh_thu: 52000000 },
            { name: '10/02', doanh_thu: 38000000 },
            { name: '15/02', doanh_thu: 85000000 },
            { name: '20/02', doanh_thu: 59000000 },
            { name: '25/02', doanh_thu: 72000000 },
            { name: '28/02', doanh_thu: 95000000 }
        ]
    };

    // UC069.2: Xuất dữ liệu
    const handleExport = (format) => {
        alert(`Hệ thống: Đang kết xuất dữ liệu định dạng ${format.toUpperCase()}... Vui lòng đợi.`);
    };

    return (
        <div className="p-8 bg-[#f8fafc] min-h-screen font-sans">
            {/* Tiêu đề & Nút Xuất file */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
                        <BarChart3 className="text-blue-600" size={32} /> Phân tích doanh thu
                    </h1>
                    <p className="text-slate-500 font-medium mt-1 italic text-sm">
                        * Báo cáo dựa trên Ngày lưu trú thực tế (Cơ sở dồn tích)
                    </p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={() => handleExport('xlsx')}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-xs hover:bg-slate-50 shadow-sm transition-all"
                    >
                        <Download size={16} /> XUẤT EXCEL
                    </button>
                    <button
                        onClick={() => handleExport('pdf')}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-2xl font-bold text-xs hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                    >
                        <Download size={16} /> TẢI BÁO CÁO PDF
                    </button>
                </div>
            </div>

            {/* Thanh công cụ lựa chọn tham số (Bước 2) */}
            <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-wrap items-center gap-8 mb-8">
                {/* Chọn khoảng thời gian */}
                <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-blue-600" />
                    <select
                        className="bg-transparent font-bold text-slate-700 outline-none text-sm cursor-pointer"
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                    >
                        <option value="30_ngay">30 ngày gần nhất</option>
                        <option value="thang_nay">Tháng hiện tại</option>
                        <option value="tuy_chon">Khoảng ngày tùy chỉnh</option>
                    </select>
                </div>

                <div className="hidden md:block h-6 w-[1px] bg-slate-200" />

                {/* Chọn độ chi tiết (Granularity) */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    {[
                        { id: 'daily', label: 'NGÀY' },
                        { id: 'weekly', label: 'TUẦN' },
                        { id: 'monthly', label: 'THÁNG' }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setGranularity(item.id)}
                            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                                granularity === item.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="hidden md:block h-6 w-[1px] bg-slate-200" />

                {/* Lọc theo Nguồn/Đại lý (UC069.1) */}
                <div className="flex items-center gap-3">
                    <Filter size={18} className="text-slate-400" />
                    <select
                        className="bg-transparent font-bold text-slate-600 outline-none text-sm cursor-pointer"
                        value={agencyFilter}
                        onChange={(e) => setAgencyFilter(e.target.value)}
                    >
                        <option value="Tat_ca">Tất cả các nguồn</option>
                        <option value="B2B">Đại lý B2B Direct</option>
                        <option value="Agoda">Sàn Agoda/Booking</option>
                        <option value="Walk_in">Khách vãng lai</option>
                    </select>
                </div>
            </div>

            {/* Các thẻ chỉ số KPI (Bước 6) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {mockData.summary.map((item, idx) => (
                    <KPICard key={idx} {...item} />
                ))}
            </div>

            {/* Biểu đồ xu hướng Doanh thu (Bước 6) */}
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
                <div className="flex items-center justify-between mb-10">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
                        <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                        Biểu đồ xu hướng doanh thu
                    </h3>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">
                        Đơn vị: VNĐ
                    </div>
                </div>

                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={mockData.chart}>
                            <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}}
                                dy={15}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}}
                                tickFormatter={(val) => `${(val/1000000).toFixed(0)}Tr`}
                            />
                            <Tooltip
                                contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px'}}
                                itemStyle={{fontWeight: 800, color: '#1e293b'}}
                                formatter={(value) => [`${new Intl.NumberFormat('vi-VN').format(value)} VNĐ`, 'Doanh thu']}
                            />
                            <Area
                                type="monotone"
                                dataKey="doanh_thu"
                                stroke="#3b82f6"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorRev)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default RevenueReport;