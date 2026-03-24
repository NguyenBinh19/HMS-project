import React, { useState, useEffect } from 'react';
import {
    BarChart3, Download, Calendar, Filter,
    RefreshCcw, ArrowRight, Home
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';
import KPICard from '@/components/hotel/report/KPICard';
import { revenueService } from '@/services/revenue.service';
import { financialService } from '@/services/financial.service';
import { toast } from 'react-hot-toast';

const RevenueReport = ({ hotelId = 2016 }) => {
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);

    const [startDate, setStartDate] = useState("2026-03-01");
    const [endDate, setEndDate] = useState("2026-03-31");
    const [granularity, setGranularity] = useState("DAILY"); // DAILY | WEEKLY | MONTHLY
    const [source, setSource] = useState("");

    const fetchRevenue = async () => {
        setLoading(true);
        try {
            const params = {
                startDate,
                endDate,
                granularity,
                source: source || null
            };
            const res = await revenueService.getRevenueReport(hotelId, params);

            if (res.code === 1000) {
                setReportData(res.result);
            }
        } catch (error) {
            console.error("Lỗi tải báo cáo:", error);
            toast.error("Không thể kết nối máy chủ để tải báo cáo doanh thu");
        } finally {
            setLoading(false);
        }
    };

    // --- LOGIC XỬ LÝ DOWNLOAD FILE  ---
    const handleDownloadReport = async (format = 'EXCEL', reportType = 'REVENUE') => {
        try {
            toast.loading(`Đang tải file ${format}...`, { id: 'export-status' });

            const exportRequest = {
                reportType,
                format,
                startDate,
                endDate,
                hotelId,
                statuses: []
            };

            // 1. Nhận về ArrayBuffer (Dữ liệu máy nguyên bản)
            const buffer = await financialService.exportFinancialReport(exportRequest);

            // 2. Kiểm tra nếu Backend vô tình trả về JSON lỗi thay vì file
            // (Nếu buffer quá nhỏ, có thể đó là JSON báo lỗi)
            const decoder = new TextDecoder('utf-8');
            try {
                const possibleJson = JSON.parse(decoder.decode(new Uint8Array(buffer).slice(0, 500)));
                if (possibleJson.result) {
                    // Nếu BE vẫn bọc trong {result: {data: [...]}}
                    // thì ta lấy mảng data đó chuyển thành Uint8Array
                    const actualData = new Uint8Array(possibleJson.result.data);
                    downloadFile(actualData, format, possibleJson.result.fileName);
                    return;
                }
            } catch (e) {
                // Không phải JSON, tiến hành xử lý như file thô
            }

            // 3. Xử lý tải file thô
            const contentType = format === 'PDF'
                ? 'application/pdf'
                : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

            const blob = new Blob([buffer], { type: contentType });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Bao_cao_${format}_${startDate}.${format === 'PDF' ? 'pdf' : 'xlsx'}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success(`Tải file thành công`, { id: 'export-status' });
        } catch (error) {
            console.error("Lỗi:", error);
            toast.error("Lỗi định dạng file từ Server", { id: 'export-status' });
        }
    };

    useEffect(() => {
        fetchRevenue();
    }, [startDate, endDate, granularity, source]);

    const summary = reportData?.summary || {};
    const trendData = reportData?.trend || [];
    const roomTypeStats = reportData?.byRoomType || [];

    return (
        <div className="p-8 bg-[#f8fafc] min-h-screen font-sans">

            {/* PHẦN TIÊU ĐỀ (HEADER) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
                        <BarChart3 className="text-blue-600" size={32} /> Báo cáo doanh thu
                    </h1>
                    <p className="text-slate-500 font-medium mt-1 italic text-sm">
                        Hệ thống quản lý khách sạn
                    </p>
                </div>
                <div className="flex gap-3">
                    {/* NÚT DOWNLOAD ĐÃ ĐƯỢC TÍCH HỢP */}
                    <button
                        onClick={() => handleDownloadReport('EXCEL')}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-xs hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                    >
                        <Download size={16} /> XUẤT EXCEL
                    </button>
                    <button
                        onClick={() => handleDownloadReport('PDF')}
                        className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-2xl font-bold text-xs hover:bg-red-700 transition-all shadow-lg active:scale-95"
                    >
                        <Download size={16} /> XUẤT PDF
                    </button>
                </div>
            </div>

            {/* BỘ LỌC (FILTERS) */}
            <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-wrap items-center gap-6 mb-8">
                {/* Chọn khoảng ngày */}
                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                    <Calendar size={16} className="text-blue-600" />
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent text-xs font-bold outline-none" title="Ngày bắt đầu" />
                    <ArrowRight size={14} className="text-slate-300" />
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent text-xs font-bold outline-none" title="Ngày kết thúc" />
                </div>

                {/* Chọn độ chia biểu đồ (Ngày/Tuần/Tháng) */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    {['DAILY', 'WEEKLY', 'MONTHLY'].map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setGranularity(mode)}
                            className={`px-6 py-2 rounded-lg text-[10px] font-black transition-all ${granularity === mode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {mode === 'DAILY' ? 'NGÀY' : mode === 'WEEKLY' ? 'TUẦN' : 'THÁNG'}
                        </button>
                    ))}
                </div>

                {/* Lọc theo nguồn khách (OTA/Trực tiếp) */}
                <div className="flex items-center gap-3 ml-auto border-l pl-6 border-slate-100">
                    <Filter size={18} className="text-slate-400" />
                    <select value={source} onChange={(e) => setSource(e.target.value)} className="bg-transparent font-bold text-slate-600 outline-none text-sm cursor-pointer">
                        <option value="">Tất cả nguồn</option>
                        <option value="OTA">Kênh OTA (Agoda, Booking...)</option>
                        <option value="DIRECT">Khách trực tiếp/Vãng lai</option>
                    </select>
                </div>
            </div>

            {/* THẺ CHỈ SỐ KPI  */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KPICard title="Tổng doanh thu" value={summary.totalRevenue || 0} unit="VNĐ" trend={summary.revenueGrowthPercent || 0} isUp={(summary.revenueGrowthPercent || 0) >= 0} />
                <KPICard title="Công suất phòng" value={summary.occupancyRate || 0} unit="%" trend={summary.occupancyGrowthPercent || 0} isUp={(summary.occupancyGrowthPercent || 0) >= 0} />
                <KPICard title="Giá trung bình (ADR)" value={summary.adr || 0} unit="VNĐ" trend={summary.adrGrowthPercent || 0} isUp={(summary.adrGrowthPercent || 0) >= 0} />
                <KPICard title="RevPAR" value={summary.revPar || 0} unit="VNĐ" trend={summary.revParGrowthPercent || 0} isUp={(summary.revParGrowthPercent || 0) >= 0} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* BIỂU ĐỒ XU HƯỚNG  */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl relative min-h-[500px]">
                    {/* Hiệu ứng Loading đè lên biểu đồ khi đang fetch data */}
                    {loading && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-[3rem]">
                            <RefreshCcw className="animate-spin text-blue-600" size={32} />
                        </div>
                    )}

                    <h3 className="text-lg font-black text-slate-800 mb-10 uppercase flex items-center gap-2">
                        <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                        Biến động doanh thu & Công suất
                    </h3>

                    <div className="h-[380px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    {/* Hiệu ứng đổ màu chuyển sắc cho vùng dưới đường biểu đồ */}
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />

                                {/* YAxis bên trái cho Doanh thu (Triệu VNĐ) */}
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`} />

                                {/* YAxis bên phải cho Công suất (%) */}
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#10b981', fontSize: 10}} unit="%" />

                                <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />

                                {/* Đường Doanh thu (Area) */}
                                <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fill="url(#colorRev)" />

                                {/* Đường Công suất (Dạng nét đứt) */}
                                <Area yAxisId="right" type="monotone" dataKey="occupancyRate" stroke="#10b981" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* THỐNG KÊ THEO LOẠI PHÒNG  */}
                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl">
                    <h3 className="text-lg font-black text-slate-800 mb-8 uppercase flex items-center gap-2">
                        <Home size={20} className="text-blue-600" /> Phân tích loại phòng
                    </h3>
                    <div className="space-y-6 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                        {roomTypeStats.length > 0 ? roomTypeStats.map((item, idx) => (
                            <div key={idx} className="p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[11px] font-black text-slate-500 uppercase leading-tight w-2/3">
                                        {item.roomTypeName}
                                    </span>
                                    <span className="text-sm font-black text-blue-600">{item.contribution}%</span>
                                </div>
                                {/* Thanh tiến trình thể hiện % đóng góp doanh thu */}
                                <div className="w-full bg-white h-1.5 rounded-full overflow-hidden mb-3">
                                    <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${item.contribution}%` }}></div>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-slate-400">{item.roomNightsSold} đêm đã bán</span>
                                    <span className="text-slate-700">{new Intl.NumberFormat('vi-VN').format(item.revenue)} VNĐ</span>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 text-slate-400 font-medium italic">
                                Chưa có dữ liệu doanh thu cho từng loại phòng
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RevenueReport;