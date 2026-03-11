import React, { useState } from 'react';
import { Star, Send, X, ShieldCheck, Trophy, AlertCircle } from 'lucide-react';

// Hằng số theo đặc tả UC-032
const RATING_CRITERIA = [
    { id: 'overall', label: 'Xếp hạng sao (Tổng quan)' },
    { id: 'cleanliness', label: 'Vệ sinh sạch sẽ' },
    { id: 'service', label: 'Chất lượng phục vụ' }
];

const ServiceFeedbackModule = ({ booking, onClose, onRefresh }) => {
    // 1. Quản lý State tập trung
    const [formData, setFormData] = useState({
        overall: 5,
        cleanliness: 5,
        service: 5,
        comment: '',
        bookingId: booking?.id || '',
        hotelId: booking?.hotelId || ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // 2. Hàm xử lý thay đổi điểm sao
    const handleStarClick = (criteria, value) => {
        setFormData(prev => ({ ...prev, [criteria]: value }));
    };

    // 3. Hàm gửi API (Kết nối với BE)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {

            console.log("Dữ liệu gửi lên BE:", formData);

            // Giả lập thời gian chờ API
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Hiển thị thành công
            alert("MSG-SYS-26: Đánh giá thành công! Điểm uy tín khách sạn đã được cập nhật.");

            if (onRefresh) onRefresh(); // Reload lại trang để ẩn nút "Viết đánh giá"
            onClose();
        } catch (err) {
            setError("Có lỗi xảy ra khi kết nối máy chủ. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">

                {/* Header: Thông tin đơn hàng */}
                <div className="px-6 py-5 border-b flex justify-between items-center bg-slate-50/80">
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Viết đánh giá</h2>
                        <p className="text-xs text-blue-600 font-semibold uppercase mt-1">
                            Mã đơn: {booking?.bookingCode || 'N/A'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Phần 1: Đánh giá tiêu chí */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck size={18} className="text-blue-500" />
                            <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">Chất lượng dịch vụ</span>
                        </div>

                        {RATING_CRITERIA.map((cat) => (
                            <div key={cat.id} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                                <span className="text-sm font-semibold text-slate-600">{cat.label}</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={24}
                                            onClick={() => handleStarClick(cat.id, star)}
                                            className={`cursor-pointer transition-transform active:scale-90 ${
                                                star <= formData[cat.id] ? "fill-amber-400 text-amber-400" : "text-slate-200"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Phần 2: Nhận xét */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Nhận xét chi tiết</label>
                        <textarea
                            required
                            value={formData.comment}
                            onChange={(e) => setFormData({...formData, comment: e.target.value})}
                            placeholder="Ví dụ: Khách hàng đánh giá cao phòng sạch và nhân viên nhiệt tình..."
                            className="w-full p-4 border border-slate-200 rounded-2xl text-sm h-32 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none resize-none bg-slate-50/50 transition-all"
                        />
                    </div>

                    {/* Phần 3: Incentive (Loyalty Points/Agency XP) */}
                    <div className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                        <div className="bg-emerald-500 p-2.5 rounded-xl text-white shadow-lg shadow-emerald-200">
                            <Trophy size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-emerald-900">Nhận ngay Agency XP!</p>
                            <p className="text-[10px] text-emerald-700 mt-0.5">Mỗi đánh giá góp phần tăng hạng tín nhiệm cho Đại lý của bạn.</p>
                        </div>
                    </div>

                    {/* Footer & Submit */}
                    {error && (
                        <div className="flex items-center gap-2 text-rose-500 text-xs font-medium">
                            <AlertCircle size={14} /> {error}
                        </div>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-colors"
                        >
                            Để sau
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-[2] flex items-center justify-center gap-2 px-8 py-3 bg-[#006ce4] hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 transition-all disabled:opacity-50"
                        >
                            <Send size={18} />
                            {isSubmitting ? "Đang xử lý..." : "Gửi đánh giá"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ServiceFeedbackModule;