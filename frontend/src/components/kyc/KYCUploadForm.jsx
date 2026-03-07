import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, Building, User, Edit3, ArrowLeft, CheckCircle2, Plus, X, Info } from 'lucide-react';
import { kycService } from '@/services/kyc.service.js';
import { useLocation } from 'react-router-dom';

const KYCUploadForm = ({ onBack, onSubmit }) => {
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [isFetchingOldData, setIsFetchingOldData] = useState(false);

    // State chứa thông tin text
    const [formData, setFormData] = useState({
        partnerType: "",
        legalName: "",
        taxCode: "",
        businessAddress: "",
        representativeName: "",
        representativeCICNumber: "",
        businessLicenseNumber: "",
        representativeCICDate: "",
        representativeCICPlace: ""
    });

    // State chứa file (Người dùng sẽ phải upload lại file mới để đảm bảo tính cập nhật)
    const [files, setFiles] = useState({
        gpkd: [],
        front: null,
        back: null
    });

    // --- LOGIC XỬ LÝ DỮ LIỆU CŨ (NEED_MORE_INFO) ---
    useEffect(() => {
        const oldKycId = location.state?.oldKycId;
        if (oldKycId) {
            fetchOldKycData(oldKycId);
        }
    }, [location]);

    const fetchOldKycData = async (id) => {
        setIsFetchingOldData(true);
        try {
            const res = await kycService.getVerificationDetail(id);
            const data = res.result || res;

            setFormData({
                partnerType: data.partnerType || "AGENCY",
                legalName: data.legalName || "",
                taxCode: data.taxCode || "",
                businessAddress: data.businessAddress || "",
                representativeName: data.representativeName || "",
                representativeCICNumber: data.representativeCICNumber || "",
                businessLicenseNumber: data.businessLicenseNumber || "",
                representativeCICDate: data.representativeCICDate ? data.representativeCICDate.split('T')[0] : "",
                representativeCICPlace: data.representativeCICPlace || ""
            });
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu cũ:", error);
        } finally {
            setIsFetchingOldData(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGPKDChange = (e) => {
        const newFiles = Array.from(e.target.files);
        setFiles(prev => ({ ...prev, gpkd: [...prev.gpkd, ...newFiles] }));
    };

    const removeGPKD = (index) => {
        setFiles(prev => ({
            ...prev,
            gpkd: prev.gpkd.filter((_, i) => i !== index)
        }));
    };

    const handleFinalSubmit = () => {
        // --- VALIDATION ---
        if (!formData.partnerType.trim()) { alert("Vui lòng chọn loại đối tác!"); return; }

        const requiredFields = {
            legalName: "Tên Doanh nghiệp",
            taxCode: "Mã số thuế",
            businessAddress: "Địa chỉ đăng ký",
            representativeName: "Họ và tên người đại diện",
            representativeCICNumber: "Số CCCD/CMND",
            businessLicenseNumber: "Số GPKD"
        };

        for (const [key, label] of Object.entries(requiredFields)) {
            if (!formData[key] || formData[key].toString().trim() === "") {
                alert(`BẮT BUỘC: [${label}] không được để trống!`);
                return;
            }
        }

        if (files.gpkd.length === 0 || !files.front || !files.back) {
            alert("Vui lòng upload đầy đủ ảnh GPKD và CCCD (mặt trước/sau)!");
            return;
        }

        const docTypes = [
            ...files.gpkd.map(() => "BUSINESS_LICENSE"),
            "REPRESENTATIVE_CIC_FRONT",
            "REPRESENTATIVE_CIC_BACK"
        ];

        const submitData = {
            ...formData,
            documentTypes: docTypes
        };

        const fileList = [...files.gpkd, files.front, files.back];

        setLoading(true);
        onSubmit({ data: submitData, files: fileList });
    };

    if (isFetchingOldData) {
        return (
            <div className="p-20 text-center flex flex-col items-center gap-4">
                <RefreshCw className="animate-spin text-blue-600" size={40} />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Đang tải dữ liệu cũ...</p>
            </div>
        );
    }

    return (
        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white max-h-[90vh] overflow-y-auto relative">

            {/* CỘT TRÁI: UPLOAD ẢNH */}
            <div className="space-y-6">
                {location.state?.fromStatus === "NEED_MORE_INFO" && (
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3 mb-6 animate-pulse">
                        <Info className="text-blue-500 shrink-0" size={20} />
                        <div>
                            <p className="text-xs font-black text-blue-800 uppercase tracking-tight">Chế độ cập nhật hồ sơ</p>
                            <p className="text-[11px] text-blue-700 mt-1 italic font-medium">
                                Hệ thống đã tự động điền lại thông tin cũ. Vui lòng kiểm tra, sửa đổi và <b>tải lên ảnh mới</b> để hoàn tất bổ sung.
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex gap-4 p-1 bg-slate-100 rounded-xl w-fit mb-4">
                    {["HOTEL", "AGENCY"].map(type => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => setFormData(p => ({...p, partnerType: type}))}
                            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${formData.partnerType === type ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* Phần Upload GPKD */}
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">1. Giấy phép kinh doanh (Nhiều ảnh)</label>
                    <div className="grid grid-cols-2 gap-3">
                        {files.gpkd.map((file, idx) => (
                            <div key={idx} className="relative group border-2 border-emerald-200 bg-emerald-50 p-2 rounded-xl flex items-center gap-2 animate-in fade-in zoom-in-95">
                                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                                <span className="text-[10px] font-medium truncate text-emerald-700">{file.name}</span>
                                <button onClick={() => removeGPKD(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X size={10} />
                                </button>
                            </div>
                        ))}
                        <label className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all min-h-[80px]">
                            <input type="file" hidden multiple onChange={handleGPKDChange} accept="image/*" />
                            <Plus size={20} className="text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-500 mt-1">Thêm ảnh GPKD</span>
                        </label>
                    </div>
                </div>

                {/* Phần Upload CCCD  */}
                <div className="grid grid-cols-2 gap-4">
                    <UploadBox
                        title="2. CCCD mặt trước"
                        file={files.front}
                        onFileSelect={(file) => setFiles(p => ({...p, front: file}))}
                    />
                    <UploadBox
                        title="3. CCCD mặt sau"
                        file={files.back}
                        onFileSelect={(file) => setFiles(p => ({...p, back: file}))}
                    />
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-3">
                    <Camera className="text-amber-500" />
                    <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                        Lưu ý: Chụp trực tiếp bản gốc, không dùng ảnh scan, ảnh không bị lóa sáng hay mất góc.
                    </p>
                </div>
            </div>

            {/* CỘT PHẢI: FORM THÔNG TIN  */}
            <div className="space-y-6">
                <div>
                    <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-4 uppercase text-sm tracking-widest">
                        <Building size={16} className="text-blue-600" /> Thông tin Doanh nghiệp
                    </h3>
                    <div className="space-y-3">
                        <OCRInput label="Tên Doanh nghiệp (Pháp lý)" name="legalName" value={formData.legalName} onChange={handleInputChange} />
                        <div className="grid grid-cols-2 gap-3">
                            <OCRInput label="Mã số thuế" name="taxCode" value={formData.taxCode} onChange={handleInputChange} />
                            <OCRInput label="Số GPKD" name="businessLicenseNumber" value={formData.businessLicenseNumber} onChange={handleInputChange} />
                        </div>
                        <OCRInput label="Địa chỉ trụ sở chính" name="businessAddress" value={formData.businessAddress} onChange={handleInputChange} isTextArea />
                    </div>
                </div>

                <div>
                    <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-4 uppercase text-sm tracking-widest">
                        <User size={16} className="text-blue-600" /> Người đại diện pháp luật
                    </h3>
                    <div className="space-y-3">
                        <OCRInput label="Họ và tên" name="representativeName" value={formData.representativeName} onChange={handleInputChange} />
                        <OCRInput label="Số CMND / CCCD" name="representativeCICNumber" value={formData.representativeCICNumber} onChange={handleInputChange} />
                        <div className="grid grid-cols-2 gap-3">
                            <OCRInput label="Ngày cấp" name="representativeCICDate" type="date" value={formData.representativeCICDate} onChange={handleInputChange} />
                            <OCRInput label="Nơi cấp" name="representativeCICPlace" value={formData.representativeCICPlace} onChange={handleInputChange} />
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button type="button" onClick={onBack} className="flex-1 flex items-center justify-center gap-2 py-3.5 font-bold text-slate-500 border-2 rounded-xl hover:bg-slate-50 transition-colors uppercase text-xs">
                        <ArrowLeft size={18}/> Quay lại
                    </button>
                    <button
                        type="button"
                        disabled={loading}
                        onClick={handleFinalSubmit}
                        className={`flex-[2] text-white py-3.5 rounded-xl font-black shadow-lg shadow-blue-200 transition-all uppercase text-xs tracking-widest ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'}`}
                    >
                        {loading ? "Đang xử lý..." : "Xác nhận gửi hồ sơ"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT CON ---

const UploadBox = ({ title, onFileSelect, file }) => {
    const inputRef = useRef(null);
    return (
        <div className="flex flex-col h-full">
            <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-tighter ml-1">{title}</label>
            <div
                onClick={() => inputRef.current.click()}
                className={`flex-1 border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-all min-h-[120px] cursor-pointer ${file ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-400 shadow-sm'}`}
            >
                <input type="file" hidden ref={inputRef} onChange={(e) => onFileSelect(e.target.files[0])} accept="image/*" />
                {file ? (
                    <div className="text-center">
                        <CheckCircle2 className="text-emerald-500 mx-auto mb-2" size={24} />
                        <p className="text-[10px] font-bold text-emerald-600 truncate max-w-[120px]">{file.name}</p>
                    </div>
                ) : (
                    <>
                        <Upload className="text-slate-300 mb-2" size={20} />
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Tải ảnh lên</p>
                    </>
                )}
            </div>
        </div>
    );
};

const OCRInput = ({ label, value, onChange, name, isTextArea, type="text" }) => (
    <div>
        <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1.5 ml-1">{label}</label>
        <div className="relative group">
            {isTextArea ? (
                <textarea
                    name={name} value={value} onChange={onChange}
                    className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-semibold bg-slate-50 group-hover:bg-white focus:bg-white focus:border-blue-400 outline-none transition-all resize-none" rows="2"
                />
            ) : (
                <input
                    type={type} name={name} value={value} onChange={onChange}
                    className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-semibold bg-slate-50 group-hover:bg-white focus:bg-white focus:border-blue-400 outline-none transition-all"
                />
            )}
            <Edit3 size={12} className="absolute right-4 top-4 text-slate-300 group-hover:text-blue-400 transition-colors" />
        </div>
    </div>
);

const RefreshCw = ({ className, size }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
);

export default KYCUploadForm;