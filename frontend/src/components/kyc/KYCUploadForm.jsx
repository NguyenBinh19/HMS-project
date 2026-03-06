import React, { useState, useRef } from 'react';
import { Upload, Camera, Building, User, Edit3, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { DOCUMENT_TYPES } from '@/services/kyc.service.js' ;

const KYCUploadForm = ({ onBack, onSubmit }) => {
    const [loading, setLoading] = useState(false);

    // State chứa thông tin text
    const [formData, setFormData] = useState({
        partnerType: "AGENCY", // Mặc định HOTEL
        legalName: "",
        taxCode: "",
        businessAddress: "",
        representativeName: "",
        representativeCICNumber: "",
        businessLicenseNumber: "",
        representativeCICDate: "",
        representativeCICPlace: ""
    });

    // State chứa file
    const [files, setFiles] = useState({
        gpkd: null,
        front: null,
        back: null
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (id, file) => {
        if (!file) return;
        setFiles(prev => ({ ...prev, [id]: file }));
    };

    const handleFinalSubmit = () => {
        // 1. Kiểm tra bắt buộc nhập đủ tất cả các trường text
        const requiredFields = [
            'legalName', 'taxCode', 'businessAddress',
            'representativeName', 'representativeCICNumber',
            'businessLicenseNumber', 'representativeCICDate',
            'representativeCICPlace'
        ];

        const isMissingField = requiredFields.some(field => !formData[field] || formData[field].trim() === "");

        if (isMissingField) {
            alert("Vui lòng nhập đầy đủ tất cả các trường thông tin bắt buộc!");
            return;
        }

        // 2. Kiểm tra đủ 3 ảnh bắt buộc
        if (!files.gpkd || !files.front || !files.back) {
            alert("Vui lòng tải lên đủ 3 loại ảnh: GPKD, Mặt trước và Mặt sau CCCD.");
            return;
        }

        // 3. Chuẩn bị dữ liệu JSON khớp với Class KycUploadRequest của BE
        const submitData = {
            partnerType: formData.partnerType, // Mặc định HOTEL hoặc AGENCY
            legalName: formData.legalName,
            taxCode: formData.taxCode,
            businessAddress: formData.businessAddress,
            representativeName: formData.representativeName,
            representativeCICNumber: formData.representativeCICNumber,
            businessLicenseNumber: formData.businessLicenseNumber,
            representativeCICDate: formData.representativeCICDate, // Định dạng YYYY-MM-DD
            representativeCICPlace: formData.representativeCICPlace,
            // DocumentTypes phải tương ứng với thứ tự file trong mảng files bên dưới
            documentTypes: [
                "BUSINESS_LICENSE",
                "REPRESENTATIVE_CIC_FRONT",
                "REPRESENTATIVE_CIC_BACK"
            ]
        };

        // 4. Mảng file tương ứng với documentTypes
        const fileList = [files.gpkd, files.front, files.back];

        setLoading(true);
        // Truyền dữ liệu sang KYCPage để thực thi uploadKyc
        onSubmit({ data: submitData, files: fileList });
    };

    return (
        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white">
            {/* Cột trái: Upload */}
            <div className="space-y-8">
                <div className="flex gap-4 p-1 bg-slate-100 rounded-xl w-fit mb-4">
                    {["HOTEL", "AGENCY"].map(type => (
                        <button
                            key={type}
                            onClick={() => setFormData(p => ({...p, partnerType: type}))}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${formData.partnerType === type ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <UploadBox
                    title="1. Giấy phép kinh doanh (GPKD)"
                    file={files.gpkd}
                    onFileSelect={(file) => handleFileChange('gpkd', file)}
                />
                <div className="grid grid-cols-2 gap-4">
                    <UploadBox
                        title="2. CCCD mặt trước"
                        file={files.front}
                        onFileSelect={(file) => handleFileChange('front', file)}
                    />
                    <UploadBox
                        title="2. CCCD mặt sau"
                        file={files.back}
                        onFileSelect={(file) => handleFileChange('back', file)}
                    />
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
                    <Camera className="text-blue-500" />
                    <p className="text-xs text-blue-700 font-medium">Lưu ý: Ảnh chụp rõ nét, không mất góc, không lóa sáng.</p>
                </div>
            </div>

            {/* Cột phải: Thông tin */}
            <div className="space-y-8">
                <div>
                    <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-4">
                        <Building size={18} className="text-blue-600" /> Thông tin Doanh nghiệp
                    </h3>
                    <div className="space-y-3">
                        <OCRInput label="Tên Doanh nghiệp" name="legalName" value={formData.legalName} onChange={handleInputChange} />
                        <div className="grid grid-cols-2 gap-3">
                            <OCRInput label="Mã số thuế" name="taxCode" value={formData.taxCode} onChange={handleInputChange} />
                            <OCRInput label="Số GPKD" name="businessLicenseNumber" value={formData.businessLicenseNumber} onChange={handleInputChange} />
                        </div>
                        <OCRInput label="Địa chỉ đăng ký" name="businessAddress" value={formData.businessAddress} onChange={handleInputChange} isTextArea />
                    </div>
                </div>

                <div>
                    <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-4">
                        <User size={18} className="text-blue-600" /> Thông tin Người đại diện
                    </h3>
                    <div className="space-y-3">
                        <OCRInput label="Họ và tên" name="representativeName" value={formData.representativeName} onChange={handleInputChange} />
                        <OCRInput label="Số CCCD/CMND" name="representativeCICNumber" value={formData.representativeCICNumber} onChange={handleInputChange} />
                        <div className="grid grid-cols-2 gap-3">
                            <OCRInput label="Ngày cấp" name="representativeCICDate" type="date" value={formData.representativeCICDate} onChange={handleInputChange} />
                            <OCRInput label="Nơi cấp" name="representativeCICPlace" value={formData.representativeCICPlace} onChange={handleInputChange} />
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-6">
                    <button onClick={onBack} className="flex-1 flex items-center justify-center gap-2 py-3 font-bold text-slate-500 border rounded-xl hover:bg-slate-50">
                        <ArrowLeft size={18}/> Quay lại
                    </button>
                    <button
                        disabled={loading}
                        onClick={handleFinalSubmit}
                        className={`flex-[2] text-white py-3 rounded-xl font-bold shadow-md transition-all ${loading ? 'bg-slate-400' : 'bg-blue-500 hover:bg-blue-600'}`}
                    >
                        {loading ? "Đang xử lý..." : "Xác nhận & Gửi hồ sơ"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const UploadBox = ({ title, onFileSelect, file }) => {
    const fileInputRef = useRef(null);
    return (
        <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">{title}</label>
            <div
                onClick={() => fileInputRef.current.click()}
                className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center transition-all min-h-[140px] ${file ? 'border-green-400 bg-green-50' : 'border-slate-200 bg-slate-50/50 hover:bg-blue-50 hover:border-blue-200 cursor-pointer'}`}
            >
                <input type="file" hidden ref={fileInputRef} onChange={(e) => onFileSelect(e.target.files[0])} accept="image/*,application/pdf" />
                {file ? (
                    <>
                        <CheckCircle2 className="text-green-500 mb-2" size={32} />
                        <p className="text-[10px] font-bold text-green-600 truncate max-w-full px-2">{file.name}</p>
                    </>
                ) : (
                    <>
                        <div className="bg-white p-2 rounded-full shadow-sm mb-2"><Upload className="text-slate-400" size={20} /></div>
                        <p className="text-[11px] font-medium text-slate-500 text-center">Tải lên ảnh</p>
                    </>
                )}
            </div>
        </div>
    );
};

const OCRInput = ({ label, value, onChange, name, isTextArea, type="text" }) => (
    <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{label}</label>
        <div className="relative">
            {isTextArea ? (
                <textarea name={name} value={value} onChange={onChange} className="w-full border-slate-200 rounded-lg p-2 text-sm bg-slate-50 focus:bg-white outline-none" rows="2" />
            ) : (
                <input type={type} name={name} value={value} onChange={onChange} className="w-full border-slate-200 rounded-lg p-2 text-sm bg-slate-50 focus:bg-white outline-none" />
            )}
            <Edit3 size={12} className="absolute right-3 top-3 text-slate-300" />
        </div>
    </div>
);

export default KYCUploadForm;