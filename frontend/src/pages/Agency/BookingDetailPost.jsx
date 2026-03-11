import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, Copy, Download, UserCircle, FileText,
    MessageCircle, XCircle, CheckCircle2, QrCode, Info, Star, Calendar
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { bookingService } from '@/services/booking.service.js';
import EditGuestModal from '@/components/agency/booking/EditGuestBookingModal.jsx';
import SubmitFeedbackModal from '@/components/agency/booking/SubmitFeedbackModal.jsx';

const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const formatCurrency = (amount) => {
    if (amount == null) return "—";
    return Number(amount).toLocaleString("vi-VN") + " ₫";
};

const getStatusLabel = (bookingStatus, paymentStatus) => {
    const s = bookingStatus?.toLowerCase();
    if (s === "cancelled") return "ĐÃ HỦY";
    if (s === "completed") return "HOÀN THÀNH";
    if (s === "checked_in") return "ĐANG LƯU TRÚ";
    if (paymentStatus?.toLowerCase() === "paid") return "ĐẶT PHÒNG THÀNH CÔNG";
    return "ĐẶT PHÒNG THÀNH CÔNG";
};

const BookingDetailPost = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const bookingCode = decodeURIComponent(id || "");

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            try {
                const res = await bookingService.getBookingDetail(bookingCode);
                setBooking(res.result);
            } catch (err) {
                setError("Không thể tải chi tiết đơn hàng. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };
        if (bookingCode) fetchDetail();
    }, [bookingCode]);

// Hàm xử lý sau khi Modal lưu thành công
    const handleUpdateSuccess = (updatedFields) => {
        setBooking(prev => ({
            ...prev,
            ...updatedFields // Ghi đè các trường vừa sửa vào state hiện tại
        }));
    };

    const canEdit = () => {
        if (!booking) return false;
        const today = new Date();
        const checkIn = new Date(booking.checkInDate);
        // Chặn nếu là ngày check-in hoặc muộn hơn
        today.setHours(0,0,0,0);
        checkIn.setHours(0,0,0,0);

        return booking.bookingStatus?.toLowerCase() === 'booked' && checkIn > today;
    };
    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        alert("Đã sao chép: " + text);
    };

    // Logic kiểm tra điều kiện đánh giá
    const canReview = () => {
        if (!booking) return false;
        // Thỏa mãn khi trạng thái Hoàn thành và chưa có feedback (giả sử có trường hasFeedback từ API)
        return booking.bookingStatus?.toLowerCase() === 'completed' && !booking.hasFeedback;
    };

    if (loading) {
        return (
            <div className="bg-[#f0f2f5] min-h-screen flex items-center justify-center">
                <p className="text-slate-500">Đang tải chi tiết đơn hàng...</p>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="bg-[#f0f2f5] min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-rose-500">{error || "Không tìm thấy đơn hàng"}</p>
                <button onClick={() => navigate(-1)} className="text-sm text-blue-600 underline">Quay lại</button>
            </div>
        );
    }

    const statusLabel = getStatusLabel(booking.bookingStatus, booking.paymentStatus);

    return (
        <div className="bg-[#f0f2f5] min-h-screen pb-12 font-sans text-slate-700">
            <div className="max-w-4xl mx-auto p-4">

                {/* Tiêu đề trang */}
                <div className="mb-4">
                    <h1 className="text-xl font-bold text-slate-800">Chi tiết đơn hàng</h1>
                    <p className="text-xs text-slate-500">Quản lý và thực hiện các nghiệp vụ sau bán cho đơn hàng đã xác nhận</p>
                </div>

                {/* Banner Trạng thái */}
                <div className="bg-[#3b82f6] rounded-lg p-4 mb-4 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="bg-white rounded-full p-1">
                            <CheckCircle2 className="text-[#3b82f6]" size={20} />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-sm uppercase tracking-wide">{statusLabel}</h2>
                            <p className="text-blue-100 text-xs">{booking.bookingCode}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleCopy(booking.bookingCode)}
                        className="flex items-center gap-1.5 text-white text-xs font-medium hover:underline"
                    >
                        <Copy size={14} /> Sao chép
                    </button>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

                    {/* 1. Các tác vụ hậu mãi */}
                    <div className="p-5 border-b border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-slate-800">Các tác vụ hậu mãi</h3>
                            <span className="text-[10px] text-slate-400 font-medium">Chế độ ẩn giá (Agent Mode)</span>
                        </div>
                        {/* Thay đổi grid-cols-4 thành grid-cols-2 md:grid-cols-5 để thêm nút Đánh giá */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <button className="flex items-center justify-center gap-2 bg-[#006ce4] text-white py-2.5 rounded-md text-xs font-bold hover:bg-blue-700 transition-colors">
                                <Download size={14}/> Tải Voucher
                            </button>

                            <button
                                onClick={() => {
                                    if (canEdit()) setIsEditModalOpen(true);
                                    else alert("Không thể sửa thông tin vào ngày Check-in hoặc đơn hàng không ở trạng thái chờ.");
                                }}
                                className="flex items-center justify-center gap-2 bg-[#f0f2f5] text-slate-700 py-2.5 rounded-md text-xs font-bold hover:bg-slate-200"
                            >
                                <UserCircle size={14}/> Sửa khách
                            </button>

                            {/* NÚT ĐÁNH GIÁ (UC-032) */}
                            {booking.bookingStatus?.toLowerCase() === 'completed' && (
                                <button
                                    onClick={() => setIsReviewModalOpen(true)}
                                    disabled={booking.hasFeedback}
                                    className={`flex items-center justify-center gap-2 py-2.5 rounded-md text-xs font-bold transition-colors ${
                                        booking.hasFeedback
                                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                            : "bg-emerald-600 text-white hover:bg-emerald-700"
                                    }`}
                                >
                                    <Star size={14} fill={booking.hasFeedback ? "none" : "currentColor"}/>
                                    {booking.hasFeedback ? "Đã đánh giá" : "Đánh giá"}
                                </button>
                            )}

                            <button className="flex items-center justify-center gap-2 bg-[#f0f2f5] text-slate-700 py-2.5 rounded-md text-xs font-bold hover:bg-slate-200">
                                <FileText size={14}/> Hóa đơn
                            </button>

                            <button className="flex items-center justify-center gap-2 bg-[#fef2f2] text-rose-600 py-2.5 rounded-md text-xs font-bold hover:bg-rose-100">
                                <XCircle size={14}/> Hủy phòng
                            </button>
                        </div>
                    </div>

                    {/* 2. Xem nhanh Vé điện tử */}
                    <div className="p-5">
                        <h3 className="text-sm font-bold text-slate-800 mb-4">Xem nhanh Vé điện tử</h3>
                        <div className="border border-slate-200 rounded-xl p-6 relative">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h4 className="text-lg font-bold text-slate-900 leading-tight">{booking.hotelName}</h4>
                                    {booking.hotelStarRating > 0 && (
                                        <div className="flex gap-0.5 mt-1">
                                            {[...Array(booking.hotelStarRating)].map((_, i) => (
                                                <Star key={i} size={14} fill="#fabb05" className="text-[#fabb05]" />
                                            ))}
                                            <span className="text-xs text-slate-400 ml-2">Khách sạn {booking.hotelStarRating} sao</span>
                                        </div>
                                    )}
                                    {booking.hotelAddress && (
                                        <p className="text-xs text-slate-400 mt-1">{booking.hotelAddress}</p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Stay Info</p>
                                    <p className="text-sm font-bold text-slate-800">
                                        {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                                    </p>
                                    <p className="text-[11px] text-slate-500">({booking.nights} Đêm)</p>
                                </div>
                            </div>

                            {/* QR Section */}
                            <div className="flex flex-col items-center justify-center py-4 border-y border-dashed border-slate-200 my-6">
                                <div className="bg-[#f8f9fa] p-4 rounded-lg border border-slate-100 mb-2">
                                    <QrCode size={120} strokeWidth={1.5} className="text-slate-800" />
                                </div>
                                <p className="text-[11px] text-slate-400">Quét mã QR để xác thực tại quầy lễ tân</p>
                            </div>

                            {/* Guest Info */}
                            <div className="space-y-3">
                                <p className="text-xs font-bold text-slate-800">Thông tin khách lưu trú:</p>
                                <div className="text-xs grid grid-cols-2 gap-2">
                                    <div className="flex gap-2">
                                        <span className="text-slate-400">Họ tên:</span>
                                        <span className="font-semibold text-slate-700">{booking.guestName}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-slate-400">Điện thoại:</span>
                                        <span className="font-semibold text-slate-700">{booking.guestPhone}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-slate-400">Email:</span>
                                        <span className="font-semibold text-slate-700">{booking.guestEmail}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-slate-400">Số khách:</span>
                                        <span className="font-semibold text-slate-700">{booking.totalGuests} người</span>
                                    </div>
                                </div>

                                {/* Room Details */}
                                {booking.roomDetails?.length > 0 && (
                                    <div className="pt-3">
                                        <p className="text-xs font-bold text-slate-800 mb-2">Danh sách phòng:</p>
                                        <div className="space-y-2">
                                            {booking.roomDetails.map((room, i) => (
                                                <div key={i} className="text-xs flex justify-between bg-slate-50 rounded-lg px-3 py-2">
                                                    <span className="font-semibold text-slate-700">
                                                        {room.quantity}x {room.roomTitle}
                                                    </span>
                                                    <span className="text-slate-500">
                                                        {room.bedType && `${room.bedType} · `}{room.maxGuests} khách tối đa
                                                    </span>
                                                    <span className="font-bold text-emerald-600">{formatCurrency(room.totalAmount)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Addon Services */}
                                {booking.addonServices?.length > 0 && (
                                    <div className="pt-2">
                                        <p className="text-xs font-bold text-slate-800 mb-1">Dịch vụ thêm:</p>
                                        <div className="space-y-1">
                                            {booking.addonServices.map((s, i) => (
                                                <div key={i} className="text-xs flex justify-between px-3 py-1.5 bg-blue-50 rounded-lg">
                                                    <span className="text-slate-700">{s.serviceName} × {s.quantity}</span>
                                                    <span className="font-bold text-blue-700">{formatCurrency(s.totalPrice)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {booking.notes && (
                                    <div className="pt-2 text-xs text-slate-500 italic">
                                        Ghi chú: {booking.notes}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 3. Tài chính & Chính sách */}
                    <div className="p-5 bg-[#fcfcfc] border-t border-slate-100">
                        <h3 className="text-sm font-bold text-slate-800 mb-4">Thông tin tài chính & Chính sách</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Cột trái: Thanh toán */}
                            <div className="space-y-3">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Thông tin thanh toán</p>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Tổng tiền:</span>
                                    <span className="font-bold text-slate-900">{formatCurrency(booking.totalAmount)}</span>
                                </div>
                                {booking.discountAmount > 0 && (
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Giảm giá:</span>
                                        <span className="font-bold text-rose-600">- {formatCurrency(booking.discountAmount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xs border-t pt-2">
                                    <span className="text-slate-600 font-semibold">Thành tiền:</span>
                                    <span className="font-bold text-emerald-600 text-sm">{formatCurrency(booking.finalAmount)}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Phương thức TT:</span>
                                    <span className="font-bold text-slate-900">{booking.paymentMethod || "—"}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Trạng thái TT:</span>
                                    <span className={`font-bold ${booking.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-500'}`}>
                                        {booking.paymentStatus?.toUpperCase() || "—"}
                                    </span>
                                </div>
                            </div>

                            {/* Cột phải: Chính sách */}
                            <div className="space-y-3">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Chính sách quan trọng</p>
                                <div className="bg-[#f8f9fa] p-3 rounded-lg border-l-4 border-blue-500">
                                    <p className="text-[11px] font-bold text-slate-700">Trạng thái đơn</p>
                                    <p className="text-xs text-slate-600">{booking.bookingStatus?.toUpperCase()}</p>
                                </div>
                                <div className="bg-[#fef2f2] p-3 rounded-lg border-l-4 border-rose-500">
                                    <p className="text-[11px] font-bold text-rose-700">Chính sách hủy</p>
                                    <p className="text-xs text-rose-600 leading-relaxed">Vui lòng liên hệ khách sạn để biết chính sách hủy.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Nút quay lại */}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-md transition-all border border-slate-200"
                    >
                        <ArrowLeft size={14} /> Quay lại danh sách
                    </button>
                </div>
            </div>
            {/* MODAL CHỈNH SỬA - TRUYỀN DỮ LIỆU BOOKING HIỆN TẠI VÀO */}
            {booking && (
                <EditGuestModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    booking={booking}
                    onSaveSuccess={handleUpdateSuccess}
                />
            )}

            {/* MODAL ĐÁNH GIÁ DỊCH VỤ (UC-032) */}
            {booking && (
                <SubmitFeedbackModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    booking={booking}
                    onSuccess={() => {
                        // Cập nhật trạng thái đã đánh giá để ẩn nút hoặc đổi màu nút
                        setBooking(prev => ({ ...prev, hasFeedback: true }));
                    }}
                />
            )}
        </div>
    );
};

export default BookingDetailPost;

    
