import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Building2, Info, Phone, Mail, MapPin,
    Globe, CheckCircle2, Loader2, Smartphone,
    CreditCard, Wallet, ArrowUpRight, Check,
    ShieldCheck, Edit3
} from 'lucide-react';
import { agencyService } from "@/services/agency.service.js";
import { partnerService } from "@/services/partner.service.js";
import { toast } from "react-hot-toast";

const AgencyProfile = () => {
    const navigate = useNavigate();
    const AGENCY_ID = 1; // ID cứng hoặc lấy từ Auth Context

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSuccessBanner, setShowSuccessBanner] = useState(false);
    const [originalData, setOriginalData] = useState(null);

    const [profile, setProfile] = useState({
        agencyName: "",
        email: "",
        hotline: "",
        contactPhone: "",
        address: "",
        taxCode: "",
        legalName: "",
        representativeName: "",
        businessLicenseNumber: "",
        creditLimit: 0,
        currentCredit: 0
    });

    const fetchAgencyDetail = async () => {
        setLoading(true);
        try {
            const response = await partnerService.getAgencyPartnerDetail(AGENCY_ID);
            const res = response.result;
            setOriginalData(res);

            setProfile({
                agencyName: res.agencyName || "",
                email: res.email || "",
                hotline: res.hotline || "",
                contactPhone: res.contactPhone || "",
                address: res.address || "",
                taxCode: res.verification?.taxCode || "Chưa cập nhật",
                legalName: res.verification?.legalName || "Chưa cập nhật",
                representativeName: res.verification?.representativeName || "Chưa cập nhật",
                businessLicenseNumber: res.verification?.businessLicenseNumber || "Chưa cập nhật",
                creditLimit: res.creditLimit || 0,
                currentCredit: res.currentCredit || 0
            });
        } catch (error) {
            toast.error("Không thể tải thông tin đại lý");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAgencyDetail(); }, []);

    const handleGoToKYC = () => {
        // Gửi kèm agencyId và kycId sang màn hình KYC
        navigate('/kyc/status', {
            state: {
                agencyId: AGENCY_ID,
                oldKycId: originalData?.verification?.id,
                partnerType: 'AGENCY'
            }
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updateBody = {
                agencyName: profile.agencyName?.trim(),
                email: profile.email?.trim(),
                hotline: profile.hotline?.trim(),
                contactPhone: profile.contactPhone?.trim()
            };
            const response = await agencyService.upAgencyProfileDetail(AGENCY_ID, updateBody);
            if (response.code === 1000) {
                toast.success("Cập nhật thành công!");
                setShowSuccessBanner(true);
                setTimeout(() => setShowSuccessBanner(false), 5000);
            }
        } catch (error) {
            toast.error("Lưu thất bại!");
        } finally { setSaving(false); }
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
            <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Đang tải hồ sơ...</p>
        </div>
    );

    return (
        <div className="bg-[#F8FAFC] min-h-screen p-6 md:p-10">
            <div className="max-w-5xl mx-auto">
                {showSuccessBanner && (
                    <div className="mb-6 bg-emerald-500 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between animate-in slide-in-from-top-4">
                        <div className="flex items-center gap-3">
                            <Check className="bg-white/20 p-1 rounded-full" size={20} />
                            <p className="text-sm font-bold uppercase tracking-tight">Hồ sơ đã được lưu thành công!</p>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-black text-slate-900 uppercase">Hồ sơ đại lý</h1>
                    <button onClick={handleSave} disabled={saving} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[11px] tracking-widest shadow-xl hover:bg-blue-700 transition-all flex items-center gap-2">
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                        LƯU THAY ĐỔI
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* THÔNG TIN PHÁP LÝ */}
                        <section className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5"><Building2 size={100}/></div>
                            <div className="flex justify-between items-center mb-8 relative z-10">
                                <h2 className="text-xs font-black text-slate-400 tracking-[0.2em] uppercase flex items-center gap-2">
                                    <ShieldCheck size={18} className="text-emerald-500" /> Xác minh pháp lý
                                </h2>
                                <button onClick={handleGoToKYC} className="flex items-center gap-2 text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all uppercase">
                                    <Edit3 size={14} /> Cập nhật KYC
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                <ReadOnlyField label="Tên pháp nhân" value={profile.legalName} />
                                <ReadOnlyField label="Mã số thuế" value={profile.taxCode} />
                                <ReadOnlyField label="Số GPKD" value={profile.businessLicenseNumber} />
                                <ReadOnlyField label="Người đại diện" value={profile.representativeName} />
                            </div>
                        </section>

                        {/* THÔNG TIN LIÊN HỆ */}
                        <section className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm">
                            <h2 className="text-xs font-black text-blue-600 tracking-[0.2em] uppercase mb-8 flex items-center gap-2"><Globe size={18} /> Liên hệ & Thương hiệu</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <EditableField label="Tên hiển thị" value={profile.agencyName} onChange={(v) => setProfile({...profile, agencyName: v})} />
                                <EditableField label="Email" value={profile.email} icon={<Mail size={16} />} onChange={(v) => setProfile({...profile, email: v})} />
                                <EditableField label="Hotline" value={profile.hotline} icon={<Phone size={16} />} onChange={(v) => setProfile({...profile, hotline: v})} />
                                <EditableField label="SĐT Liên hệ" value={profile.contactPhone} icon={<Smartphone size={16} />} onChange={(v) => setProfile({...profile, contactPhone: v})} />
                            </div>
                        </section>
                    </div>

                    {/* TÀI CHÍNH */}
                    <div className="space-y-6">
                        <section className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute -bottom-4 -right-4 opacity-10"><Wallet size={120}/></div>
                            <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-8 flex items-center gap-2"><CreditCard size={18} /> Tài chính</h2>
                            <div className="space-y-8">
                                <div>
                                    <p className="text-slate-400 text-[10px] font-black uppercase mb-1">Hạn mức</p>
                                    <p className="text-2xl font-black italic">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(profile.creditLimit)}</p>
                                </div>
                                <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-slate-400 text-[10px] font-black uppercase">Dư nợ</p>
                                        <ArrowUpRight size={14} className="text-red-400" />
                                    </div>
                                    <p className="text-xl font-black text-red-400">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(profile.currentCredit)}</p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Components con
const ReadOnlyField = ({ label, value }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
        <div className="bg-slate-50 border border-slate-100 px-4 py-3.5 rounded-2xl text-slate-600 font-bold text-sm truncate">
            {value}
        </div>
    </div>
);

const EditableField = ({ label, value, onChange, icon }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{label}</label>
        <div className="relative">
            {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
            <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={`w-full ${icon ? 'pl-12' : 'pl-4'} pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-600 outline-none transition-all text-sm font-bold text-slate-700 shadow-sm`} />
        </div>
    </div>
);

export default AgencyProfile;