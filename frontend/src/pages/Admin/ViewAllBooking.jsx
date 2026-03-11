import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Filter, Calendar, Building2, CreditCard, AlertCircle,
    ChevronRight, Loader2, RefreshCcw, FileSpreadsheet,
    ChevronLeft, ArrowRightLeft, LogIn, LogOut,
    User, Globe, ShieldCheck
} from 'lucide-react';
import { bookingService } from '@/services/booking.service.js';

const AdminBookingList = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const fetchAllBookings = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await bookingService.viewAllBookingByAdmin();
            if (data && data.result) {
                const sortedData = data.result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setBookings(sortedData);
                if (sortedData.length > 500) setError("Dữ liệu quá lớn. Vui lòng lọc theo ngày.");
            }
        } catch (err) {
            setError("Lỗi kết nối hệ thống.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAllBookings(); }, []);

    // Tinh chỉnh hiển thị đầy đủ ngày/tháng/năm
    const formatDateVN = (dateStr) => {
        if (!dateStr) return "--/--/----";
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatVND = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const filteredBookings = useMemo(() => {
        return bookings.filter(item => {
            const matchSearch = item.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.bookingCode.toLowerCase().includes(searchTerm.toLowerCase());
            const matchStatus = statusFilter === "" || item.bookingStatus === statusFilter;
            const matchDate = dateFilter === "" || item.checkInDate.includes(dateFilter);
            return matchSearch && matchStatus && matchDate;
        });
    }, [bookings, searchTerm, statusFilter, dateFilter]);

    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    const currentData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredBookings.slice(start, start + itemsPerPage);
    }, [filteredBookings, currentPage]);

    const getStatusStyle = (status) => {
        const styles = {
            'Confirmed': 'bg-emerald-50 text-emerald-600 border-emerald-200',
            'Cancelled': 'bg-rose-50 text-rose-600 border-rose-200',
            'Pending': 'bg-amber-50 text-amber-600 border-amber-200',
            'booked': 'bg-blue-50 text-blue-600 border-blue-200',
        };
        const labels = { 'Confirmed': 'Xác nhận', 'Cancelled': 'Hủy', 'Pending': 'Chờ', 'booked': 'Đã đặt' };
        return (
            <span className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${styles[status] || 'bg-slate-50 text-slate-500'}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen font-sans text-slate-800 p-4 md:p-8 lg:p-10">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-6 md:mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-4xl font-light text-slate-900">
                        <span className="font-extrabold">Danh sách Đặt phòng</span>
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={fetchAllBookings} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 shadow-sm active:scale-95 transition-all">
                        <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl font-bold text-sm hover:bg-blue-600 shadow-lg active:scale-95 transition-all">
                        <FileSpreadsheet size={16} /> <span>Xuất Excel</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="max-w-7xl mx-auto mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <div className="sm:col-span-2 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Tìm mã đặt phòng, khách hàng..."
                        value={searchTerm}
                        onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                        className="w-full pl-10 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none text-sm transition-all shadow-sm"
                    />
                </div>
                <div className="relative">
                    <select
                        value={statusFilter}
                        onChange={(e) => {setStatusFilter(e.target.value); setCurrentPage(1);}}
                        className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 outline-none appearance-none text-sm font-semibold text-slate-600 shadow-sm cursor-pointer"
                    >
                        <option value="">Mọi trạng thái</option>
                        <option value="Confirmed">Xác nhận</option>
                        <option value="Pending">Chờ trả</option>
                        <option value="booked">Đã đặt</option>
                    </select>
                    <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                </div>
                <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="date"
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none text-sm font-semibold text-slate-600 shadow-sm focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Table Container */}
            <div className="max-w-7xl mx-auto bg-white rounded-[24px] md:rounded-[32px] border border-slate-200/60 shadow-xl overflow-hidden">
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left min-w-[950px]"> {/* Tăng min-width để chứa ngày tháng đầy đủ */}
                        <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-100 font-black text-slate-400 text-[10px] uppercase tracking-widest">
                            <th className="px-6 md:px-8 py-5">Mã Đặt Phòng</th>
                            <th className="px-6 md:px-8 py-5">Khách & Đối Tác</th>
                            <th className="px-4 py-5 text-center">Thời Gian Lưu Trú</th>
                            <th className="px-6 md:px-8 py-5 text-right">Tổng Thanh Toán</th>
                            <th className="px-6 md:px-8 py-5 text-center">Trạng Thái</th>
                            <th className="px-4 md:px-6 py-5"></th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="6" className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" size={32}/></td></tr>
                        ) : currentData.length > 0 ? currentData.map((item) => (
                            <tr key={item.bookingCode} className="hover:bg-blue-50/40 transition-all group">
                                <td className="px-6 md:px-8 py-5">
                                    <div className="font-black text-blue-600 text-sm">{item.bookingCode}</div>
                                    <div className="text-[9px] text-slate-400 mt-1 font-bold">Ngày tạo: {formatDateVN(item.createdAt)}</div>
                                </td>
                                <td className="px-6 md:px-8 py-5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="hidden sm:flex w-7 h-7 rounded-full bg-slate-100 items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                            <User size={12}/>
                                        </div>
                                        <span className="font-bold text-slate-800 text-sm truncate max-w-[140px]">{item.guestName}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[8px] px-1 py-0.5 rounded bg-indigo-50 text-indigo-500 font-black border border-indigo-100">{item.agencyId ? 'B2B' : 'B2C'}</span>
                                        <span className="text-[9px] text-slate-400 font-medium italic text-nowrap">HotelID: {item.hotelId}</span>
                                    </div>
                                </td>

                                {/* Cột Thời Gian  */}
                                <td className="px-4 py-5">
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="flex flex-col items-center">
                                            <span className="text-[8px] font-black text-emerald-500 uppercase mb-1 flex items-center gap-1">
                                                <LogIn size={8}/> Nhận
                                            </span>
                                            <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl font-bold text-slate-700 text-[11px] shadow-sm whitespace-nowrap">
                                                {formatDateVN(item.checkInDate)}
                                            </div>
                                        </div>
                                        <ArrowRightLeft size={12} className="text-slate-300 mt-4"/>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[8px] font-black text-rose-500 uppercase mb-1 flex items-center gap-1">
                                                <LogOut size={8}/> Trả
                                            </span>
                                            <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl font-bold text-slate-700 text-[11px] shadow-sm whitespace-nowrap">
                                                {formatDateVN(item.checkOutDate)}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 md:px-8 py-5 text-right">
                                    <div className="font-black text-slate-900 text-sm tracking-tight">{formatVND(item.finalAmount)}</div>
                                    <div className={`text-[9px] font-bold uppercase mt-1 flex items-center justify-end gap-1 ${item.paymentStatus === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                        <CreditCard size={9}/>
                                        {item.paymentStatus === 'paid' ? 'Đã trả' : 'Chờ thanh toán'}
                                    </div>
                                </td>

                                <td className="px-6 md:px-8 py-5 text-center">
                                    {getStatusStyle(item.bookingStatus)}
                                </td>

                                <td className="px-4 md:px-6 py-5 text-right">
                                    <button onClick={() => navigate(`/admin/bookings/${item.bookingCode}`)}
                                            className="w-8 h-8 md:w-10 md:h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <ChevronRight size={18}/>
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" className="py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">Không có dữ liệu</td></tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 md:px-8 py-4 md:py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Trang {currentPage} / {totalPages || 1} — {filteredBookings.length} Đặt phòng
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
                                className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-blue-50 disabled:opacity-20 shadow-sm">
                            <ChevronLeft size={16}/>
                        </button>
                        <div className="flex gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <button key={i} onClick={() => setCurrentPage(i + 1)}
                                        className={`w-8 h-8 rounded-lg text-[10px] font-black ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-blue-50'}`}>
                                    {i + 1}
                                </button>
                            )).slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1))}
                        </div>
                        <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)}
                                className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-blue-50 disabled:opacity-20 shadow-sm">
                            <ChevronRight size={16}/>
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="max-w-7xl mx-auto mt-6 flex justify-between items-center opacity-40 px-2 text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
                <div className="flex items-center gap-1.5 text-slate-500">
                    <Globe size={12}/> <span>Hệ thống quản trị HMS Việt Nam</span>
                </div>
            </div>
        </div>
    );
};

export default AdminBookingList;