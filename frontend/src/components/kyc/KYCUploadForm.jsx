import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, Building, User, Edit3, CheckCircle2, Plus, X, Info, RefreshCw } from 'lucide-react';
import { kycService } from '@/services/kyc.service.js';
import { useLocation } from 'react-router-dom';

const KYCUploadForm = ({ onBack, onSubmit }) => {
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [isFetchingOldData, setIsFetchingOldData] = useState(false);

    // Lấy thông tin điều hướng từ Profile gửi sang
    const {
        agencyId: navAgencyId,
        hotelId: navHotelId,
        oldKycId,
        partnerType: navPartnerType
    } = location.state || {};

    const [formData, setFormData] = useState({
        partnerType: navPartnerType || "HOTEL",
        legalName: "",
        taxCode: "",
        businessAddress: "",
        representativeName: "",
        representativeCICNumber: "",
        businessLicenseNumber: "",
        representativeCICDate: "",
        representativeCICPlace: "",
        agencyId: navAgencyId || null,
        hotelId: navHotelId || null,
        status: ""
    });

    const [files, setFiles] = useState({ gpkd: [], front: null, back: null });
    const [oldUrls, setOldUrls] = useState({ gpkd: [], front: null, back: null });

    useEffect(() => {
        if (oldKycId) {
            fetchOldKycData(oldKycId);
        }
    }, [oldKycId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const fetchOldKycData = async (id) => {
        setIsFetchingOldData(true);
        try {
            const res = await kycService.getVerificationDetail(id);
            const data = res.result || res;

            setFormData(prev => ({
                ...prev,
                partnerType: data.partnerType || prev.partnerType,
                legalName: data.legalName || "",
                taxCode: data.taxCode || "",
                businessAddress: data.businessAddress || "",
                representativeName: data.representativeName || "",
                representativeCICNumber: data.representativeCICNumber || "",
                businessLicenseNumber: data.businessLicenseNumber || "",
                representativeCICDate: data.representativeCICDate ? data.representativeCICDate.split('T')[0] : "",
                representativeCICPlace: data.representativeCICPlace || "",
                status: data.status || ""
            }));

            if (data.documents) {
                setOldUrls({
                    gpkd: data.documents.filter(d => d.documentType === "BUSINESS_LICENSE").map(d => d.fileUrl),
                    front: data.documents.find(d => d.documentType === "REPRESENTATIVE_CIC_FRONT")?.fileUrl,
                    back: data.documents.find(d => d.documentType === "REPRESENTATIVE_CIC_BACK")?.fileUrl,
                });
            }
        } catch (error) {
            console.error("Lỗi lấy dữ liệu:", error);
        } finally {
            setIsFetchingOldData(false);
        }
    };

    const handleFinalSubmit = () => {
        if (!formData.legalName || !formData.taxCode) {
            alert("Vui lòng điền các thông tin bắt buộc!");
            return;
        }

        const finalFiles = [];
        const finalDocTypes = [];

        files.gpkd.forEach(file => { finalFiles.push(file); finalDocTypes.push("BUSINESS_LICENSE"); });
        if (files.front) { finalFiles.push(files.front); finalDocTypes.push("REPRESENTATIVE_CIC_FRONT"); }
        if (files.back) { finalFiles.push(files.back); finalDocTypes.push("REPRESENTATIVE_CIC_BACK"); }

        const submitData = {
            ...formData,
            documentTypes: finalDocTypes,
            existingDocuments: [
                ...oldUrls.gpkd,
                oldUrls.front,
                oldUrls.back
            ].filter(Boolean)
        };

        setLoading(true);
        onSubmit({ data: submitData, files: finalFiles });
    };

    const isUpdateMode = formData.status !== 'VERIFIED' && (formData.agencyId || formData.hotelId);

    if (isFetchingOldData) {
        return (
            <div className="p-20 text-center flex flex-col items-center gap-4">
                <RefreshCw className="animate-spin text-blue-600" size={40} />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Đang đồng bộ dữ liệu hồ sơ...</p>
            </div>
        );
    }

    return (
        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white max-h-[90vh] overflow-y-auto">
            {/* CỘT TRÁI: TÀI LIỆU */}
            <div className="space-y-6">
                {/* HIỆN CHẾ ĐỘ CẬP NHẬT HOẶC CHỌN LOẠI ĐỐI TÁC */}
                {isUpdateMode ? (
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3 mb-6">
                        <Info className="text-amber-500 shrink-0" size={20} />
                        <div>
                            <p className="text-xs font-black text-amber-800 uppercase tracking-tight">Chế độ cập nhật: {formData.partnerType}</p>
                            <p className="text-[11px] text-amber-700 mt-1 font-medium italic">
                                Hồ sơ ID: {formData.agencyId || formData.hotelId} đang chờ cập nhật.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="mb-6">
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 ml-1">Loại đối tác xác thực:</label>
                        <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl">
                            {['HOTEL', 'AGENCY'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, partnerType: type }))}
                                    className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${formData.partnerType === type ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                                >
                                    {type === 'HOTEL' ? 'KHÁCH SẠN' : 'ĐẠI LÝ'}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">1. Giấy phép kinh doanh</label>
                    <div className="grid grid-cols-2 gap-3">
                        {oldUrls.gpkd.map((url, idx) => (
                            <div key={`old-${idx}`} className="relative aspect-video rounded-xl overflow-hidden border-2 border-slate-100 group">
                                <img src={url} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                    <span className="text-[8px] bg-white/90 text-slate-800 px-2 py-1 rounded font-bold uppercase tracking-tighter">Ảnh đã lưu</span>
                                </div>
                                <button type="button" onClick={() => setOldUrls(prev => ({...prev, gpkd: prev.gpkd.filter((_, i) => i !== idx)}))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={10}/></button>
                            </div>
                        ))}
                        {files.gpkd.map((file, idx) => (
                            <div key={`new-${idx}`} className="relative aspect-video rounded-xl overflow-hidden border-2 border-emerald-400">
                                <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                <button type="button" onClick={() => setFiles(p => ({...p, gpkd: p.gpkd.filter((_, i) => i !== idx)}))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X size={10}/></button>
                            </div>
                        ))}
                        <label className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center hover:bg-blue-50 cursor-pointer min-h-[100px]">
                            <input type="file" hidden multiple onChange={(e) => setFiles(prev => ({ ...prev, gpkd: [...prev.gpkd, ...Array.from(e.target.files)] }))} accept="image/*" />
                            <Plus size={20} className="text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase">Thêm ảnh mới</span>
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <UploadBox title="2. CCCD mặt trước" file={files.front} oldUrl={oldUrls.front} onFileSelect={(file) => setFiles(p => ({...p, front: file}))} />
                    <UploadBox title="3. CCCD mặt sau" file={files.back} oldUrl={oldUrls.back} onFileSelect={(file) => setFiles(p => ({...p, back: file}))} />
                </div>
            </div>

            {/* CỘT PHẢI: FORM */}
            <div className="space-y-6">
                <h3 className="flex items-center gap-2 font-bold text-slate-800 uppercase text-sm tracking-widest"><Building size={16} className="text-blue-600" /> Thông tin pháp lý</h3>
                <div className="space-y-3">
                    <OCRInput label="Tên Doanh nghiệp" name="legalName" value={formData.legalName} onChange={handleInputChange} />
                    <div className="grid grid-cols-2 gap-3">
                        <OCRInput label="Mã số thuế" name="taxCode" value={formData.taxCode} onChange={handleInputChange} />
                        <OCRInput label="Số GPKD" name="businessLicenseNumber" value={formData.businessLicenseNumber} onChange={handleInputChange} />
                    </div>
                    <OCRInput label="Địa chỉ trụ sở" name="businessAddress" value={formData.businessAddress} onChange={handleInputChange} isTextArea />
                </div>

                <h3 className="flex items-center gap-2 font-bold text-slate-800 uppercase text-sm tracking-widest pt-4"><User size={16} className="text-blue-600" /> Người đại diện</h3>
                <div className="space-y-3">
                    <OCRInput label="Họ và tên" name="representativeName" value={formData.representativeName} onChange={handleInputChange} />
                    <OCRInput label="Số CCCD" name="representativeCICNumber" value={formData.representativeCICNumber} onChange={handleInputChange} />
                    <div className="grid grid-cols-2 gap-3">
                        <OCRInput label="Ngày cấp" name="representativeCICDate" type="date" value={formData.representativeCICDate} onChange={handleInputChange} />
                        <OCRInput label="Nơi cấp" name="representativeCICPlace" value={formData.representativeCICPlace} onChange={handleInputChange} />
                    </div>
                </div>

                <div className="flex gap-4 pt-6">
                    <button type="button" onClick={onBack} className="flex-1 py-3.5 font-bold text-slate-500 border-2 rounded-xl hover:bg-slate-50 uppercase text-xs">Quay lại</button>
                    <button type="button" onClick={handleFinalSubmit} disabled={loading} className={`flex-[2] text-white py-3.5 rounded-xl font-black shadow-lg uppercase text-xs tracking-widest ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'}`}>
                        {loading ? "Đang xử lý..." : "Xác nhận hồ sơ"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT CON (Giữ nguyên logic của bạn) ---
const UploadBox = ({ title, onFileSelect, file, oldUrl }) => {
    const inputRef = useRef(null);
    const previewSrc = file ? URL.createObjectURL(file) : oldUrl;
    return (
        <div className="flex flex-col h-full">
            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase">{title}</label>
            <div onClick={() => inputRef.current.click()} className={`flex-1 border-2 border-dashed rounded-xl overflow-hidden flex flex-col items-center justify-center min-h-[140px] cursor-pointer ${previewSrc ? 'border-emerald-400 bg-white' : 'border-slate-200 bg-slate-50 hover:border-blue-400'}`}>
                <input type="file" hidden ref={inputRef} onChange={(e) => onFileSelect(e.target.files[0])} accept="image/*" />
                {previewSrc ? (
                    <div className="relative w-full h-full group">
                        <img src={previewSrc} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white">
                            <Camera size={24} />
                            <p className="text-[10px] font-black mt-2">THAY ĐỔI ẢNH</p>
                        </div>
                        {!file && oldUrl && <div className="absolute top-2 left-2 bg-blue-600 text-[8px] text-white px-2 py-0.5 rounded font-black shadow-lg">ẢNH ĐÃ LƯU</div>}
                        {file && <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1"><CheckCircle2 size={12} /></div>}
                    </div>
                ) : (
                    <div className="text-center"><Upload className="text-slate-300 mx-auto mb-2" size={24} /><p className="text-[10px] font-bold text-slate-400 uppercase">Tải ảnh lên</p></div>
                )}
            </div>
        </div>
    );
};

const OCRInput = ({ label, value, onChange, name, isTextArea, type = "text" }) => (
    <div>
        <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1.5">{label}</label>
        <div className="relative group">
            {isTextArea ? (
                <textarea name={name} value={value} onChange={onChange} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-semibold focus:border-blue-400 outline-none bg-slate-50 resize-none" rows="2" />
            ) : (
                <input type={type} name={name} value={value} onChange={onChange} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-semibold focus:border-blue-400 outline-none bg-slate-50" />
            )}
            <Edit3 size={12} className="absolute right-4 top-4 text-slate-300 group-hover:text-blue-400 pointer-events-none" />
        </div>
    </div>
);

export default KYCUploadForm;