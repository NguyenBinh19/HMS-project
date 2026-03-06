import React, { useState, useEffect } from "react";
import { X, Loader2, Check, Globe, Lock, Calendar, Tag, AlertCircle, Eye, History } from "lucide-react";
import { promotionService } from "@/services/coupon.service.js";

export default function UpdateCouponModal({ isOpen, onClose, onSuccess, couponId }) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [formData, setFormData] = useState(null);
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        if (isOpen && couponId) {
            fetchDetail();
        } else {
            setStep(1);
        }
    }, [isOpen, couponId]);

    const fetchDetail = async () => {
        setIsLoadingDetail(true);
        try {
            const res = await promotionService.getPromotionDetail(couponId);
            const data = res.result;
            setFormData(data);

            // UC067.E1: Kiểm tra mã đã hết hạn chưa
            const now = new Date();
            now.setHours(0,0,0,0);
            if (new Date(data.endDate) < now) {
                setIsExpired(true);
            } else {
                setIsExpired(false);
            }
        } catch (error) {
            alert("Không thể lấy thông tin chi tiết!");
            onClose();
        } finally {
            setIsLoadingDetail(false);
        }
    };

    if (!isOpen || !formData) return null;

    const steps = [
        { id: 1, title: "Cơ bản" },
        { id: 2, title: "Giá trị" },
        { id: 3, title: "Thời hạn" },
        { id: 4, title: "Cấu hình" }
    ];

    const handleChange = (field, value) => {
        if (isExpired) return; // UC067.E1: Không cho sửa nếu hết hạn
        let val = value;
        if (["discountVal", "maxDiscount", "minOrderVal", "minStay", "maxUsage"].includes(field)) {
            val = value === "" ? 0 : parseFloat(value);
            if (field === "discountVal" && formData.typeDiscount === "PERCENT") val = Math.min(100, val);
        }
        setFormData(prev => ({ ...prev, [field]: val }));
    };

    const handleSubmit = async () => {
        // UC067.0 Step 5: Validate Date Logic
        if (new Date(formData.startDate) >= new Date(formData.endDate)) {
            alert("Ngày bắt đầu phải nhỏ hơn ngày kết thúc!");
            return;
        }

        setIsSubmitting(true);
        try {
            // Đảm bảo kiểu dữ liệu chuẩn trước khi gửi
            const payload = {
                ...formData,
                discountVal: Number(formData.discountVal),
                maxDiscount: Number(formData.maxDiscount),
                minOrderVal: Number(formData.minOrderVal),
                maxUsage: Number(formData.maxUsage),
                minStay: Number(formData.minStay)
            };

            await promotionService.updatePromotion(couponId, payload);
            alert("Cập nhật thành công!");
            onSuccess();
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi cập nhật");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">

                {isLoadingDetail ? (
                    <div className="p-20 flex flex-col items-center gap-4 text-slate-400">
                        <Loader2 className="animate-spin" size={40} />
                        <p className="font-medium">Đang truy xuất dữ liệu...</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="p-6 border-b flex justify-between items-start bg-slate-50/50">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                    <History size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                                            {isExpired ? "Chi tiết mã (Hết hạn)" : "Sửa mã khuyến mãi"}
                                        </h2>
                                        {isExpired && <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold">READ ONLY</span>}
                                    </div>
                                    <p className="text-sm text-slate-500">Mã code: <span className="font-mono font-bold text-blue-600">{formData.code}</span></p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-all text-slate-400"><X size={20} /></button>
                        </div>

                        {/* Stepper */}
                        <div className="px-8 py-4 bg-white border-b">
                            <div className="flex justify-between items-center">
                                {steps.map((s, idx) => (
                                    <React.Fragment key={s.id}>
                                        <div className="flex flex-col items-center gap-1.5 cursor-pointer" onClick={() => setStep(s.id)}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s.id ? "bg-slate-900 text-white shadow-lg shadow-slate-200" : "bg-slate-100 text-slate-400"}`}>
                                                {step > s.id ? <Check size={14} /> : s.id}
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase ${step >= s.id ? "text-slate-900" : "text-slate-400"}`}>{s.title}</span>
                                        </div>
                                        {idx < steps.length - 1 && <div className="h-[2px] flex-1 mx-2 bg-slate-100 mb-5"></div>}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-8 min-h-[340px] max-h-[60vh] overflow-y-auto">
                            {/* Thông báo chế độ Read-only UC067.E1 */}
                            {isExpired && (
                                <div className="mb-6 bg-red-50 border border-red-100 p-4 rounded-xl flex gap-3 items-center text-red-700">
                                    <AlertCircle size={20} />
                                    <p className="text-xs font-medium">Chương trình này đã kết thúc. Theo quy tắc <b>UC067.E1</b>, bạn chỉ có thể xem lại dữ liệu cũ.</p>
                                </div>
                            )}

                            {step === 1 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2">Mã Coupon (Bất biến)</label>
                                        <div className="p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-500 font-mono font-bold">
                                            {formData.code}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Tên chương trình</label>
                                        <input type="text" disabled={isExpired} className="w-full border-2 border-slate-100 rounded-xl p-3 focus:border-blue-500 outline-none font-medium disabled:bg-slate-50"
                                               value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="p-4 bg-blue-50/50 rounded-2xl border-2 border-blue-100">
                                            <label className="block text-[11px] font-bold text-blue-400 uppercase mb-1">Giá trị giảm ({formData.typeDiscount})</label>
                                            <input type="number" disabled={isExpired} className="w-full bg-transparent text-2xl font-black text-blue-700 outline-none disabled:opacity-50"
                                                   value={formData.discountVal} onChange={(e) => handleChange("discountVal", e.target.value)} />
                                        </div>
                                        {formData.typeDiscount === "PERCENT" && (
                                            <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200">
                                                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Giảm tối đa (VNĐ)</label>
                                                <input type="number" disabled={isExpired} className="w-full bg-transparent text-2xl font-black text-slate-700 outline-none"
                                                       value={formData.maxDiscount} onChange={(e) => handleChange("maxDiscount", e.target.value)} />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-slate-400 italic">Theo quy tắc <b>Non-retroactive</b>, thay đổi giá trị này sẽ không ảnh hưởng đến các booking đã xác nhận trước đó.</p>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Từ ngày</label>
                                            <input type="date" disabled={isExpired} className="w-full border-2 border-slate-100 rounded-xl p-3 font-bold text-sm disabled:bg-slate-50"
                                                   value={formData.startDate} onChange={(e) => handleChange("startDate", e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Đến ngày</label>
                                            <input type="date" disabled={isExpired} className="w-full border-2 border-slate-100 rounded-xl p-3 font-bold text-sm disabled:bg-slate-50"
                                                   value={formData.endDate} onChange={(e) => handleChange("endDate", e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="p-4 border-t grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Lượt dùng tối đa</label>
                                            <input type="number" disabled={isExpired} className="w-full border-2 border-slate-100 rounded-xl p-3 font-bold"
                                                   value={formData.maxUsage} onChange={(e) => handleChange("maxUsage", e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Đêm ở tối thiểu</label>
                                            <input type="number" disabled={isExpired} className="w-full border-2 border-slate-100 rounded-xl p-3 font-bold"
                                                   value={formData.minStay} onChange={(e) => handleChange("minStay", e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="space-y-8 animate-in slide-in-from-right-4 duration-200 text-center">
                                    <div className="flex justify-center gap-4">
                                        {['PUBLIC', 'PRIVATE'].map(type => (
                                            <div key={type} className={`px-6 py-4 rounded-2xl border-2 flex flex-col items-center gap-2 ${formData.typePromotion === type ? 'border-blue-600 bg-blue-50' : 'border-slate-100 opacity-50'}`}>
                                                {type === 'PUBLIC' ? <Globe size={24}/> : <Lock size={24}/>}
                                                <span className="font-bold text-xs">{type}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-6 border-t">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Trạng thái</h3>
                                        <div className="flex bg-slate-100 p-1 rounded-xl w-fit mx-auto">
                                            {['ACTIVE', 'INACTIVE'].map(st => (
                                                <button key={st} disabled={isExpired} onClick={() => handleChange("status", st)}
                                                        className={`px-8 py-2 rounded-lg text-xs font-black transition-all ${formData.status === st ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>
                                                    {st}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t bg-slate-50 flex justify-between gap-3">
                            <button onClick={() => setStep(s => s - 1)} disabled={step === 1}
                                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${step === 1 ? "opacity-0" : "text-slate-500 hover:bg-slate-200"}`}>
                                Quay lại
                            </button>
                            <div className="flex gap-3">
                                <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-sm text-slate-400 hover:text-slate-600">Đóng</button>
                                {step < 4 ? (
                                    <button onClick={() => setStep(s => s + 1)} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-sm">Tiếp theo</button>
                                ) : (
                                    !isExpired && (
                                        <button onClick={handleSubmit} disabled={isSubmitting}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-xl font-bold text-sm shadow-xl flex items-center gap-2 transition-all">
                                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Lưu thay đổi"}
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}