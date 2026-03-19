import React, { useState } from "react";
import {
    Percent, DollarSign, Calendar, Save, History,
    AlertCircle, CheckCircle2, Info, ArrowRight, Clock
} from "lucide-react";

const SetHotelCommission = ({ hotelId }) => {
    // Dữ liệu giả lập từ Master Data
    const currentSettings = {
        standardRate: 15,
        type: "PERCENTAGE",
        lastUpdated: "2025-12-10T10:30:00Z",
        updatedBy: "Admin_01"
    };

    const [rateType, setRateType] = useState("PERCENTAGE"); // PERCENTAGE or FIXED
    const [value, setValue] = useState(currentSettings.standardRate);
    const [effectiveDate, setEffectiveDate] = useState("");
    const [endDate, setEndDate] = useState(""); // Cho UC085.1
    const [reason, setReason] = useState("");
    const [isAdvanced, setIsAdvanced] = useState(false);

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: "", msg: "" });

    // Validation BR-COM-01
    const isInvalid = rateType === "PERCENTAGE" && (value <= 0 || value >= 100);

    const handleSave = async () => {
        if (isInvalid || !reason) {
            setStatus({ type: "error", msg: "Vui lòng kiểm tra lại giá trị và nhập lý do thay đổi." });
            return;
        }

        setLoading(true);
        // Giả lập gọi API (POST /api/hotels/{id}/commission)
        setTimeout(() => {
            setLoading(false);
            setStatus({ type: "success", msg: "Cấu hình thương mại đã được cập nhật thành công!" });
            setTimeout(() => setStatus({ type: "", msg: "" }), 4000);
        }, 1000);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header: Current Status */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        {currentSettings.type === "PERCENTAGE" ? <Percent size={24}/> : <DollarSign size={24}/>}
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tỉ lệ chiết khấu hiện tại</p>
                        <h3 className="text-xl font-black text-slate-800">
                            {currentSettings.standardRate}{currentSettings.type === "PERCENTAGE" ? "%" : " USD"}
                            <span className="ml-2 text-sm font-medium text-slate-400">(Tiêu chuẩn)</span>
                        </h3>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 justify-end">
                        <Clock size={12}/> Cập nhật lần cuối: {new Date(currentSettings.lastUpdated).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="text-[11px] text-slate-400">Người thực hiện: <b>{currentSettings.updatedBy}</b></p>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Main Configuration Form */}
                <div className="col-span-12 lg:col-span-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-black text-slate-800">Điều chỉnh cấu hình thương mại</h2>
                        <button
                            onClick={() => setIsAdvanced(!isAdvanced)}
                            className="text-xs font-bold text-blue-600 hover:underline"
                        >
                            {isAdvanced ? "Quay lại cấu hình chuẩn" : "Cấu hình nâng cao (Tiered)"}
                        </button>
                    </div>

                    {/* Rate Type Selection (UC085.2) */}
                    <div className="flex gap-3 mb-6">
                        <button
                            onClick={() => setRateType("PERCENTAGE")}
                            className={`flex-1 py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-2 font-bold text-sm transition-all ${rateType === 'PERCENTAGE' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}
                        >
                            <Percent size={16}/> Theo phần trăm (%)
                        </button>
                        <button
                            onClick={() => setRateType("FIXED")}
                            className={`flex-1 py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-2 font-bold text-sm transition-all ${rateType === 'FIXED' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}
                        >
                            <DollarSign size={16}/> Số tiền cố định (B2B)
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Value Input */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Giá trị chiết khấu (UC085.E1)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    className={`w-full pl-4 pr-12 py-3 bg-slate-50 border rounded-xl font-bold outline-none transition-all ${isInvalid ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100'} focus:ring-4`}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                                    {rateType === "PERCENTAGE" ? "%" : "USD"}
                                </span>
                            </div>
                            {isInvalid && <p className="text-[11px] text-red-500 mt-1 font-medium">Lỗi: Tỉ lệ phải từ 0% đến 100%.</p>}
                        </div>

                        {/* Date Configuration */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Ngày có hiệu lực</label>
                                <input
                                    type="date"
                                    value={effectiveDate}
                                    onChange={(e) => setEffectiveDate(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                                />
                            </div>
                            {isAdvanced && (
                                <div className="animate-in slide-in-from-left-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block text-blue-600">Ngày kết thúc (UC085.1)</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full p-3 bg-blue-50/30 border border-blue-100 rounded-xl text-sm outline-none"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Audit Reason */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Lý do thay đổi (Audit Trail)</label>
                            <textarea
                                rows={3}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="VD: Gia hạn hợp đồng 2026, Điều chỉnh theo mùa..."
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-50/50 resize-none"
                            />
                        </div>

                        {/* Notification Status */}
                        {status.msg && (
                            <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                {status.type === 'success' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}
                                {status.msg}
                            </div>
                        )}

                        <button
                            disabled={loading || isInvalid}
                            onClick={handleSave}
                            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
                        >
                            {loading ? "Đang xử lý..." : <><Save size={18}/> Lưu cấu hình thương mại</>}
                        </button>
                    </div>
                </div>

                {/* Sidebar: Guidelines & History */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                        <h4 className="text-amber-800 font-bold text-sm flex items-center gap-2 mb-3">
                            <Info size={16}/> Lưu ý nghiệp vụ
                        </h4>
                        <ul className="text-[11px] text-amber-700 space-y-2 leading-relaxed">
                            <li>• Thay đổi chỉ áp dụng cho <b>Booking mới</b> tạo sau ngày hiệu lực.</li>
                            <li>• Commission tính trên <b>Giá gốc (Base Price)</b> chưa bao gồm thuế phí.</li>
                            <li>• Mọi thay đổi đều được lưu vết Audit Trail phục vụ đối soát tài chính hàng tháng.</li>
                        </ul>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h4 className="text-slate-800 font-bold text-sm flex items-center gap-2 mb-4">
                            <History size={16}/> Lịch sử thay đổi
                        </h4>
                        <div className="space-y-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="flex gap-3 pb-4 border-b border-slate-50 last:border-0">
                                    <div className="w-1 h-8 bg-slate-200 rounded-full mt-1"></div>
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-700">15% → 18%</p>
                                        <p className="text-[10px] text-slate-400">01/01/2026 bởi AnhTV</p>
                                        <p className="text-[10px] text-slate-500 italic mt-1">"Điều chỉnh hợp đồng năm mới"</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SetHotelCommission;