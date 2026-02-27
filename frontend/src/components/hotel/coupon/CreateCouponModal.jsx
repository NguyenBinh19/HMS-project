import React, { useState } from "react";
import { X, Search, Loader2 } from "lucide-react";
import { couponApi } from "@/services/coupon.service.js";

export default function CreateCouponModal({ isOpen, onClose, onSuccess }) {
    // 1. Quản lý Step và Trạng thái loading
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 2. Quản lý toàn bộ dữ liệu Form trong 1 state duy nhất (Dễ gửi lên BE)
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        description: "",
        discountType: "percent", // 'percent' hoặc 'fixed'
        discountValue: 10,
        maxDiscount: 500000,
        fixedDiscount: 200000,
        maxBudget: 10000000,
        minOrderValue: 3000000,
        bookingDateStart: "2026-05-01",
        bookingDateEnd: "2026-05-31",
        stayDateStart: "2026-06-01",
        stayDateEnd: "2026-08-30",
        audienceType: "public", // 'public' hoặc 'private'
    });

    if (!isOpen) return null;

    const steps = [
        { id: 1, title: "Thông tin chung" },
        { id: 2, title: "Giá trị giảm" },
        { id: 3, title: "Điều kiện" },
        { id: 4, title: "Đối tượng" }
    ];

    // Cập nhật dữ liệu form
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Tạo mã code ngẫu nhiên
    const generateRandomCode = () => {
        const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
        handleChange("code", `B2B_${randomStr}`);
    };

    // --- RENDER GIAO DIỆN TỪNG BƯỚC --- //

    const renderStep1 = () => (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mã Code</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
                        placeholder="Nhập mã (không dấu, không khoảng trắng)"
                        className="flex-1 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500 font-medium text-slate-800"
                    />
                    <button
                        onClick={generateRandomCode}
                        className="px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 text-sm font-medium transition-colors"
                    >
                        Random
                    </button>
                </div>
                <p className="text-xs text-slate-400 mt-1">Ví dụ: SUMMER2026, WELCOME_B2B</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên chương trình</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Ưu đãi chào hè cho Đại lý mới"
                    className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
                <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Hiển thị cho Đại lý đọc điều kiện..."
                    className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500"
                ></textarea>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Loại giảm</label>

                {/* Radio Phần trăm */}
                <label className="flex items-center gap-2 mb-3 cursor-pointer">
                    <input
                        type="radio"
                        checked={formData.discountType === 'percent'}
                        onChange={() => handleChange("discountType", "percent")}
                        className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-slate-700 font-medium">Theo Phần trăm (%)</span>
                </label>

                {formData.discountType === 'percent' && (
                    <div className="flex gap-4 ml-6 mb-4">
                        <div className="flex-1">
                            <label className="block text-xs text-slate-500 mb-1">Giảm (%)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={formData.discountValue}
                                    onChange={(e) => handleChange("discountValue", e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:border-blue-500 pl-3"
                                />
                                <span className="absolute right-3 top-2.5 text-slate-400 text-sm">%</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs text-slate-500 mb-1">Giảm tối đa (đ)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-slate-400 text-sm">đ</span>
                                <input
                                    type="number"
                                    value={formData.maxDiscount}
                                    onChange={(e) => handleChange("maxDiscount", e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:border-blue-500 pl-8"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Radio Số tiền cố định */}
                <label className="flex items-center gap-2 mb-3 cursor-pointer">
                    <input
                        type="radio"
                        checked={formData.discountType === 'fixed'}
                        onChange={() => handleChange("discountType", "fixed")}
                        className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-slate-700 font-medium">Số tiền cố định (đ)</span>
                </label>

                {formData.discountType === 'fixed' && (
                    <div className="ml-6 mb-4">
                        <label className="block text-xs text-slate-500 mb-1">Mức giảm (đ)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-slate-400 text-sm">đ</span>
                            <input
                                type="number"
                                value={formData.fixedDiscount}
                                onChange={(e) => handleChange("fixedDiscount", e.target.value)}
                                className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:border-blue-500 pl-8"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ngân sách tối đa của chương trình</label>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 text-sm">đ</span>
                    <input
                        type="number"
                        value={formData.maxBudget}
                        onChange={(e) => handleChange("maxBudget", e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500 pl-8"
                    />
                </div>
                <p className="text-xs text-slate-400 mt-1">Khi tổng số tiền khuyến mãi đạt mốc này, mã sẽ tự động dừng</p>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Giá trị đơn hàng tối thiểu</label>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 text-sm">đ</span>
                    <input
                        type="number"
                        value={formData.minOrderValue}
                        onChange={(e) => handleChange("minOrderValue", e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500 pl-8"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Thời gian áp dụng</label>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="block text-xs text-slate-500 mb-1">Ngày đặt phòng (Booking Window)</span>
                        <div className="flex items-center gap-2">
                            <input type="date" value={formData.bookingDateStart} onChange={(e) => handleChange("bookingDateStart", e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:border-blue-500" />
                            <span className="text-sm text-slate-500">đến</span>
                            <input type="date" value={formData.bookingDateEnd} onChange={(e) => handleChange("bookingDateEnd", e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:border-blue-500" />
                        </div>
                    </div>
                    <div>
                        <span className="block text-xs text-slate-500 mb-1">Ngày lưu trú (Stay Window)</span>
                        <div className="flex items-center gap-2">
                            <input type="date" value={formData.stayDateStart} onChange={(e) => handleChange("stayDateStart", e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:border-blue-500" />
                            <span className="text-sm text-slate-500">đến</span>
                            <input type="date" value={formData.stayDateEnd} onChange={(e) => handleChange("stayDateEnd", e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:border-blue-500" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Ràng buộc khác (Tùy chọn)</label>
                <label className="flex items-center gap-2 mb-2 cursor-pointer w-fit">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                    <span className="text-sm text-slate-700">Tối thiểu 2 đêm</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                    <span className="text-sm text-slate-700">Không áp dụng Lễ/Tết</span>
                </label>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phạm vi hiển thị & Áp dụng</label>
                <div className="flex gap-6 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            checked={formData.audienceType === 'public'}
                            onChange={() => handleChange("audienceType", "public")}
                            className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-slate-700">Public (Công khai)</span>
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Tất cả Đại lý đều thấy</span>
                    </label>
                </div>
                <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            checked={formData.audienceType === 'private'}
                            onChange={() => handleChange("audienceType", "private")}
                            className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-slate-700 font-medium">Private (Riêng tư)</span>
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Chỉ Đại lý được chọn</span>
                    </label>
                </div>
            </div>

            {formData.audienceType === 'private' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="mb-3">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tìm kiếm Đại lý</label>
                        <div className="relative">
                            <input type="text" placeholder="Tìm tên hoặc ID Đại lý..." className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500" />
                            <Search className="absolute right-3 top-2.5 text-slate-400" size={18} />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm text-slate-700 mb-1">Danh sách đã chọn</label>
                        <div className="flex flex-wrap gap-2 border border-slate-200 p-3 rounded-lg min-h-[60px] bg-slate-50">
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-indigo-100 text-indigo-700 text-sm font-medium">
                                Viettravel <X size={14} className="cursor-pointer hover:text-red-500"/>
                            </span>
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-indigo-100 text-indigo-700 text-sm font-medium">
                                Saigontourist <X size={14} className="cursor-pointer hover:text-red-500"/>
                            </span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Hoặc chọn nhanh theo Cấp bậc (Rank)</label>
                        <div className="space-y-2">
                            {['Hạng Bạch Kim (Rank S)', 'Hạng Vàng (Rank A)', 'Hạng Bạc (Rank B)'].map(rank => (
                                <label key={rank} className="flex items-center gap-2 cursor-pointer w-fit">
                                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                                    <span className="text-sm text-slate-700">{rank}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // --- XỬ LÝ NÚT BẤM (HÀNH ĐỘNG) --- //

    // Khi người dùng bấm "Kích hoạt mã" ở bước cuối
    const handleSubmitForm = async () => {
        // Basic validation: Bắt buộc nhập mã code
        if (!formData.code.trim()) {
            alert("Vui lòng nhập Mã Code ở Bước 1!");
            setStep(1);
            return;
        }

        setIsSubmitting(true);
        try {
            // Gọi API lưu dữ liệu xuống Database ảo
            await couponApi.createCoupon(formData);

            // Thành công: Reset form, đóng modal, gọi callback refresh bảng
            setStep(1);
            setFormData({ ...formData, code: "", name: "", description: "" }); // Clear text
            onSuccess();
        } catch (error) {
            console.error(error);
            alert("Đã xảy ra lỗi khi tạo mã!");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden">

                {/* Header Modal */}
                <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Tạo mã giảm giá mới</h2>
                        <p className="text-sm text-slate-500 mt-1">Cấu hình chi tiết cho chương trình khuyến mãi</p>
                    </div>
                    <button
                        onClick={() => { setStep(1); onClose(); }}
                        className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Stepper Header (Thanh tiến trình 1-2-3-4) */}
                <div className="px-6 pt-6 pb-2">
                    <div className="flex justify-between relative">
                        {/* Đường kẻ ngang (Line connect) */}
                        <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-200 z-0"></div>

                        {steps.map((s) => (
                            <div key={s.id} className="relative z-10 flex flex-col items-center gap-2 w-1/4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                                    step >= s.id
                                        ? "bg-blue-600 text-white ring-4 ring-white"
                                        : "bg-slate-200 text-slate-500 ring-4 ring-white"
                                }`}>
                                    {step > s.id ? "✓" : s.id}
                                </div>
                                <span className={`text-xs font-semibold ${step >= s.id ? "text-blue-600" : "text-slate-400"}`}>
                                    {s.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Body Content (Nội dung thay đổi theo step) */}
                <div className="p-6 h-[420px] overflow-y-auto custom-scrollbar">
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderStep4()}
                </div>

                {/* Footer Actions (Nút điều hướng) */}
                <div className="p-5 border-t border-slate-200 flex justify-between items-center bg-slate-50/50">
                    <button
                        onClick={() => setStep(prev => Math.max(prev - 1, 1))}
                        disabled={step === 1 || isSubmitting}
                        className={`px-6 py-2.5 rounded-lg font-medium transition-colors border ${
                            step === 1
                                ? "bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed opacity-0"
                                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                    >
                        Quay lại
                    </button>

                    <div className="flex gap-3">
                        {step < 4 ? (
                            <button
                                onClick={() => setStep(prev => Math.min(prev + 1, 4))}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
                            >
                                Tiếp theo
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmitForm}
                                disabled={isSubmitting}
                                className={`flex items-center gap-2 px-8 py-2.5 rounded-lg font-medium transition-all shadow-md text-white
                                    ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                                {isSubmitting ? "Đang tạo mã..." : "Kích hoạt mã ngay"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}