import React, { useState, useEffect } from "react";
import { X, Loader2, Check, Search } from "lucide-react";
import { promotionService } from "@/services/coupon.service.js";

// Giá trị mặc định ban đầu
const getInitialState = (hotelId) => ({
    hotelId: hotelId || 0,
    code: "",
    name: "",
    typePromotion: "PUBLIC",
    typeDiscount: "PERCENT",
    discountVal: 0,
    maxDiscount: 0,
    minOrderVal: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    minStay: 1,
    maxUsage: 100,
    status: "ACTIVE",
    createdBy: "ADMIN_TEST"
});

export default function CreateCouponModal({ isOpen, onClose, onSuccess, hotelId }) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(getInitialState(hotelId));

    // Reset form mỗi khi hotelId thay đổi hoặc khi modal được mở lại
    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState(hotelId));
            setStep(1);
        }
    }, [isOpen, hotelId]);

    if (!isOpen) return null;

    const steps = [
        { id: 1, title: "Thông tin chung" },
        { id: 2, title: "Giá trị giảm" },
        { id: 3, title: "Điều kiện" },
        { id: 4, title: "Đối tượng" }
    ];

    const handleChange = (field, value) => {
        let val = value;
        if (["discountVal", "maxDiscount", "minOrderVal", "minStay", "maxUsage"].includes(field)) {
            if (value === "") {
                val = ""; // Giữ chuỗi rỗng để có thể xóa trắng input
            } else {
                val = Math.max(0, parseFloat(value));
                if (field === "discountVal" && formData.typeDiscount === "PERCENT") {
                    val = Math.min(100, val);
                }
            }
        }
        setFormData(prev => ({ ...prev, [field]: val }));
    };

    // Nếu là 0 thì hiện rỗng để dễ xóa/nhập
    const displayValue = (val) => (val === 0 || val === "0" ? "" : val);

    const validateForm = () => {
        if (!formData.code.trim()) return "Mã Code không được để trống";
        if (!formData.name.trim()) return "Tên chương trình không được để trống";
        if (Number(formData.discountVal || 0) <= 0) return "Giá trị giảm phải lớn hơn 0";
        if (!formData.endDate) return "Vui lòng chọn ngày kết thúc";
        if (new Date(formData.endDate) <= new Date(formData.startDate)) return "Ngày kết thúc phải sau ngày bắt đầu";
        return null;
    };

    const handleCloseModal = () => {
        setFormData(getInitialState(hotelId));
        setStep(1);
        onClose();
    };

    const handleSubmit = async () => {
        const error = validateForm();
        if (error) return alert(error);

        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                hotelId: Number(formData.hotelId),
                discountVal: Number(formData.discountVal || 0),
                maxDiscount: Number(formData.maxDiscount || 0),
                minOrderVal: Number(formData.minOrderVal || 0),
                minStay: Math.floor(Number(formData.minStay || 1)),
                maxUsage: Math.floor(Number(formData.maxUsage || 0)),
                code: formData.code.toUpperCase().replace(/\s+/g, '')
            };

            await promotionService.createPromotion(payload);
            alert("Kích hoạt mã khuyến mãi thành công!");
            onSuccess();
            handleCloseModal(); // Đóng và reset form sau thành công
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi hệ thống khi tạo khuyến mãi");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans text-slate-700">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-5 border-b flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Tạo mã giảm giá mới</h2>
                        <p className="text-sm text-slate-500">Cấu hình chi tiết cho chương trình khuyến mãi</p>
                    </div>
                    <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                {/* Stepper Navigation */}
                <div className="px-10 py-6 border-b bg-slate-50/30">
                    <div className="flex justify-between relative">
                        <div className="absolute top-4 left-0 w-full h-[2px] bg-slate-200 -z-0"></div>
                        {steps.map((s) => (
                            <div key={s.id} className="relative z-10 flex flex-col items-center">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-4 ${
                                    step >= s.id ? "bg-blue-600 border-blue-100 text-white shadow-md shadow-blue-100" : "bg-white border-slate-100 text-slate-400"
                                }`}>
                                    {step > s.id ? <Check size={16} strokeWidth={3} /> : s.id}
                                </div>
                                <span className={`text-[12px] mt-2 font-bold tracking-tight ${step >= s.id ? "text-blue-600" : "text-slate-400"}`}>
                                    {s.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-8 min-h-[380px] max-h-[60vh] overflow-y-auto">
                    {/* BƯỚC 1: THÔNG TIN CHUNG */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-2">Mã Code</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 border border-slate-200 rounded-lg p-3 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 uppercase font-black text-blue-600 tracking-wider"
                                        placeholder="Nhập mã"
                                        value={formData.code}
                                        onChange={(e) => handleChange("code", e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleChange("code", "PROMO" + Math.floor(Math.random() * 10000))}
                                        className="px-5 py-3 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors"
                                    >
                                        Random
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-2">Tên chương trình</label>
                                <input
                                    type="text"
                                    className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500 font-medium"
                                    placeholder="Ví dụ: Giảm giá hè 2026"
                                    value={formData.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* BƯỚC 2: GIÁ TRỊ GIẢM */}
                    {step === 2 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                            <div className="space-y-4">
                                <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${formData.typeDiscount === "PERCENT" ? "border-blue-600 bg-blue-50/50" : "border-slate-100 hover:bg-slate-50"}`}>
                                    <input type="radio" checked={formData.typeDiscount === "PERCENT"} onChange={() => handleChange("typeDiscount", "PERCENT")} className="w-5 h-5 accent-blue-600" />
                                    <div className="flex-1">
                                        <div className="text-sm font-bold">Theo Phần trăm (%)</div>
                                        <div className="grid grid-cols-2 gap-4 mt-3">
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Giá trị (%)</span>
                                                <input type="number" className="w-full border-b-2 border-slate-200 bg-transparent py-1 outline-none focus:border-blue-500 font-bold"
                                                       value={displayValue(formData.discountVal)}
                                                       onChange={(e) => handleChange("discountVal", e.target.value)} />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Giảm tối đa (đ)</span>
                                                <input type="number" className="w-full border-b-2 border-slate-200 bg-transparent py-1 outline-none focus:border-blue-500 font-bold"
                                                       value={displayValue(formData.maxDiscount)}
                                                       onChange={(e) => handleChange("maxDiscount", e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                </label>

                                <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${formData.typeDiscount === "AMOUNT" ? "border-blue-600 bg-blue-50/50" : "border-slate-100 hover:bg-slate-50"}`}>
                                    <input type="radio" checked={formData.typeDiscount === "AMOUNT"} onChange={() => handleChange("typeDiscount", "AMOUNT")} className="w-5 h-5 accent-blue-600" />
                                    <div className="flex-1">
                                        <div className="text-sm font-bold">Số tiền cố định (đ)</div>
                                        <div className="mt-3">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Số tiền giảm (đ)</span>
                                            <input type="number" className="w-full border-b-2 border-slate-200 bg-transparent py-1 outline-none focus:border-blue-500 font-bold"
                                                   value={displayValue(formData.discountVal)}
                                                   onChange={(e) => handleChange("discountVal", e.target.value)} />
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* BƯỚC 3: ĐIỀU KIỆN */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-2">Giá trị đơn hàng tối thiểu (đ)</label>
                                <input type="number" className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500 font-black text-lg"
                                       value={displayValue(formData.minOrderVal)}
                                       onChange={(e) => handleChange("minOrderVal", e.target.value)} />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2">Từ ngày</label>
                                    <input type="date" className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500" value={formData.startDate} onChange={(e) => handleChange("startDate", e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2">Đến ngày</label>
                                    <input type="date" className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500" value={formData.endDate} onChange={(e) => handleChange("endDate", e.target.value)} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-2">Số đêm tối thiểu</label>
                                    <input type="number" className="w-full bg-white border border-slate-200 rounded-lg p-2.5 outline-none focus:border-blue-500 font-bold"
                                           value={displayValue(formData.minStay)}
                                           onChange={(e) => handleChange("minStay", e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-2">Lượt dùng tối đa</label>
                                    <input type="number" className="w-full bg-white border border-slate-200 rounded-lg p-2.5 outline-none focus:border-blue-500 font-bold"
                                           value={displayValue(formData.maxUsage)}
                                           onChange={(e) => handleChange("maxUsage", e.target.value)} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* BƯỚC 4: ĐỐI TƯỢNG */}
                    {step === 4 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <label className="block text-sm font-bold text-slate-800 mb-4 uppercase tracking-widest text-center">Phạm vi áp dụng</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button type="button" onClick={() => handleChange("typePromotion", "PUBLIC")} className={`p-6 border-2 rounded-2xl text-left transition-all ${formData.typePromotion === "PUBLIC" ? "border-blue-600 bg-blue-50 ring-4 ring-blue-50" : "border-slate-100 hover:border-slate-300"}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${formData.typePromotion === "PUBLIC" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}><Check size={20} /></div>
                                    <div className="font-black text-slate-900 uppercase text-xs mb-1">Public</div>
                                    <div className="text-[11px] text-slate-500 leading-relaxed font-medium">Tất cả Đại lý/Khách hàng đều thấy công khai.</div>
                                </button>
                                <button type="button" onClick={() => handleChange("typePromotion", "PRIVATE")} className={`p-6 border-2 rounded-2xl text-left transition-all ${formData.typePromotion === "PRIVATE" ? "border-blue-600 bg-blue-50 ring-4 ring-blue-50" : "border-slate-100 hover:border-slate-300"}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${formData.typePromotion === "PRIVATE" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}><Search size={20} /></div>
                                    <div className="font-black text-slate-900 uppercase text-xs mb-1">Private</div>
                                    <div className="text-[11px] text-slate-500 leading-relaxed font-medium">Mã ẩn, chỉ nhập tay mới có thể dùng.</div>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t bg-slate-50 flex justify-between items-center">
                    <button
                        type="button"
                        onClick={() => setStep(s => s - 1)}
                        disabled={step === 1 || isSubmitting}
                        className={`px-8 py-3 rounded-xl font-bold transition-all border-2 ${step === 1 ? "opacity-0 pointer-events-none" : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50 active:scale-95"}`}
                    >
                        Quay lại
                    </button>
                    <div className="flex gap-3">
                        {step < 4 ? (
                            <button
                                type="button"
                                onClick={() => setStep(s => s + 1)}
                                className="bg-blue-600 text-white px-10 py-3 rounded-xl font-extrabold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200"
                            >
                                Tiếp theo
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-blue-600 text-white px-10 py-3 rounded-xl font-extrabold hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-blue-600/30"
                            >
                                {isSubmitting ? (
                                    <><Loader2 size={18} className="animate-spin" /><span>Đang xử lý...</span></>
                                ) : (
                                    <span>Kích hoạt chương trình</span>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}