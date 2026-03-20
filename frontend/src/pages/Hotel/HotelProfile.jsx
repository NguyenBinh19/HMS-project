import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Thêm useNavigate
import {
    Save, Hotel, MapPin, Upload, X, Loader2,
    CheckCircle2, Info, Plus, Check, Edit3, ShieldCheck
} from 'lucide-react';
import { partnerService } from "@/services/partner.service.js";
import { toast } from "react-hot-toast";

const HotelProfileManager = () => {
    const navigate = useNavigate(); //
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [originalData, setOriginalData] = useState(null);
    const [showSuccessBanner, setShowSuccessBanner] = useState(false);

    const [formData, setFormData] = useState({
        hotelName: "", address: "", city: "", country: "",
        phone: "", email: "", description: "",
        amenitiesList: [],
        coverImageId: null
    });

    const [existingImages, setExistingImages] = useState([]);
    const [deleteImageIds, setDeleteImageIds] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [customAmenity, setCustomAmenity] = useState("");

    useEffect(() => { fetchDetail(); }, []);

    // 3. Hàm điều hướng sang KYC
    const handleGoToKYC = () => {
        navigate('/kyc/status', {
            state: {
                oldKycId: originalData?.verification?.id,
                partnerType: 'HOTEL'
            }
        });
    };

    const validateForm = () => {
        let newErrors = {};

        if (!formData.hotelName.trim()) newErrors.hotelName = "Tên khách sạn không được để trống";

        if (formData.phone && formData.phone.trim() !== "") {
            if (!/^\d{10,11}$/.test(formData.phone.replace(/\s/g, ""))) {
                newErrors.phone = "Số điện thoại không hợp lệ (10-11 số)";
            }
        }

        if (formData.email && formData.email.trim() !== "") {
            if (!/\S+@\S+\.\S+/.test(formData.email)) {
                newErrors.email = "Định dạng email không hợp lệ";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const response = await partnerService.getHotelProfileDetail();
            const res = response.result;
            setOriginalData(res);

            setFormData({
                hotelName: res.hotelName || "",
                address: res.address || "",
                city: res.city || "",
                country: res.country || "",
                phone: res.phone || "",
                email: res.email || "",
                description: res.description || "",
                amenitiesList: res.amenitiesList || [],
                coverImageId: res.coverImageId || null
            });

            const mappedImages = res.images?.map(img => ({
                id: img.imageId,
                url: img.imageUrl
            })) || [];

            setExistingImages(mappedImages);
            setDeleteImageIds([]);
        } catch (error) {
            toast.error("Lỗi tải dữ liệu");
        } finally { setLoading(false); }
    };

    const handleSave = async () => {
        if (!validateForm()) {
            toast.error("Vui lòng kiểm tra lại các trường thông tin!");
            return;
        }
        setSaving(true);
        try {
            const updateRequest = {
                ...formData,
                deleteImageIds: deleteImageIds
            };
            const response = await partnerService.updateHotelProfile(updateRequest, newImages);

            if (response.code === 1000) {
                toast.success("Cập nhật thành công!");
                setShowSuccessBanner(true);
                setTimeout(() => setShowSuccessBanner(false), 5000);
                setNewImages([]);
                fetchDetail();
            }
        } catch (error) {
            toast.error("Lỗi cập nhật");
        } finally { setSaving(false); }
    };

    // Helper functions (toggleAmenity, addCustomAmenity, handleDeleteExisting giữ nguyên logic của bạn)
    const toggleAmenity = (name) => {
        setFormData(prev => ({
            ...prev,
            amenitiesList: prev.amenitiesList.includes(name)
                ? prev.amenitiesList.filter(a => a !== name)
                : [...prev.amenitiesList, name]
        }));
    };

    const addCustomAmenity = () => {
        if (!customAmenity.trim()) return;
        if (!formData.amenitiesList.includes(customAmenity.trim())) {
            setFormData(prev => ({ ...prev, amenitiesList: [...prev.amenitiesList, customAmenity.trim()] }));
        }
        setCustomAmenity("");
    };

    const handleDeleteExisting = (imgId) => {
        setExistingImages(prev => prev.filter(img => img.id !== imgId));
        setDeleteImageIds(prev => [...prev, imgId]);
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600" size={40}/></div>;

    return (
        <div className="bg-[#F8FAFC] min-h-screen p-6 md:p-10 font-sans text-slate-900">
            <div className="max-w-6xl mx-auto space-y-6">

                {showSuccessBanner && (
                    <div className="mb-6 bg-emerald-500 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-center gap-3">
                            <Check className="bg-white/20 p-1 rounded-full" size={20} />
                            <p className="text-sm font-bold uppercase tracking-tight">Hồ sơ khách sạn đã được cập nhật!</p>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <Hotel size={32} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black uppercase tracking-tight text-slate-800">{formData.hotelName}</h1>
                            <p className="text-xs text-slate-400 font-bold flex items-center gap-1 mt-1">
                                <MapPin size={12}/> {formData.city}, {formData.country}
                            </p>
                        </div>
                    </div>
                    <button onClick={handleSave} disabled={saving} className="w-full md:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-all active:scale-95">
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Cập nhật thông tin
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Cột trái: Form */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                            <h3 className="text-blue-600 font-black uppercase text-[11px] tracking-[0.2em] mb-8 flex items-center gap-2"><Info size={16}/> Thông tin chung</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField
                                    label="Tên khách sạn"
                                    value={formData.hotelName}
                                    onChange={v => setFormData({...formData, hotelName: v})}
                                    error={errors.hotelName}
                                />
                                <InputField
                                    label="Số điện thoại"
                                    value={formData.phone}
                                    onChange={v => setFormData({...formData, phone: v})}
                                    error={errors.phone}
                                />
                                <InputField
                                    label="Email"
                                    value={formData.email}
                                    onChange={v => setFormData({...formData, email: v})}
                                    error={errors.email}
                                />
                                <InputField
                                    label="Thành phố"
                                    value={formData.city}
                                    onChange={v => setFormData({...formData, city: v})}
                                    error={errors.city}
                                />
                                <div className="md:col-span-2">
                                    <InputField label="Địa chỉ chi tiết" value={formData.address} onChange={v => setFormData({...formData, address: v})} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Mô tả khách sạn</label>
                                    <textarea className="w-full h-32 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 outline-none text-sm font-medium transition-all" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                            <h3 className="text-blue-600 font-black uppercase text-[11px] tracking-[0.2em] mb-6">Tiện ích</h3>
                            <div className="flex gap-2 mb-6">
                                <input type="text" placeholder="Thêm tiện ích..." className="flex-1 px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-blue-600" value={customAmenity} onChange={(e) => setCustomAmenity(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addCustomAmenity()} />
                                <button onClick={addCustomAmenity} className="bg-blue-600 text-white px-5 rounded-xl hover:bg-blue-700 transition-all"><Plus size={20}/></button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.amenitiesList.map(item => (
                                    <button key={item} onClick={() => toggleAmenity(item)} className="px-4 py-2 bg-blue-50 text-blue-600 border-2 border-blue-100 rounded-xl text-[11px] font-black uppercase flex items-center gap-2">
                                        {item} <X size={14}/>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Cột phải: Ảnh & KYC */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Hình ảnh */}
                        <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-black text-[11px] uppercase tracking-widest text-slate-800">Album ảnh ({existingImages.length})</h3>
                                <label className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center cursor-pointer hover:bg-blue-600 hover:text-white transition-all">
                                    <input type="file" multiple className="hidden" onChange={(e) => setNewImages([...newImages, ...Array.from(e.target.files)])} />
                                    <Upload size={18} />
                                </label>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {existingImages.map(img => (
                                    <div key={img.id} className={`relative aspect-square rounded-2xl overflow-hidden border-2 group ${formData.coverImageId === img.id ? 'border-blue-600' : 'border-slate-100'}`}>
                                        <img src={img.url} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                            <button onClick={() => setFormData({...formData, coverImageId: img.id})} className="text-[9px] bg-blue-600 text-white px-2 py-1 rounded font-black uppercase">Ảnh bìa</button>
                                            <button onClick={() => handleDeleteExisting(img.id)} className="bg-rose-500 text-white p-1.5 rounded-lg hover:scale-110 transition-transform"><X size={14}/></button>
                                        </div>
                                        {formData.coverImageId === img.id && <div className="absolute top-2 left-2 bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded">BÌA</div>}
                                    </div>
                                ))}
                                {newImages.map((file, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-blue-400">
                                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover opacity-60" />
                                        <button onClick={() => setNewImages(newImages.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-slate-900 text-white rounded-full p-0.5"><X size={10}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* PHẦN XÁC THỰC PHÁP LÝ (ĐÃ CẬP NHẬT) */}
                        <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 text-slate-800/30"><ShieldCheck size={100}/></div>
                            <div className="flex justify-between items-center mb-6 relative z-10">
                                <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                    <CheckCircle2 size={16}/> Xác thực pháp lý
                                </h3>
                                {/* NÚT ĐIỀU HƯỚNG KYC */}
                                <button
                                    onClick={handleGoToKYC}
                                    className="flex items-center gap-1.5 text-[9px] font-black text-white bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-all uppercase"
                                >
                                    <Edit3 size={12} /> Sửa KYC
                                </button>
                            </div>
                            <div className="space-y-4 relative z-10">
                                <ReadOnlyItem label="Mã số thuế" value={originalData?.verification?.taxCode} />
                                <ReadOnlyItem label="Số giấy phép KD" value={originalData?.verification?.businessLicenseNumber} />
                                <ReadOnlyItem label="Người đại diện" value={originalData?.verification?.representativeName} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-components
const InputField = ({ label, value, onChange, error }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {label}
        </label>
        <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            className={`w-full px-5 py-3.5 bg-slate-50 border-2 rounded-2xl outline-none transition-all font-bold text-sm text-slate-700 ${
                error ? 'border-rose-500 focus:border-rose-600' : 'border-slate-100 focus:border-blue-600'
            }`}
        />
        {error && <p className="text-[10px] text-rose-500 font-bold italic ml-2 tracking-tight">{error}</p>}
    </div>
);

const ReadOnlyItem = ({ label, value }) => (
    <div>
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-bold text-slate-200">{value || "---"}</p>
    </div>
);

export default HotelProfileManager;