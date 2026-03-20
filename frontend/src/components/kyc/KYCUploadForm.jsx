import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, Building, User, Edit3, CheckCircle2, Plus, X, RefreshCw } from 'lucide-react';
import { kycService } from '@/services/kyc.service.js';
import { useLocation } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
const KYCUploadForm = ({ onBack, onSubmit }) => {
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [isFetchingOldData, setIsFetchingOldData] = useState(false);

    const { oldKycId, partnerType: navPartnerType } = location.state || {};

    const getPartnerTypeFromToken = () => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) return "HOTEL";

            const decoded = jwtDecode(token);

            // 1. Lấy dữ liệu từ mọi trường có thể chứa Role
            const rawRoles = decoded.roles || decoded.authorities || decoded.scope || [];

            // 2. Chuẩn hóa về mảng String để dễ xử lý
            const rolesArray = Array.isArray(rawRoles)
                ? rawRoles.map(r => (typeof r === 'object' ? r.name : String(r)))
                : String(rawRoles).split(" ");

            if (rolesArray.some(role => role.includes("AGENCY"))) {
                return "AGENCY";
            }

            if (rolesArray.some(role => role.includes("HOTEL"))) {
                return "HOTEL";
            }

            return "HOTEL";
        } catch (err) {
            console.error("Lỗi Decode Token trong KYC Form:", err);
            return "HOTEL";
        }
    };
    const [formData, setFormData] = useState({
        partnerType: getPartnerTypeFromToken(),
        legalName: "",
        taxCode: "",
        businessAddress: "",
        representativeName: "",
        representativeCICNumber: "",
        businessLicenseNumber: "",
        representativeCICDate: "",
        representativeCICPlace: "",
    });

    const [files, setFiles] = useState({ gpkd: [], front: null, back: null });
    const [oldUrls, setOldUrls] = useState({ gpkd: [], front: null, back: null });

    const isUpdateMode = !!oldKycId;

    useEffect(() => {
        if (oldKycId) fetchOldKycData(oldKycId);
    }, [oldKycId]);

    // Hàm bổ trợ: Chuyển đổi URL ảnh thành đối tượng File
    const urlToFile = async (url, filename) => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const blob = await response.blob();
            // Lấy extension từ blob type hoặc giữ mặc định .jpg
            const extension = blob.type.split('/')[1] || 'jpg';
            return new File([blob], `${filename}.${extension}`, { type: blob.type });
        } catch (error) {
            console.error("Lỗi chuyển đổi URL thành File:", error);
            return null;
        }
    };

    const fetchOldKycData = async (id) => {
        setIsFetchingOldData(true);
        try {
            const res = await kycService.getVerificationDetail(id);
            const data = res.result || res;
            setFormData({
                partnerType: data.partnerType || "HOTEL",
                legalName: data.legalName || "",
                taxCode: data.taxCode || "",
                businessAddress: data.businessAddress || "",
                representativeName: data.representativeName || "",
                representativeCICNumber: data.representativeCICNumber || "",
                businessLicenseNumber: data.businessLicenseNumber || "",
                representativeCICDate: data.representativeCICDate ? data.representativeCICDate.split('T')[0] : "",
                representativeCICPlace: data.representativeCICPlace || "",
            });

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

    // 1. Chỉ cho phép nhập số
    const onlyNumbers = (val) => val.replace(/[^0-9]/g, "");

    // 2. Format Mã số thuế (Chặn max 13 số, tự thêm dấu gạch nếu là mã đơn vị trực thuộc)
    const formatTaxCode = (val) => {
        const digits = onlyNumbers(val).slice(0, 13);
        if (digits.length > 10) {
            return `${digits.slice(0, 10)}-${digits.slice(10, 13)}`;
        }
        return digits;
    };

    // 3. Format CCCD (Max 12 số)
    const formatCIC = (val) => onlyNumbers(val).slice(0, 12);

    const handleFinalSubmit = async () => {
        if (!formData.legalName || !formData.taxCode) {
            alert("Vui lòng điền các thông tin bắt buộc!");
            return;
        }
        const rawTaxCode = formData.taxCode.replace("-", "");

        if (rawTaxCode.length !== 10 && rawTaxCode.length !== 13) {
            alert("Mã số thuế phải có 10 hoặc 13 số!");
            return;
        }

        if (formData.representativeCICNumber.length !== 12 && formData.representativeCICNumber.length !== 9) {
            alert("Số CCCD phải có 12 số (hoặc 9 số với CMND cũ)!");
            return;
        }

        setLoading(true);
        const finalFiles = [];
        const finalDocTypes = [];

        try {
            // --- 1. Xử lý GPKD ---
            // Ảnh cũ (nếu còn trong list) -> Convert sang File
            for (let i = 0; i < oldUrls.gpkd.length; i++) {
                const file = await urlToFile(oldUrls.gpkd[i], `old_gpkd_${i}`);
                if (file) {
                    finalFiles.push(file);
                    finalDocTypes.push("BUSINESS_LICENSE");
                }
            }
            // Ảnh mới
            files.gpkd.forEach(file => {
                finalFiles.push(file);
                finalDocTypes.push("BUSINESS_LICENSE");
            });

            // --- 2. Xử lý CCCD Mặt trước ---
            if (files.front) {
                finalFiles.push(files.front);
                finalDocTypes.push("REPRESENTATIVE_CIC_FRONT");
            } else if (oldUrls.front) {
                const file = await urlToFile(oldUrls.front, "old_front");
                if (file) {
                    finalFiles.push(file);
                    finalDocTypes.push("REPRESENTATIVE_CIC_FRONT");
                }
            }

            // --- 3. Xử lý CCCD Mặt sau ---
            if (files.back) {
                finalFiles.push(files.back);
                finalDocTypes.push("REPRESENTATIVE_CIC_BACK");
            } else if (oldUrls.back) {
                const file = await urlToFile(oldUrls.back, "old_back");
                if (file) {
                    finalFiles.push(file);
                    finalDocTypes.push("REPRESENTATIVE_CIC_BACK");
                }
            }

            const submitData = {
                ...formData,
                documentTypes: finalDocTypes,
            };

            await onSubmit({ data: submitData, files: finalFiles });
        } catch (error) {
            console.error("Lỗi trong quá trình xử lý gửi hồ sơ:", error);
            alert("Có lỗi xảy ra khi xử lý tệp tin.");
        } finally {
            setLoading(false);
        }
    };


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
            <div className="space-y-6">
                
                <div className="mb-6">
                    <label className="text-xs font-bold text-slate-400 uppercase">Loại đối tác</label>
                    <div className="mt-2 px-4 py-3 bg-slate-100 rounded-xl font-bold text-blue-600 text-sm">
                        {formData.partnerType === "HOTEL" ? "KHÁCH SẠN" : "ĐẠI LÝ"}
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">1. Giấy phép kinh doanh</label>
                    <div className="grid grid-cols-2 gap-3">
                        {oldUrls.gpkd.map((url, idx) => (
                            <div key={`old-${idx}`} className="relative aspect-video rounded-xl overflow-hidden border-2 border-slate-100 group">
                                <img src={url} className="w-full h-full object-cover" alt="old-gpkd" />
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                    <span className="text-[8px] bg-white/90 text-slate-800 px-2 py-1 rounded font-bold uppercase tracking-tighter">Ảnh đã lưu</span>
                                </div>
                                <button type="button" onClick={() => setOldUrls(prev => ({ ...prev, gpkd: prev.gpkd.filter((_, i) => i !== idx) }))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                            </div>
                        ))}
                        {files.gpkd.map((file, idx) => (
                            <div key={`new-${idx}`} className="relative aspect-video rounded-xl overflow-hidden border-2 border-emerald-400">
                                <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="new-gpkd" />
                                <button type="button" onClick={() => setFiles(p => ({ ...p, gpkd: p.gpkd.filter((_, i) => i !== idx) }))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X size={10} /></button>
                            </div>
                        ))}
                        <label className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center hover:bg-blue-50 cursor-pointer min-h-[100px]">
                            <input type="file" hidden multiple onChange={(e) => setFiles(prev => ({ ...prev, gpkd: [...prev.gpkd, ...Array.from(e.target.files)] }))} accept="image/*" />
                            <Plus size={20} className="text-slate-400" /><span className="text-[10px] font-bold text-slate-500 mt-1 uppercase">Thêm mới</span>
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <UploadBox title="2. CCCD mặt trước" file={files.front} oldUrl={oldUrls.front} onFileSelect={(file) => { setFiles(p => ({ ...p, front: file })); setOldUrls(p => ({ ...p, front: null })); }} />
                    <UploadBox title="3. CCCD mặt sau" file={files.back} oldUrl={oldUrls.back} onFileSelect={(file) => { setFiles(p => ({ ...p, back: file })); setOldUrls(p => ({ ...p, back: null })); }} />
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="flex items-center gap-2 font-bold text-slate-800 uppercase text-sm tracking-widest"><Building size={16} className="text-blue-600" /> Thông tin pháp lý</h3>
                <div className="space-y-3">
                    <OCRInput label="Tên Doanh nghiệp" name="legalName" value={formData.legalName} onChange={(e) => setFormData(p => ({ ...p, legalName: e.target.value }))} />
                    <div className="grid grid-cols-2 gap-3">
                        <OCRInput
                            label="Mã số thuế"
                            value={formData.taxCode}
                            onChange={(e) => setFormData(p => ({ ...p, taxCode: formatTaxCode(e.target.value) }))}
                        />
                        <OCRInput
                            label="Số GPKD"
                            value={formData.businessLicenseNumber}
                            onChange={(e) => setFormData(p => ({ ...p, businessLicenseNumber: onlyNumbers(e.target.value).slice(0, 10) }))}
                        />
                    </div>
                    <OCRInput label="Địa chỉ trụ sở" name="businessAddress" value={formData.businessAddress} isTextArea onChange={(e) => setFormData(p => ({ ...p, businessAddress: e.target.value }))} />
                </div>

                <h3 className="flex items-center gap-2 font-bold text-slate-800 uppercase text-sm tracking-widest pt-4"><User size={16} className="text-blue-600" /> Người đại diện</h3>
                <div className="space-y-3">
                    <OCRInput label="Họ và tên" name="representativeName" value={formData.representativeName} onChange={(e) => setFormData(p => ({ ...p, representativeName: e.target.value }))} />
                    <OCRInput
                        label="Số CCCD"
                        value={formData.representativeCICNumber}
                        onChange={(e) => setFormData(p => ({ ...p, representativeCICNumber: formatCIC(e.target.value) }))}
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <OCRInput label="Ngày cấp" name="representativeCICDate" type="date" value={formData.representativeCICDate} onChange={(e) => setFormData(p => ({ ...p, representativeCICDate: e.target.value }))} />
                        <OCRInput label="Nơi cấp" name="representativeCICPlace" value={formData.representativeCICPlace} onChange={(e) => setFormData(p => ({ ...p, representativeCICPlace: e.target.value }))} />
                    </div>
                </div>

                <div className="flex gap-4 pt-6">
                    <button type="button" onClick={onBack} className="flex-1 py-3.5 font-bold text-slate-500 border-2 rounded-xl hover:bg-slate-50 uppercase text-xs">Quay lại</button>
                    <button type="button" onClick={handleFinalSubmit} disabled={loading} className={`flex-[2] text-white py-3.5 rounded-xl font-black shadow-lg uppercase text-xs tracking-widest ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                        {loading ? "Đang xử lý..." : "Xác nhận hồ sơ"}
                    </button>
                </div>
            </div>
        </div>
    );
};

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
                        <img src={previewSrc} className="w-full h-full object-cover" alt="preview" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white">
                            <Camera size={24} /><p className="text-[10px] font-black mt-2">THAY ĐỔI ẢNH</p>
                        </div>
                        {!file && oldUrl && <div className="absolute top-2 left-2 bg-blue-600 text-[8px] text-white px-2 py-0.5 rounded font-black shadow-lg">ẢNH ĐÃ LƯU</div>}
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