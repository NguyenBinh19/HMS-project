import React, { useState } from 'react';
import {
    Star, MessageCircle, AlertTriangle, Send,
    TrendingUp, TrendingDown, Flag, CheckCircle2,
    Image as ImageIcon, Filter, MessageSquareQuote
} from 'lucide-react';

const HotelFeedbackManagement = () => {
    // Dữ liệu giả lập danh sách đánh giá từ Agencies
    const [reviews, setReviews] = useState([
        {
            id: "REV-102",
            agencyName: "VietTravel Agency",
            bookingId: "#BK-8899",
            rating: 2.5,
            categories: { cleanliness: 3, service: 2, location: 4, cooperation: 2 },
            content: "Khách phàn nàn điều hòa hỏng tại phòng 302, khách sạn đổi phòng rất chậm và thái độ nhân viên lễ tân chưa tốt.",
            images: ["room1.jpg"],
            date: "2026-03-05",
            status: "pending", // pending, responded, reported
            reply: ""
        },
        {
            id: "REV-101",
            agencyName: "Saigon Tourist",
            bookingId: "#BK-7722",
            rating: 4.8,
            categories: { cleanliness: 5, service: 5, location: 4, cooperation: 5 },
            content: "Dịch vụ tuyệt vời. Quy trình check-in cho đoàn khách của chúng tôi rất nhanh chóng. Sẽ tiếp tục hợp tác lâu dài.",
            images: [],
            date: "2026-03-01",
            status: "responded",
            reply: "Cảm ơn Saigon Tourist đã luôn tin tưởng. Chúng tôi luôn ưu tiên hỗ trợ tốt nhất cho các đoàn khách từ phía quý đại lý!"
        }
    ]);

    const [replyText, setReplyText] = useState({});

    // Hàm xác định màu sắc dựa trên số điểm
    const getScoreColor = (score) => {
        if (score >= 4.0) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        if (score >= 3.0) return 'text-amber-600 bg-amber-50 border-amber-100';
        return 'text-rose-600 bg-rose-50 border-rose-100';
    };

    // Xử lý gửi phản hồi (UC055.0 - Bước 6, 7)
    const handleSendReply = (id) => {
        setReviews(reviews.map(rev =>
            rev.id === id ? { ...rev, status: 'responded', reply: replyText[id] } : rev
        ));
        alert("Hệ thống đã lưu phản hồi và gửi thông báo tới Đại lý!");
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8 bg-[#f8fafc] min-h-screen font-sans">

            {/* 1. Dashboard Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Điểm trung bình</p>
                    <h2 className="text-5xl font-black text-slate-800">4.5<span className="text-xl text-slate-400">/5.0</span></h2>
                    <div className="flex items-center gap-1 mt-2 text-emerald-500 font-bold text-sm">
                        <TrendingUp size={16} /> +0.2 tháng này
                    </div>
                </div>

                <div className="md:col-span-3 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <p className="text-sm font-bold text-slate-700 mb-4">Chi tiết tiêu chí (Breakdown)</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {['Vệ sinh', 'Dịch vụ', 'Vị trí', 'Hợp tác'].map((label, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex justify-between text-xs font-bold text-slate-500">
                                    <span>{label}</span>
                                    <span>4.2</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '82%' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 2. Review List */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800">Danh sách đánh giá từ Đại lý</h3>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white border rounded-xl text-sm font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all">
                            <Filter size={16} /> Lọc điểm số
                        </button>
                    </div>
                </div>

                {reviews.map((rev) => (
                    <div key={rev.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                {/* Agency Info & Rating */}
                                <div className="flex gap-4">
                                    <div className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center font-black ${getScoreColor(rev.rating)}`}>
                                        {rev.rating}
                                        <Star size={12} fill="currentColor" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-lg">{rev.agencyName}</h4>
                                        <div className="flex items-center gap-3 text-xs font-bold text-slate-400 mt-1">
                                            <span className="text-blue-600">Mã đơn: {rev.bookingId}</span>
                                            <span>•</span>
                                            <span>Ngày gửi: {rev.date}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div className="flex items-start gap-2">
                                    {rev.status === 'responded' ? (
                                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase flex items-center gap-1">
                      <CheckCircle2 size={12} /> Đã phản hồi
                    </span>
                                    ) : (
                                        <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full uppercase">Chờ xử lý</span>
                                    )}
                                    {/* Report Abuse */}
                                    <button title="Báo cáo vi phạm" className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                                        <Flag size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="mt-6 p-5 bg-slate-50 rounded-2xl border border-slate-100 relative">
                                <MessageSquareQuote className="absolute -top-3 -left-2 text-slate-200" size={32} />
                                <p className="text-slate-700 text-sm leading-relaxed italic relative z-10">"{rev.content}"</p>

                                {rev.images.length > 0 && (
                                    <div className="mt-4 flex gap-2">
                                        <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80">
                                            <ImageIcon size={20} className="text-slate-400" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Reply Section */}
                            <div className="mt-6">
                                {rev.status === 'responded' ? (
                                    <div className="ml-8 p-5 bg-blue-50 border-l-4 border-blue-400 rounded-r-2xl">
                                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Phản hồi của khách sạn</p>
                                        <p className="text-sm text-blue-800 font-medium leading-relaxed">{rev.reply}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                    <textarea
                        placeholder="Viết phản hồi của bạn để giải thích hoặc xin lỗi đại lý... (Bước 5)"
                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all"
                        value={replyText[rev.id] || ""}
                        onChange={(e) => setReplyText({...replyText, [rev.id]: e.target.value})}
                    />
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => handleSendReply(rev.id)}
                                                disabled={!replyText[rev.id]}
                                                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
                                            >
                                                <Send size={16} /> Gửi phản hồi
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HotelFeedbackManagement;