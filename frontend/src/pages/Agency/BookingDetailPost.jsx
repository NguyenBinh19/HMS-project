import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, Copy, Download, UserCircle, FileText,
    MessageCircle, XCircle, CheckCircle2, QrCode, Info, Star, Calendar
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const BookingDetailPost = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const decodedId = decodeURIComponent(id || "");

    const [orderDetail, setOrderDetail] = useState({
        id: decodedId || "#BK-2026-8899",
        status: "ĐẶT PHÒNG THÀNH CÔNG",
        hotelName: "Mường Thanh Luxury Da Nang",
        rating: 5,
        checkIn: "20/05/2026",
        checkOut: "22/05/2026",
        nights: 2,
        guests: [
            { room: "Phòng 1", name: "Nguyen Van A (Trưởng đoàn) - Double" },
            { room: "Phòng 2", name: "Tran Thi B - Twin" }
        ],
        services: ["Ăn sáng"],
        totalNet: "4.000.000 ₫",
        paymentStatus: "Đã trừ Ví trả trước",
        transactionId: "TRX-998877",
        checkInTime: "14:00 / 12:00",
        cancelPolicy: "Không hoàn tiền (Non-refundable). Hủy sẽ mất 100% phí."
    });

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        alert("Đã sao chép: " + text);
    };

    return (
        <div className="bg-[#f0f2f5] min-h-screen pb-12 font-sans text-slate-700">
            <div className="max-w-4xl mx-auto p-4">

                {/* Tiêu đề trang */}
                <div className="mb-4">
                    <h1 className="text-xl font-bold text-slate-800">Chi tiết đơn hàng</h1>
                    <p className="text-xs text-slate-500">Quản lý và thực hiện các nghiệp vụ sau bán cho đơn hàng đã xác nhận</p>
                </div>

                {/* Banner Trạng thái - Bo nhẹ, màu xanh chuẩn blue-500 */}
                <div className="bg-[#3b82f6] rounded-lg p-4 mb-4 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="bg-white rounded-full p-1">
                            <CheckCircle2 className="text-[#3b82f6]" size={20} />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-sm uppercase tracking-wide">{orderDetail.status}</h2>
                            <p className="text-blue-100 text-xs">{orderDetail.id}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleCopy(orderDetail.id)}
                        className="flex items-center gap-1.5 text-white text-xs font-medium hover:underline"
                    >
                        <Copy size={14} /> Sao chép
                    </button>
                </div>

                {/* Main Card bọc toàn bộ nội dung trắng */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

                    {/* 1. Các tác vụ hậu mãi */}
                    <div className="p-5 border-b border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-slate-800">Các tác vụ hậu mãi</h3>
                            <span className="text-[10px] text-slate-400 font-medium">Chế độ ẩn giá (Agent Mode)</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <button className="flex items-center justify-center gap-2 bg-[#006ce4] text-white py-2.5 rounded-md text-xs font-bold hover:bg-blue-700 transition-colors">
                                <Download size={14} /> Tải Voucher (PDF)
                            </button>
                            <button className="flex items-center justify-center gap-2 bg-[#f0f2f5] text-slate-700 py-2.5 rounded-md text-xs font-bold hover:bg-slate-200">
                                <UserCircle size={14} /> Sửa tên khách
                            </button>
                            <button className="flex items-center justify-center gap-2 bg-[#f0f2f5] text-slate-700 py-2.5 rounded-md text-xs font-bold hover:bg-slate-200">
                                <FileText size={14} /> Yêu cầu Hóa đơn
                            </button>
                            <button className="flex items-center justify-center gap-2 bg-[#fef2f2] text-rose-600 py-2.5 rounded-md text-xs font-bold hover:bg-rose-100">
                                <XCircle size={14} /> Hủy phòng
                            </button>
                        </div>
                    </div>

                    {/* 2. Xem nhanh Vé điện tử */}
                    <div className="p-5">
                        <h3 className="text-sm font-bold text-slate-800 mb-4">Xem nhanh Vé điện tử</h3>
                        <div className="border border-slate-200 rounded-xl p-6 relative">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h4 className="text-lg font-bold text-slate-900 leading-tight">{orderDetail.hotelName}</h4>
                                    <div className="flex gap-0.5 mt-1">
                                        {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#fabb05" className="text-[#fabb05]" />)}
                                        <span className="text-xs text-slate-400 ml-2">Khách sạn 5 sao</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Stay Info</p>
                                    <p className="text-sm font-bold text-slate-800">{orderDetail.checkIn} - {orderDetail.checkOut}</p>
                                    <p className="text-[11px] text-slate-500">({orderDetail.nights} Đêm)</p>
                                </div>
                            </div>

                            {/* QR Section */}
                            <div className="flex flex-col items-center justify-center py-4 border-y border-dashed border-slate-200 my-6">
                                <div className="bg-[#f8f9fa] p-4 rounded-lg border border-slate-100 mb-2">
                                    <QrCode size={120} strokeWidth={1.5} className="text-slate-800" />
                                </div>
                                <p className="text-[11px] text-slate-400">Quét mã QR để xác thực tại quầy lễ tân</p>
                            </div>

                            {/* Guest List */}
                            <div className="space-y-3">
                                <p className="text-xs font-bold text-slate-800">Danh sách khách lưu trú:</p>
                                {orderDetail.guests.map((g, i) => (
                                    <div key={i} className="text-xs flex gap-2">
                                        <span className="font-bold text-slate-600">Phòng {i+1}:</span>
                                        <span className="text-slate-500">{g.name}</span>
                                    </div>
                                ))}
                                <div className="pt-4 flex justify-between items-center text-xs">
                                    <span className="text-slate-400 italic">Dịch vụ bao gồm:</span>
                                    <span className="font-bold text-slate-800">Ăn sáng</span>
                                </div>
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
                                    <span className="text-slate-500">Tổng tiền Net:</span>
                                    <span className="font-bold text-slate-900">{orderDetail.totalNet}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Trạng thái:</span>
                                    <span className="font-bold text-emerald-600 tracking-tight">{orderDetail.paymentStatus}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Mã giao dịch:</span>
                                    <span className="font-bold text-slate-900">{orderDetail.transactionId}</span>
                                </div>
                            </div>

                            {/* Cột phải: Chính sách */}
                            <div className="space-y-3">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Chính sách quan trọng</p>
                                <div className="bg-[#f8f9fa] p-3 rounded-lg border-l-4 border-blue-500">
                                    <p className="text-[11px] font-bold text-slate-700">Giờ nhận/trả phòng</p>
                                    <p className="text-xs text-slate-600">{orderDetail.checkInTime}</p>
                                </div>
                                <div className="bg-[#fef2f2] p-3 rounded-lg border-l-4 border-rose-500">
                                    <p className="text-[11px] font-bold text-rose-700">Chính sách hủy</p>
                                    <p className="text-xs text-rose-600 leading-relaxed">{orderDetail.cancelPolicy}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Nút quay lại dưới cùng */}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-md transition-all border border-slate-200"
                    >
                        <ArrowLeft size={14} /> Quay lại danh sách
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingDetailPost;