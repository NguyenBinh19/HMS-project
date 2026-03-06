import React, { useState } from 'react';
import { X, AlertTriangle, Check, RotateCcw, Clock, Lock, Search, Maximize2, Building2, Hotel, User } from "lucide-react";
import { kycService, KYC_STATUS } from '@/services/kyc.service.js';

const KYCReviewModal = ({ data, onClose, onRefresh }) => {
    const [submitting, setSubmitting] = useState(false);
    const [currentDocIndex, setCurrentDocIndex] = useState(0);

    // Hàm chuyển đổi nhãn đối tác sang Tiếng Việt
    const getPartnerLabel = (type) => {
        const t = type?.toUpperCase();
        if (t === 'HOTEL') return "KHÁCH SẠN";
        if (t === 'AGENCY') return "ĐẠI LÝ";
        return t || "N/A";
    };

    // Hàm chuyển đổi nhãn tài liệu sang Tiếng Việt
    const getDocTypeLabel = (type) => {
        switch (type) {
            case 'BUSINESS_LICENSE': return "GP KINH DOANH";
            case 'REPRESENTATIVE_CIC_FRONT': return "CCCD MẶT TRƯỚC";
            case 'REPRESENTATIVE_CIC_BACK': return "CCCD MẶT SAU";
            default: return type?.replace(/_/g, ' ') || "TÀI LIỆU";
        }
    };

    const handleAction = async (status) => {
        const vId = data?.verificationId || data?.id;

        if (!vId) {
            alert("Lỗi: Không tìm thấy ID hồ sơ trong dữ liệu!");
            return;
        }

        let reason = "";
        if (status !== KYC_STATUS.VERIFIED) {
            const statusLabel = status === KYC_STATUS.REJECT ? "TỪ CHỐI" : "YÊU CẦU BỔ SUNG";
            reason = prompt(`Nhập lý do cho trạng thái [${statusLabel}]:`);
            if (reason === null) return;
            if (!reason.trim()) {
                alert("Bắt buộc phải nhập lý do!");
                return;
            }
        }

        setSubmitting(true);
        try {
            const payload = {
                verificationId: Number(vId),
                reviewedBy: "bf116d64-8e4e-42ee-b9c7-c8e6f2c907a8", // ID Admin tạm thời
                status: status,
                rejectionReason: status === KYC_STATUS.VERIFIED ? "" : reason
            };

            await kycService.approveVerification(payload);
            alert("Xử lý hồ sơ thành công!");
            onRefresh();
            onClose();
        } catch (error) {
            console.error("Lỗi duyệt hồ sơ:", error);
            alert("Lỗi máy chủ: " + (error.response?.data?.message || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (!data) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
            <div className="bg-white w-full max-w-7xl rounded-xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b flex justify-between items-center bg-white">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Chi tiết hồ sơ xét duyệt #{data.verificationId || data.id}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
                                {getPartnerLabel(data.partnerType)}
                            </span>
                            <p className="text-xs text-slate-500 uppercase tracking-tight">{data.legalName} • MST: {data.taxCode}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex">
                    {/* Cột trái: Thông tin văn bản */}
                    <div className="w-[45%] overflow-y-auto p-6 border-r space-y-8 bg-white">
                        <div>
                            <h4 className="text-[13px] font-bold text-blue-600 mb-4 uppercase tracking-widest flex items-center gap-2">
                                <Building2 size={16} /> Thông tin doanh nghiệp
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <InfoBox label="TÊN CÔNG TY / ĐƠN VỊ" value={data.legalName} />
                                <InfoBox label="MÃ SỐ THUẾ" value={data.taxCode} />
                                <InfoBox label="SỐ GIẤY PHÉP KD" value={data.businessLicenseNumber} />
                                <InfoBox label="LOẠI ĐỐI TÁC" value={getPartnerLabel(data.partnerType)} />
                                <div className="col-span-2">
                                    <InfoBox label="ĐỊA CHỈ ĐĂNG KÝ" value={data.businessAddress} isTextArea />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-[13px] font-bold text-blue-600 mb-4 uppercase tracking-widest flex items-center gap-2">
                                <User size={16} /> Người đại diện pháp luật
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <InfoBox label="HỌ VÀ TÊN" value={data.representativeName} />
                                <InfoBox label="SỐ CMND / CCCD" value={data.representativeCICNumber} />
                                <InfoBox label="NGÀY CẤP" value={data.representativeCICDate} />
                                <InfoBox label="NƠI CẤP" value={data.representativeCICPlace} />
                            </div>
                        </div>
                    </div>

                    {/* Cột phải: Xem trước tài liệu */}
                    <div className="flex-1 bg-slate-50 p-6 flex flex-col overflow-hidden">
                        <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
                            {data.documents?.map((doc, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setCurrentDocIndex(idx)}
                                    className={`min-w-[120px] h-20 bg-white border-2 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all shadow-sm ${currentDocIndex === idx ? 'border-blue-500 ring-2 ring-blue-50' : 'border-slate-200 hover:border-blue-300'}`}
                                >
                                    <span className="text-[9px] text-center font-bold text-slate-500 px-2 leading-tight uppercase">
                                        {getDocTypeLabel(doc.documentType)}
                                    </span>
                                    {currentDocIndex === idx && <div className="mt-1 w-1 h-1 bg-blue-500 rounded-full"></div>}
                                </div>
                            ))}
                        </div>

                        <div className="flex-1 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden shadow-inner relative group">
                            <div className="flex-1 p-4 flex items-center justify-center overflow-auto bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                                {data.documents?.[currentDocIndex] ? (
                                    <img
                                        src={data.documents[currentDocIndex].fileUrl}
                                        alt="document-preview"
                                        className="max-w-full max-h-full object-contain shadow-lg"
                                    />
                                ) : (
                                    <div className="text-center">
                                        <AlertTriangle size={48} className="text-slate-300 mx-auto mb-2" />
                                        <p className="text-slate-400 font-medium">Không tìm thấy ảnh tài liệu</p>
                                    </div>
                                )}
                            </div>
                            {/* Phóng to ảnh (Gợi ý tính năng) */}
                            {data.documents?.[currentDocIndex] && (
                                <a
                                    href={data.documents[currentDocIndex].fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="absolute bottom-4 right-4 p-2 bg-white/80 backdrop-blur rounded-full shadow hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Maximize2 size={16} className="text-slate-600" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-5 border-t bg-[#f8fafc] flex justify-between items-center shrink-0">
                    <p className="text-[11px] text-slate-400 font-medium italic">
                        * Vui lòng kiểm tra kỹ thông tin đối chiếu với hình ảnh tài liệu trước khi phê duyệt.
                    </p>
                    <div className="flex gap-3">
                        <button
                            disabled={submitting}
                            onClick={() => handleAction(KYC_STATUS.NEED_MORE_INFO)}
                            className="px-6 py-2.5 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                        >
                            <RotateCcw size={16} /> BỔ SUNG
                        </button>
                        <button
                            disabled={submitting}
                            onClick={() => handleAction(KYC_STATUS.REJECT)}
                            className="px-6 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                        >
                            <X size={16} /> TỪ CHỐI
                        </button>
                        <button
                            disabled={submitting}
                            onClick={() => handleAction(KYC_STATUS.VERIFIED)}
                            className="px-8 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-sm font-bold transition-all shadow-lg shadow-emerald-100 flex items-center gap-2"
                        >
                            <Check size={16} /> PHÊ DUYỆT
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InfoBox = ({ label, value, isTextArea }) => (
    <div className="group">
        <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider group-hover:text-blue-500 transition-colors">
            {label}
        </label>
        <div className={`w-full px-4 py-2.5 border border-slate-100 rounded-lg bg-slate-50 text-[13px] font-medium text-slate-700 shadow-sm ${isTextArea ? 'min-h-[80px]' : ''}`}>
            {value || <span className="text-slate-300 italic">Chưa cập nhật</span>}
        </div>
    </div>
);

export default KYCReviewModal;