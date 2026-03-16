import React, { useState } from 'react';
import { X, AlertTriangle, Check, Clock, Building2, User, Maximize2, Info } from "lucide-react";
import { kycService, KYC_STATUS } from '@/services/kyc.service.js';

const KYCReviewModal = ({ data, onClose, onRefresh }) => {
    const [submitting, setSubmitting] = useState(false);
    const [currentDocIndex, setCurrentDocIndex] = useState(0);

    // Đảm bảo lấy đúng data từ API Response
    const actualData = data?.result || data;

    const allDocuments = actualData?.documents || [];
    const existingUrls = actualData?.existingDocuments || [];

    const displayDocs = [
        ...allDocuments,
        ...existingUrls.map((url, idx) => ({
            id: `old-${idx}`,
            fileUrl: url,
            documentType: "OLD_DOCUMENT",
            isOld: true // Thêm dòng này
        }))
    ];

    const currentDoc = displayDocs[currentDocIndex];

    const getPartnerLabel = (type) => {
        const t = type?.toUpperCase();
        if (t === 'HOTEL') return "KHÁCH SẠN";
        if (t === 'AGENCY') return "ĐẠI LÝ";
        return t || "N/A";
    };

    const getDocTypeLabel = (doc) => {
        // Lấy string type từ object doc, nếu không có thì mặc định là chuỗi rỗng
        const typeString = doc?.documentType || "";

        // Kiểm tra xem đây có phải ảnh cũ không (dựa trên flag hoặc tên file)
        const isOld = doc?.isOld || doc?.fileUrl?.includes('old_');

        let label = "";
        switch (typeString.toUpperCase()) {
            case 'BUSINESS_LICENSE':
                label = "GP KINH DOANH";
                break;
            case 'REPRESENTATIVE_CIC_FRONT':
                label = "CCCD MẶT TRƯỚC";
                break;
            case 'REPRESENTATIVE_CIC_BACK':
                label = "CCCD MẶT SAU";
                break;
            case 'OLD_DOCUMENT':
                label = "DỮ LIỆU CŨ";
                break;
            default:
                label = typeString ? typeString.replace(/_/g, ' ') : "TÀI LIỆU";
        }

        return isOld ? `[CŨ] ${label}` : label;
    };

    const handleAction = async (targetStatus) => {
        const vId = actualData?.id;
        if (!vId) {
            alert("Lỗi: Không tìm thấy ID hồ sơ!");
            return;
        }

        let reason = "";
        const normalizedStatus = targetStatus.toUpperCase();
        const isVerified = normalizedStatus === "VERIFIED";

        // Nếu không phải phê duyệt, bắt buộc nhập lý do
        if (!isVerified) {
            const statusLabel = targetStatus === KYC_STATUS.REJECTED ? "TỪ CHỐI" : "YÊU CẦU BỔ SUNG";
            reason = prompt(`Nhập lý do cho trạng thái [${statusLabel}]:`);

            if (reason === null) return; // Người dùng nhấn Cancel prompt
            if (!reason.trim()) {
                alert("BẮT BUỘC: Bạn phải nhập lý do khi từ chối hoặc yêu cầu bổ sung!");
                return;
            }
        }

        setSubmitting(true);
        try {
            // Xác định đây là hồ sơ mới hay hồ sơ cập nhật (Update Flow)
            const isUpdateFlow = !!(actualData.agencyId || actualData.hotelId);

            const payload = {
                verificationId: Number(vId),
                status: targetStatus,
                rejectionReason: isVerified ? "" : reason,
                verificationBefore: isUpdateFlow
            };

            await kycService.approveVerification(payload);
            alert("Xử lý hồ sơ thành công!");
            onRefresh();
            onClose();
        } catch (error) {
            console.error("Approve Error:", error);
            alert("Lỗi hệ thống: " + (error.response?.data?.message || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (!actualData) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-[1000] p-4 font-sans">
            <div className="bg-white w-full max-w-7xl rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-slate-200">

                {/* --- Header --- */}
                <div className="px-8 py-5 border-b flex justify-between items-center bg-white shrink-0">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic">
                                Xét duyệt hồ sơ <span className="text-blue-600">#{actualData.id}</span>
                            </h2>
                            {(actualData.agencyId || actualData.hotelId) && (
                                <span className="px-3 py-1 bg-amber-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-sm">
                                    Hồ sơ cập nhật
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 font-bold uppercase tracking-widest">
                            {actualData.legalName} • MST: {actualData.taxCode}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-800"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* --- Main Content --- */}
                <div className="flex-1 overflow-hidden flex">

                    {/* Cột trái: Chi tiết dữ liệu */}
                    <div className="w-[35%] overflow-y-auto p-8 border-r space-y-10 bg-white">
                        <section>
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Building2 size={18} /></div>
                                <h4 className="text-[13px] font-black text-slate-800 uppercase tracking-widest">Dữ liệu pháp nhân</h4>
                            </div>
                            <div className="grid grid-cols-1 gap-5">
                                <InfoBox label="TÊN DOANH NGHIỆP" value={actualData.legalName} />
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoBox label="MÃ SỐ THUẾ" value={actualData.taxCode} />
                                    <InfoBox label="SỐ GIẤY PHÉP KD" value={actualData.businessLicenseNumber} />
                                </div>
                                <InfoBox label="LOẠI ĐỐI TÁC" value={getPartnerLabel(actualData.partnerType)} />
                                <InfoBox label="ĐỊA CHỈ TRỤ SỞ" value={actualData.businessAddress} isTextArea />
                            </div>
                        </section>

                        <section className="pt-6 border-t border-slate-100">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><User size={18} /></div>
                                <h4 className="text-[13px] font-black text-slate-800 uppercase tracking-widest">Người đại diện</h4>
                            </div>
                            <div className="grid grid-cols-1 gap-5">
                                <InfoBox label="HỌ VÀ TÊN" value={actualData.representativeName} />
                                <InfoBox label="SỐ CMND / CCCD" value={actualData.representativeCICNumber} />
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoBox label="NGÀY CẤP" value={actualData.representativeCICDate} />
                                    <InfoBox label="NƠI CẤP" value={actualData.representativeCICPlace} />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Cột phải: Trình xem tài liệu */}
                    <div className="flex-1 bg-slate-50 p-8 flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            {/* CHỖ SỬA 1: Tổng số lượng ảnh */}
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                Tài liệu đính kèm ({displayDocs.length})
                            </h4>

                            {/* CHỖ SỬA 2: Các dấu chấm nhỏ */}
                            <div className="flex gap-2">
                                {displayDocs.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentDocIndex(idx)}
                                        className={`w-3 h-3 rounded-full transition-all ${currentDocIndex === idx ? 'bg-blue-600 w-6' : 'bg-slate-300'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 mb-6 overflow-x-auto pb-2 shrink-0 no-scrollbar">
                            {/* CHỖ SỬA 3: Các nút Tabs chọn loại tài liệu */}
                            {displayDocs.map((doc, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentDocIndex(idx)}
                                    className={`px-5 py-2.5 bg-white border-2 rounded-xl text-[10px] font-black transition-all whitespace-nowrap shadow-sm ${currentDocIndex === idx ? 'border-blue-600 text-blue-600 ring-2 ring-blue-50' : 'border-transparent text-slate-400 hover:border-slate-200'}`}
                                >
                                    {getDocTypeLabel(doc)}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 bg-white border-2 border-slate-200 rounded-[2rem] flex items-center justify-center overflow-hidden shadow-2xl relative group">
                            {/* CHỖ SỬA 4: Hiển thị nội dung ảnh chính */}
                            {currentDoc ? (
                                <>
                                    <img
                                        key={currentDoc.fileUrl}
                                        src={currentDoc.fileUrl}
                                        alt="kyc-document"
                                        className="max-w-[95%] max-h-[95%] object-contain rounded-lg transition-transform duration-500 group-hover:scale-[1.02]"
                                    />
                                    <a
                                        href={currentDoc.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute bottom-6 right-6 p-4 bg-slate-900 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600 flex items-center gap-2 text-xs font-bold shadow-xl translate-y-4 group-hover:translate-y-0"
                                    >
                                        <Maximize2 size={18} /> PHÓNG TO
                                    </a>
                                </>
                            ) : (
                                <div className="text-slate-300 flex flex-col items-center gap-4">
                                    <div className="p-6 bg-slate-50 rounded-full"><AlertTriangle size={64} /></div>
                                    <p className="text-sm font-black uppercase tracking-tighter text-slate-400">Thiếu dữ liệu hình ảnh</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- Footer --- */}
                <div className="p-6 border-t bg-white flex justify-between items-center shrink-0 px-8">
                    <div className="flex items-center gap-3 text-slate-400">
                        <div className="p-2 bg-slate-100 rounded-full"><Clock size={16} /></div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Thẩm định viên</span>
                            <span className="text-[11px] font-medium italic">Vui lòng đối soát kỹ thông tin trước khi nhấn phê duyệt</span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            disabled={submitting}
                            onClick={() => handleAction(KYC_STATUS.NEED_MORE_INFORMATION)}
                            className="px-6 py-3 bg-white border-2 border-amber-500 text-amber-600 hover:bg-amber-50 rounded-2xl text-[11px] font-black uppercase transition-all flex items-center gap-2"
                        >
                            Yêu cầu bổ sung
                        </button>
                        <button
                            disabled={submitting}
                            onClick={() => handleAction(KYC_STATUS.REJECTED)}
                            className="px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl text-[11px] font-black uppercase transition-all"
                        >
                            Từ chối hồ sơ
                        </button>
                        <button
                            disabled={submitting}
                            onClick={() => handleAction(KYC_STATUS.VERIFIED)}
                            className="px-12 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-2xl text-[11px] font-black uppercase transition-all shadow-xl shadow-blue-200 flex items-center gap-2 disabled:opacity-50"
                        >
                            {submitting ? "Đang xử lý..." : <><Check size={18} /> Phê duyệt đối tác</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Component hiển thị thông tin con
const InfoBox = ({ label, value, isTextArea }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 block ml-1 uppercase tracking-widest">{label}</label>
        <div className={`w-full px-4 py-3 border-2 border-slate-50 rounded-2xl bg-slate-50/50 text-[12px] font-bold text-slate-700 shadow-sm transition-all hover:border-slate-100 ${isTextArea ? 'min-h-[60px] leading-relaxed' : ''}`}>
            {value || <span className="text-slate-300 italic font-normal">Chưa cập nhật</span>}
        </div>
    </div>
);

export default KYCReviewModal;