import React, { useState, useEffect } from 'react';
import {
    Building2, Info, Phone, Mail, MapPin,
    Globe, CheckCircle2, AlertCircle, Loader2, Smartphone,
    CreditCard, Wallet, ArrowUpRight, Check
} from 'lucide-react';
import { agencyService } from "@/services/agency.service.js";
import { partnerService } from "@/services/partner.service.js";
import { toast } from "react-hot-toast";

const AgencyProfile = () => {
    const AGENCY_ID = 1;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSuccessBanner, setShowSuccessBanner] = useState(false); // State cho thông báo banner
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
                taxCode: res.verification?.taxCode || "N/A",
                legalName: res.verification?.legalName || "N/A",
                representativeName: res.verification?.representativeName || "N/A",
                businessLicenseNumber: res.verification?.businessLicenseNumber || "N/A",
                creditLimit: res.creditLimit || 0,
                currentCredit: res.currentCredit || 0
            });
        } catch (error) {
            toast.error("Không thể tải thông tin đại lý");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgencyDetail();
    }, []);

    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updateBody = {
                agencyName: profile.agencyName?.toString().trim() || originalData.agencyName,
                email: profile.email?.toString().trim() || originalData.email,
                hotline: profile.hotline?.toString().trim() || originalData.hotline,
                contactPhone: profile.contactPhone?.toString().trim() || originalData.contactPhone
            };

            const response = await agencyService.upAgencyProfileDetail(AGENCY_ID, updateBody);

            if (response.code === 1000) {
                // 1. Thông báo qua Toast
                toast.success("Cập nhật thông tin thành công!");

                // 2. Hiện Banner thông báo phía trên cùng
                setShowSuccessBanner(true);
                setTimeout(() => setShowSuccessBanner(false), 5000); // Tự ẩn sau 5s

                const updated = response.result;
                setOriginalData(updated);
                setProfile(prev => ({
                    ...prev,
                    agencyName: updated.agencyName,
                    email: updated.email,
                    hotline: updated.hotline,
                    contactPhone: updated.contactPhone,
                    creditLimit: updated.creditLimit,
                    currentCredit: updated.currentCredit
                }));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Lưu thất bại. Vui lòng thử lại!");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
            <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Đang truy xuất dữ liệu...</p>
        </div>
    );

    return (
        <div className="bg-[#F8FAFC] min-h-screen p-6 md:p-10 font-sans">
            <div className="max-w-5xl mx-auto">

                {/* SUCCESS BANNER */}
                {showSuccessBanner && (
                    <div className="mb-6 bg-emerald-500 text-white p-4 rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full">
                                <Check size={20} />
                            </div>
                            <div>
                                <p className="font-black text-xs uppercase tracking-widest">Hệ thống thông báo</p>
                                <p className="text-sm font-medium opacity-90">Hồ sơ đại lý đã được cập nhật thành công vào hệ thống.</p>
                            </div>
                        </div>
                        <button onClick={() => setShowSuccessBanner(false)} className="text-white/60 hover:text-white font-bold text-xs uppercase">Đóng</button>
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Hồ sơ đại lý</h1>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`${
                            saving ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'
                        } text-white px-8 py-4 rounded-2xl font-black text-[11px] tracking-[0.2em] shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3 uppercase`}
                    >
                        {saving ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Đang xử lý...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={16} />
                                <span>Lưu thay đổi</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* KHỐI 1: THÔNG TIN PHÁP LÝ */}
                        <section className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><Building2 size={80}/></div>
                            <h2 className="text-xs font-black text-slate-400 tracking-[0.2em] uppercase mb-8 flex items-center gap-2">
                                <ShieldCheck size={18} className="text-emerald-500" /> Xác minh pháp lý
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <ReadOnlyField label="Tên pháp nhân" value={profile.legalName} />
                                <ReadOnlyField label="Mã số thuế" value={profile.taxCode} />
                                <ReadOnlyField label="Giấy phép kinh doanh" value={profile.businessLicenseNumber} />
                                <ReadOnlyField label="Đại diện pháp luật" value={profile.representativeName} />
                            </div>
                        </section>

                        {/* KHỐI 2: THÔNG TIN VẬN HÀNH */}
                        <section className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm">
                            <h2 className="text-xs font-black text-blue-600 tracking-[0.2em] uppercase mb-8 flex items-center gap-2">
                                <Globe size={18} /> Thông tin liên hệ & Thương hiệu
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <EditableField
                                    label="Tên thương hiệu hiển thị"
                                    value={profile.agencyName}
                                    onChange={(v) => setProfile({...profile, agencyName: v})}
                                />
                                <EditableField
                                    label="Email nhận thông báo"
                                    value={profile.email}
                                    icon={<Mail size={16} />}
                                    onChange={(v) => setProfile({...profile, email: v})}
                                />
                                <EditableField
                                    label="Hotline (Tổng đài)"
                                    value={profile.hotline}
                                    icon={<Phone size={16} />}
                                    onChange={(v) => setProfile({...profile, hotline: v})}
                                />
                                <EditableField
                                    label="Số điện thoại liên hệ"
                                    value={profile.contactPhone}
                                    icon={<Smartphone size={16} />}
                                    onChange={(v) => setProfile({...profile, contactPhone: v})}
                                />
                                <div className="md:col-span-2">
                                    <ReadOnlyField label="Địa chỉ trụ sở" value={profile.address} icon={<MapPin size={16}/>} />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Cột phải: Tài chính & Hạn mức */}
                    <div className="space-y-8">
                        <section className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute -bottom-4 -right-4 opacity-10"><Wallet size={120}/></div>
                            <h2 className="text-[10px] font-black text-blue-400 tracking-[0.2em] uppercase mb-8 flex items-center gap-2">
                                <CreditCard size={18} /> Quản lý hạn mức
                            </h2>

                            <div className="space-y-10">
                                <div>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Hạn mức tối đa</p>
                                    <p className="text-2xl font-black italic">{formatVND(profile.creditLimit)}</p>
                                </div>

                                <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="flex justify-between items-end mb-4">
                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Dư nợ hiện tại</p>
                                        <ArrowUpRight size={16} className="text-red-400" />
                                    </div>
                                    <p className="text-2xl font-black text-red-400">{formatVND(profile.currentCredit)}</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                                        <span className="text-slate-400">Đã sử dụng</span>
                                        <span className="text-blue-400">
                                            {profile.creditLimit > 0 ? ((profile.currentCredit / profile.creditLimit) * 100).toFixed(1) : 0}%
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 transition-all duration-1000"
                                            style={{ width: `${profile.creditLimit > 0 ? (profile.currentCredit / profile.creditLimit) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="p-6 bg-amber-50 rounded-[24px] border border-amber-100 flex items-start gap-4">
                            <Info size={20} className="text-amber-600 mt-1 shrink-0" />
                            <p className="text-xs font-bold text-amber-800 leading-relaxed italic">
                                Lưu ý: Hạn mức tín dụng chỉ được thay đổi bởi quản trị viên hệ thống thông qua yêu cầu xét duyệt tài chính.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

// --- Sub-components ---
const ReadOnlyField = ({ label, value, icon }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-3.5 rounded-2xl text-slate-600 font-bold text-sm">
            {icon && <span className="text-slate-400">{icon}</span>}
            <span className="truncate">{value || "---"}</span>
        </div>
    </div>
);

const EditableField = ({ label, value, onChange, icon, placeholder }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{label}</label>
        <div className="relative group">
            {icon && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    {icon}
                </div>
            )}
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full ${icon ? 'pl-12' : 'pl-4'} pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-sm font-bold text-slate-700 shadow-sm`}
            />
        </div>
    </div>
);

const ShieldCheck = ({ size, className }) => (
    <CheckCircle2 size={size} className={className} />
);

export default AgencyProfile;