import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Check,
    Copy,
    FileText,
    Home,
    PlusCircle,
    Download,
    CreditCard,
    Wallet,
    Info
} from "lucide-react";

const BookingSuccessPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { bookingDetail } = location.state || {};

    // Nếu không có dữ liệu, điều hướng về trang chủ
    if (!bookingDetail) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <p className="mb-4 text-slate-600 font-medium">Không tìm thấy thông tin đơn hàng.</p>
                    <button onClick={() => navigate("/")} className="text-blue-600 font-black underline uppercase text-sm">
                        Quay lại trang chủ
                    </button>
                </div>
            </div>
        );
    }

    const copyToClipboard = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        alert("Đã sao chép mã đặt phòng!");
    };

    const formatCurrency = (v) => new Intl.NumberFormat("vi-VN").format(v) + " đ";

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans">
            <div className="max-w-4xl mx-auto pt-12 px-4 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full mb-6 shadow-sm">
                    <Check size={40} strokeWidth={4} />
                </div>

                <h1 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">
                    Thanh toán thành công!
                </h1>
                <p className="text-slate-500 font-medium mb-8">
                    Đơn hàng đã được xác nhận. Mã đặt phòng đã được gửi đến <span className="text-slate-800 font-bold">{bookingDetail.guestEmail}</span>
                </p>

                {/* Booking Code Card */}
                <div className="bg-white border border-slate-200 rounded-2xl py-5 px-10 inline-flex items-center gap-12 shadow-sm mb-10">
                    <span className="text-slate-400 font-black text-[11px] uppercase tracking-wider">Mã đặt phòng</span>
                    <div className="flex items-center gap-4">
                        <span className="text-2xl font-black text-blue-700 tracking-tighter">
                            #{bookingDetail.bookingCode || "BK-2026-XXXX"}
                        </span>
                        <button
                            onClick={() => copyToClipboard(bookingDetail.bookingCode)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"
                        >
                            <Copy size={20} />
                        </button>
                    </div>
                </div>

                {/* Tóm tắt đơn hàng */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm text-left overflow-hidden mb-6">
                    <div className="p-6 border-b border-dashed border-slate-200 bg-slate-50/50 flex items-center gap-3">
                        <FileText size={20} className="text-blue-600" />
                        <h2 className="font-black text-slate-800 uppercase tracking-widest text-xs">Tóm tắt đơn hàng</h2>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-16">
                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-wider">Khách sạn</p>
                                <p className="font-black text-slate-800 text-lg leading-tight">{bookingDetail.hotelName}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-wider">Khách chính</p>
                                <p className="font-bold text-slate-700">{bookingDetail.guestName}</p>
                                <p className="text-xs text-slate-400 font-medium">{bookingDetail.guestPhone}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-wider">Thời gian lưu trú</p>
                                <p className="font-bold text-slate-700">
                                    {bookingDetail.checkInDate} - {bookingDetail.checkOutDate}
                                </p>
                                <p className="text-xs text-slate-500 font-bold">
                                    {bookingDetail.totalNights} đêm • {bookingDetail.totalRooms} Phòng
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-wider">Trạng thái thanh toán</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-md">ĐÃ THANH TOÁN</span>
                                    <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded-md">CONFIRMED</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cập nhật số dư & Phương thức thanh toán */}
                <div className="bg-[#0ea5e9] rounded-3xl p-8 text-white text-left shadow-xl shadow-blue-100 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Wallet size={120} />
                    </div>
                    <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-6 opacity-80">Chi tiết giao dịch</h3>
                    <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-center border-b border-white/20 pb-4">
                            <span className="text-sm font-bold opacity-90 flex items-center gap-2">
                                {bookingDetail.paymentMethod === "CREDIT" ? <CreditCard size={18}/> : <Wallet size={18}/>}
                                Nguồn tiền: {bookingDetail.paymentMethod === "CREDIT" ? "Hạn mức Tín dụng" : "Ví trả trước"}
                            </span>
                            <span className="font-black text-2xl">-{formatCurrency(bookingDetail.totalPrice)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-sm font-medium opacity-80 italic underline underline-offset-4">Hệ thống đã cập nhật số dư của bạn.</span>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase opacity-60">Số dư khả dụng ước tính</p>
                                <p className="font-black text-lg tracking-tighter">46.200.000 đ</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                    <button className="flex flex-col items-center justify-center p-6 bg-[#2563eb] text-white rounded-2xl hover:bg-blue-700 transition-all group shadow-lg shadow-blue-100">
                        <Download className="mb-2 group-hover:scale-110 transition-transform" size={24} />
                        <span className="font-black text-sm">Tải Voucher (PDF)</span>
                        <span className="text-[10px] font-bold opacity-70 uppercase tracking-tighter">Gửi Zalo cho khách</span>
                    </button>

                    <button className="flex flex-col items-center justify-center p-6 bg-[#9333ea] text-white rounded-2xl hover:bg-purple-700 transition-all group shadow-lg shadow-purple-100">
                        <PlusCircle className="mb-2 group-hover:scale-110 transition-transform" size={24} />
                        <span className="font-black text-sm">Thêm vào Lịch trình</span>
                        <span className="text-[10px] font-bold opacity-70 uppercase tracking-tighter">Tạo Tour mới</span>
                    </button>

                    <button
                        onClick={() => navigate("/")}
                        className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all group shadow-sm"
                    >
                        <Home className="mb-2 group-hover:scale-110 transition-transform text-slate-400" size={24} />
                        <span className="font-black text-sm">Về trang chủ</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Quản lý đơn hàng</span>
                    </button>
                </div>

                {/* Thông tin quan trọng */}
                <div className="bg-white rounded-3xl border border-slate-200 p-8 text-left shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                    <h3 className="font-black text-slate-800 mb-8 uppercase tracking-widest text-[10px] flex items-center gap-2">
                        <Info size={16} className="text-emerald-500" /> Thông tin cần lưu ý
                    </h3>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <p className="font-black text-slate-800 text-sm">Xác nhận tức thì</p>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">Đơn hàng của bạn đã được hệ thống khách sạn tiếp nhận và xác nhận phòng ngay lập tức.</p>
                        </div>
                        <div className="space-y-2">
                            <p className="font-black text-slate-800 text-sm">Voucher điện tử</p>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">File PDF voucher đã được ẩn giá Net, sẵn sàng để gửi trực tiếp cho khách hàng lẻ của bạn.</p>
                        </div>
                        <div className="space-y-2">
                            <p className="font-black text-slate-800 text-sm">Hóa đơn VAT</p>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">Thông báo thanh toán và hóa đơn đã được gửi vào hòm thư nội bộ của đại lý.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingSuccessPage;