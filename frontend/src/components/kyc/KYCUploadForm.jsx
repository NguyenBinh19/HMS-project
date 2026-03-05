import React, { useState } from 'react';
import { Upload, Camera, Building, User, Edit3, ArrowLeft } from 'lucide-react';

const KYCUploadForm = ({ onBack, onSubmit }) => {
    const [isUploading, setIsUploading] = useState(false);

    // Validate theo BR-KYC-02: JPG/PDF < 5MB
    const validateFile = (file) => {
        const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!validTypes.includes(file.type)) return "Định dạng không hỗ trợ";
        if (file.size > 5 * 1024 * 1024) return "Dung lượng tối đa 5MB";
        return null;
    };

    return (
        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white">
            {/* Cột trái: Upload các loại giấy tờ */}
            <div className="space-y-8">
                <UploadBox title="1. Giấy phép kinh doanh (GPKD)" id="gpkd" />
                <div className="grid grid-cols-2 gap-4">
                    <UploadBox title="2. CCCD mặt trước" id="cccd-front" />
                    <UploadBox title="2. CCCD mặt sau" id="cccd-back" />
                </div>
                <UploadBox title="3. Chụp ảnh chân dung" id="portrait" isPortrait />
            </div>

            {/* Cột phải: Thông tin trích xuất OCR (Bước 5 UC-035) */}
            <div className="space-y-8">
                <div>
                    <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-4">
                        <Building size={18} className="text-blue-600" /> Thông tin Doanh nghiệp
                    </h3>
                    <div className="space-y-3">
                        <OCRInput label="Tên Doanh nghiệp" value="" />
                        <OCRInput label="Mã số thuế" value="" />
                        <OCRInput label="Địa chỉ đăng ký" value="" isTextArea />
                    </div>
                </div>

                <div>
                    <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-4">
                        <User size={18} className="text-blue-600" /> Thông tin Người đại diện
                    </h3>
                    <div className="space-y-3">
                        <OCRInput label="Họ và tên" value="" />
                        <OCRInput label="Số CCCD/CMND" value="" />
                    </div>
                </div>

                <div className="flex gap-4 pt-6">
                    <button onClick={onBack} className="flex-1 flex items-center justify-center gap-2 py-3 font-bold text-slate-500 border rounded-xl hover:bg-slate-50">
                        <ArrowLeft size={18}/> Quay lại
                    </button>
                    <button
                        onClick={() => onSubmit({ status: 'pending' })}
                        className="flex-[2] bg-blue-500 text-white py-3 rounded-xl font-bold hover:bg-blue-600 shadow-md transition-all"
                    >
                        Xác nhận & Gửi hồ sơ
                    </button>
                </div>
            </div>
        </div>
    );
};

// Component con cho ô Upload
const UploadBox = ({ title, isPortrait }) => (
    <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">{title}</label>
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50 flex flex-col items-center justify-center hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-all min-h-[160px]">
            <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                {isPortrait ? <Camera className="text-slate-400" /> : <Upload className="text-slate-400" />}
            </div>
            <p className="text-xs font-medium text-slate-500">Kéo thả ảnh hoặc <span className="text-blue-600">Chọn từ máy tính</span></p>
        </div>
    </div>
);

// Component con cho Input OCR
const OCRInput = ({ label, value, isTextArea }) => (
    <div>
        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">{label}</label>
        <div className="relative">
            {isTextArea ? (
                <textarea className="w-full border-slate-200 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white outline-none" rows="2" placeholder="Tự động điền..." />
            ) : (
                <input className="w-full border-slate-200 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white outline-none" placeholder="Tự động điền..." />
            )}
            <Edit3 size={14} className="absolute right-3 top-3 text-blue-400" />
        </div>
    </div>
);

export default KYCUploadForm;