import React, { useState } from 'react';
import { X, AlertTriangle, Check, RotateCcw, Clock, Lock, Search, Maximize2 } from "lucide-react";
import { kycService, KYC_STATUS } from '@/services/kyc.service.js';

const KYCReviewModal = ({ data, onClose, onRefresh }) => {
    // Phải khai báo State bên trong Component
    const [submitting, setSubmitting] = useState(false);
    const [currentDocIndex, setCurrentDocIndex] = useState(0);

    // Hàm handleAction phải nằm TRONG KYCReviewModal
    const handleAction = async (status) => {
        // KIỂM TRA ID: Backend báo lỗi null vì trường này bị thiếu
        // Chúng ta kiểm tra cả .id và .verificationId
        const vId = data?.verificationId || data?.id;

        console.log("DEBUG - Hồ sơ data:", data);
        console.log("DEBUG - ID tìm thấy:", vId);

        if (!vId) {
            alert("Lỗi: Không tìm thấy ID hồ sơ trong dữ liệu! Vui lòng kiểm tra lại Backend response.");
            return;
        }

        let reason = "";
        if (status !== KYC_STATUS.VERIFIED) {
            reason = prompt(`Nhập lý do cho trạng thái [${status}]:`);
            if (reason === null) return;
            if (!reason.trim()) {
                alert("Bắt buộc nhập lý do!");
                return;
            }
        }

        setSubmitting(true);
        try {
            // Đảm bảo payload gửi đi có đầy đủ 4 trường Backend yêu cầu
            const payload = {
                verificationId: Number(vId), // Ép kiểu số
                reviewedBy: "bf116d64-8e4e-42ee-b9c7-c8e6f2c907a8", // ID Admin
                status: status,
                rejectionReason: status === KYC_STATUS.VERIFIED ? "" : reason
            };

            await kycService.approveVerification(payload);

            alert("Xử lý hồ sơ thành công!");
            onRefresh();
            onClose();
        } catch (error) {
            console.error("Lỗi duyệt hồ sơ:", error);
            alert("Lỗi server: " + (error.response?.data?.message || error.message));
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
                        <h2 className="text-xl font-bold text-slate-800">Chi tiết hồ sơ #{data.verificationId || data.id}</h2>
                        <p className="text-xs text-slate-500 uppercase tracking-tight">{data.legalName} • MST: {data.taxCode}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex">
                    {/* Left: Data */}
                    <div className="w-[45%] overflow-y-auto p-6 border-r space-y-8">
                        <div>
                            <h4 className="text-[13px] font-bold text-slate-800 mb-4 uppercase">Thông tin doanh nghiệp</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <InfoBox label="TÊN CÔNG TY" value={data.legalName} />
                                <InfoBox label="MÃ SỐ THUẾ" value={data.taxCode} />
                                <InfoBox label="SỐ GPKD" value={data.businessLicenseNumber} />
                                <InfoBox label="LOẠI ĐỐI TÁC" value={data.partnerType} />
                                <div className="col-span-2">
                                    <InfoBox label="ĐỊA CHỈ" value={data.businessAddress} isTextArea />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-[13px] font-bold text-slate-800 mb-4 uppercase">Người đại diện</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <InfoBox label="HỌ TÊN" value={data.representativeName} />
                                <InfoBox label="SỐ CMND/CCCD" value={data.representativeCICNumber} />
                                <InfoBox label="NGÀY CẤP" value={data.representativeCICDate} />
                                <InfoBox label="NƠI CẤP" value={data.representativeCICPlace} />
                            </div>
                        </div>
                    </div>

                    {/* Right: Document Preview */}
                    <div className="flex-1 bg-slate-50 p-6 flex flex-col overflow-hidden">
                        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                            {data.documents?.map((doc, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setCurrentDocIndex(idx)}
                                    className={`min-w-[100px] h-20 bg-white border-2 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${currentDocIndex === idx ? 'border-blue-500 ring-2 ring-blue-50' : 'border-slate-200'}`}
                                >
                                    <span className="text-[9px] text-center font-bold text-slate-500 px-1 uppercase">{doc.documentType?.replace(/_/g, ' ')}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex-1 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden shadow-inner text-center">
                            <div className="flex-1 p-4 flex items-center justify-center overflow-auto">
                                {data.documents?.[currentDocIndex] ? (
                                    <img
                                        src={data.documents[currentDocIndex].fileUrl}
                                        alt="document"
                                        className="max-w-full max-h-full object-contain"
                                    />
                                ) : (
                                    <p className="text-slate-400">Không có ảnh tài liệu</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-5 border-t bg-[#f8fafc] flex justify-end gap-3 shrink-0">
                    <button
                        disabled={submitting}
                        onClick={() => handleAction(KYC_STATUS.NEED_MORE_INFO)}
                        className="px-5 py-2.5 bg-[#fef3c7] text-[#92400e] rounded-lg text-sm font-bold"
                    >
                        BỔ SUNG
                    </button>
                    <button
                        disabled={submitting}
                        onClick={() => handleAction(KYC_STATUS.REJECT)}
                        className="px-5 py-2.5 bg-red-500 text-white rounded-lg text-sm font-bold"
                    >
                        TỪ CHỐI
                    </button>
                    <button
                        disabled={submitting}
                        onClick={() => handleAction(KYC_STATUS.VERIFIED)}
                        className="px-5 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-bold"
                    >
                        PHÊ DUYỆT
                    </button>
                </div>
            </div>
        </div>
    );
};

const InfoBox = ({ label, value, isTextArea }) => (
    <div>
        <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">{label}</label>
        <div className={`w-full px-3 py-2 border border-slate-100 rounded-lg bg-slate-50 text-[13px] text-slate-700 ${isTextArea ? 'min-h-[60px]' : ''}`}>
            {value || "N/A"}
        </div>
    </div>
);

export default KYCReviewModal;