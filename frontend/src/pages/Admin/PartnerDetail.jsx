import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
    ArrowLeft, Building2, CreditCard, FileCheck,
    History, Info, MapPin, Phone, Mail, User,
    Star, Globe, Loader2, CreditCard as CardIcon,
    ShieldCheck, HotelIcon
} from "lucide-react";
import { partnerService } from "@/services/partner.service.js";

const PartnerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isAgency = location.pathname.includes("/agency/");

    const [activeTab, setActiveTab] = useState("overview");
    const [partner, setPartner] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            try {
                let data;
                if (isAgency) {
                    const response = await partnerService.getAgencyPartnerDetail(id);
                    data = response.result;
                } else {
                    const response = await partnerService.getHotelPartnerDetail(id);
                    data = response.result;
                }
                setPartner(data);
            } catch (error) {
                console.error("Lỗi lấy chi tiết:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id, isAgency]);

    // Hàm xử lý parse Amenities
    const parseAmenities = (amenityData) => {
        if (!amenityData) return [];
        try {
            // Nếu là chuỗi dạng "[\"A\", \"B\"]"
            if (typeof amenityData === 'string' && amenityData.startsWith('[')) {
                return JSON.parse(amenityData);
            }
            // Nếu là chuỗi dạng "A, B, C"
            if (typeof amenityData === 'string') {
                return amenityData.split(',').map(item => item.trim());
            }
            return amenityData;
        } catch (e) {
            return [];
        }
    };

    const getStatusStyle = (status) => {
        switch (status?.toUpperCase()) {
            case "ACTIVE": return "bg-emerald-50 text-emerald-600 border-emerald-100";
            case "INACTIVE": return "bg-slate-100 text-slate-500 border-slate-200";
            case "LOCK": return "bg-amber-50 text-amber-600 border-amber-100";
            case "SUSPENDED": return "bg-red-50 text-red-600 border-red-100";
            default: return "bg-slate-50 text-slate-400 border-slate-100";
        }
    };

    const renderStatus = (status) => {
        switch (status?.toUpperCase()) {
            case "ACTIVE": return "ĐANG HOẠT ĐỘNG";
            case "INACTIVE": return "KHÔNG HOẠT ĐỘNG";
            case "LOCK": return "TẠM KHÓA";
            case "SUSPENDED": return "CẤM";
            default: return "KHÔNG XÁC ĐỊNH";
        }
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Đang truy xuất dữ liệu...</p>
        </div>
    );

    if (!partner) return <div className="p-20 text-center font-bold text-slate-500">Không tìm thấy dữ liệu đối tác.</div>;

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return "---";
        return new Intl.NumberFormat('vi-VN').format(amount) + " VNĐ";
    };

    const verif = partner.verification || {};

    return (
        <div className="p-8 bg-[#F8FAFC] min-h-screen">
            <div className="max-w-[1200px] mx-auto space-y-8">

                {/* HEADER ACTIONS */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-3 font-black text-slate-500 hover:text-slate-900 transition-all group text-xs tracking-widest"
                    >
                        <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-all">
                            <ArrowLeft size={18} />
                        </div>
                        QUAY LẠI
                    </button>
                    <div className="flex gap-3">
                        <button className="bg-red-50 text-red-600 px-8 py-3 rounded-2xl font-black text-[10px] tracking-widest border border-red-100 hover:bg-red-600 hover:text-white transition-all uppercase">
                            Khóa Đối Tác
                        </button>
                    </div>
                </div>

                {/* PROFILE HEADER CARD */}
                <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5 text-slate-900 rotate-12">
                        {isAgency ? <Building2 size={120}/> : <HotelIcon size={120}/>}
                    </div>
                    <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                        <div className={`w-28 h-28 rounded-[32px] flex items-center justify-center text-white text-4xl font-black shadow-2xl ${isAgency ? 'bg-blue-600' : 'bg-indigo-600'}`}>
                            {(partner.agencyName || partner.hotelName)?.charAt(0)}
                        </div>
                        <div className="flex-1 space-y-4 text-center md:text-left">
                            <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                                <h1 className="text-3xl font-black text-slate-900 leading-tight">
                                    {partner.agencyName || partner.hotelName}
                                </h1>
                                <span className={`text-[10px] px-4 py-1.5 rounded-full font-black uppercase border tracking-widest ${getStatusStyle(partner.status)}`}>
                                    {renderStatus(partner.status)}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-x-8 gap-y-2 justify-center md:justify-start">
                                <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                                    <MapPin size={16} className="text-blue-500"/> {partner.address}, {partner.city}
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 font-bold text-sm italic">
                                    <Globe size={16} className="text-blue-500"/> {isAgency ? "Đại lý lữ hành" : "Khách sạn & Khu nghỉ dưỡng"}
                                </div>
                                {!isAgency && partner.starRating && (
                                    <div className="flex items-center gap-1 text-amber-500 font-black text-sm">
                                        <Star size={16} fill="currentColor"/> {partner.starRating} Sao
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABS SELECTION */}
                <div className="flex gap-2 bg-white p-2 rounded-[28px] shadow-sm border border-slate-200 w-fit">
                    {[
                        { id: "overview", label: "TỔNG QUAN", icon: Info },
                        { id: "legal", label: isAgency ? "PHÁP LÝ & XÁC MINH" : "HỒ SƠ PHÁP LÝ", icon: FileCheck },
                        { id: "finance", label: isAgency ? "LỊCH SỬ GIAO DỊCH" : "LỊCH SỬ BOOKING", icon: History }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-8 py-4 rounded-[20px] font-black text-[10px] uppercase tracking-widest transition-all ${
                                activeTab === tab.id ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
                            }`}
                        >
                            <tab.icon size={14} /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* CONTENT AREA */}
                <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-200 min-h-[400px]">
                    {activeTab === "overview" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <section className="space-y-6">
                                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Thông tin liên hệ</h4>
                                <div className="space-y-4">
                                    <InfoItem icon={<User/>} label="Người đại diện" value={verif.representativeName || "Chưa cập nhật"} />
                                    <InfoItem icon={<Phone/>} label="Số điện thoại" value={partner.phone} />
                                    <InfoItem icon={<Mail/>} label="Email đối tác" value={partner.email || "N/A"} />
                                </div>

                                {!isAgency && (
                                    <div className="pt-4">
                                        <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Tiện ích (Amenities)</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {parseAmenities(partner.amenities).map((item, idx) => (
                                                <span key={idx} className="bg-slate-50 px-3 py-1.5 rounded-xl text-[10px] font-black text-slate-600 border border-slate-100">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </section>

                            <section className="space-y-6">
                                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Vị trí trụ sở</h4>
                                <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 space-y-4 relative overflow-hidden">
                                    <MapPin className="absolute -right-4 -bottom-4 text-slate-200 opacity-50" size={100} />
                                    <p className="font-black text-slate-700 leading-relaxed text-base relative z-10">
                                        {partner.address}<br/>
                                        {partner.city}, {partner.country}
                                    </p>
                                </div>
                                <div className="p-8 bg-indigo-50/30 rounded-[32px] border border-indigo-100/50">
                                    <h5 className="text-[10px] font-black text-indigo-600 uppercase mb-2">Mô tả</h5>
                                    <p className="text-sm text-slate-600 leading-relaxed italic">
                                        "{partner.description}"
                                    </p>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === "legal" && (
                        <div className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-8 bg-blue-50/50 rounded-[32px] border border-blue-100 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-600 rounded-lg text-white"><FileCheck size={18}/></div>
                                        <h5 className="font-black text-blue-900 text-sm uppercase tracking-wider">Hồ sơ pháp lý doanh nghiệp</h5>
                                    </div>
                                    <div className="space-y-5">
                                        <LegalRow label="Tên pháp nhân" value={verif.legalName} bold />
                                        <div className="grid grid-cols-2 gap-6">
                                            <LegalRow label="Mã số thuế" value={verif.taxCode} />
                                            <LegalRow label="Số giấy phép KD" value={verif.businessLicenseNumber} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <LegalRow label="Đại diện pháp luật" value={verif.representativeName} />
                                            <LegalRow label="Số CCCD định danh" value={verif.representativeCICNumber} />
                                        </div>
                                    </div>
                                </div>

                                {isAgency && (
                                    <div className="p-8 bg-slate-900 rounded-[32px] shadow-2xl space-y-8 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 text-white/5"><CardIcon size={120}/></div>
                                        <h5 className="font-black text-white/50 text-sm uppercase tracking-widest">Tài chính & Tín dụng</h5>

                                        <div className="space-y-6 relative z-10">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Hạn mức tối đa</p>
                                                    <p className="text-2xl font-black text-white italic">{formatCurrency(partner.creditLimit)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Dư nợ hiện tại</p>
                                                    <p className="text-2xl font-black text-red-400">{formatCurrency(partner.currentCredit)}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase">
                                                    <span>Tỷ lệ sử dụng hạn mức</span>
                                                    <span>{partner.creditLimit > 0 ? ((partner.currentCredit / partner.creditLimit) * 100).toFixed(1) : 0}%</span>
                                                </div>
                                                <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden border border-white/5">
                                                    <div
                                                        className={`h-full transition-all duration-1000 ${
                                                            (partner.currentCredit / partner.creditLimit) > 0.8 ? 'bg-red-500' : 'bg-emerald-500'
                                                        }`}
                                                        style={{ width: `${partner.creditLimit > 0 ? (partner.currentCredit / partner.creditLimit) * 100 : 0}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex justify-between items-center">
                                                <div>
                                                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Số dư khả dụng</p>
                                                    <p className="text-lg font-black text-white">{formatCurrency(partner.creditLimit - partner.currentCredit)}</p>
                                                </div>
                                                <CreditCard className="text-white/20" size={32}/>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "finance" && (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                <History size={40} />
                            </div>
                            <div>
                                <p className="font-black text-slate-800 uppercase tracking-widest text-sm">
                                    {isAgency ? "Lịch sử giao dịch" : "Lịch sử Booking"}
                                </p>
                                <p className="text-slate-400 text-xs font-medium mt-1">Dữ liệu đang được đồng bộ từ trung tâm dữ liệu...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const LegalRow = ({ label, value, bold = false }) => (
    <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">{label}</p>
        <p className={`${bold ? 'font-black text-slate-900 text-base' : 'font-bold text-slate-700 text-sm'} uppercase`}>
            {value || "---"}
        </p>
    </div>
);

const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 transition-all">
        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
            {React.cloneElement(icon, { size: 18 })}
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{label}</p>
            <p className="font-black text-slate-700 text-sm">{value || "---"}</p>
        </div>
    </div>
);

export default PartnerDetail;