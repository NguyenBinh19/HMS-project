import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft, Building2, CreditCard, FileCheck,
    History, ShieldAlert, Edit, Ban, Info,
    MapPin, Phone, Mail, User, CheckCircle2, MoreVertical
} from "lucide-react";

const PartnerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("overview");

    // DỮ LIỆU CHI TIẾT MẪU (HARDCODED)
    const partner = {
        id: 1,
        partnerCode: "PAR-9901",
        name: "Việt Nam Travel Group",
        type: "Agency",
        taxId: "0102030405-001",
        address: "Số 123, Đường Võ Nguyên Giáp, Phường Mỹ An, Ngũ Hành Sơn, Đà Nẵng",
        status: "Active",
        tier: "GOLD",
        commission: "12%",
        creditLimit: "500,000,000",
        balance: "25,000,000",
        contactName: "Nguyễn Văn A",
        phone: "0905 123 456",
        email: "contact@vntravelgroup.com",
        bankAccount: "0011004455667",
        bankName: "Vietcombank - CN Đà Nẵng"
    };

    return (
        <div className="p-8 bg-[#F8FAFC] min-h-screen">
            <div className="max-w-[1200px] mx-auto space-y-8">

                {/* BACK & ACTIONS */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-3 font-black text-slate-500 hover:text-slate-900 transition-all group"
                    >
                        <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-all">
                            <ArrowLeft size={20} />
                        </div>
                        QUAY LẠI DANH SÁCH
                    </button>
                    <div className="flex gap-3">
                        <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all"><MoreVertical size={20}/></button>
                        <button className="bg-red-50 text-red-600 px-8 py-3 rounded-2xl font-black text-xs tracking-widest border border-red-100 hover:bg-red-100 transition-all">Ban Account</button>
                        <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs tracking-widest shadow-xl hover:shadow-slate-200 transition-all active:scale-95">Edit Profile</button>
                    </div>
                </div>

                {/* PROFILE HEADER CARD */}
                <div className="bg-white rounded-[48px] p-10 shadow-sm border border-slate-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5 text-slate-900 rotate-12"><Building2 size={150}/></div>
                    <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                        <div className="w-32 h-32 bg-blue-600 rounded-[40px] flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-blue-200">
                            {partner.name.charAt(0)}
                        </div>
                        <div className="flex-1 space-y-4 text-center md:text-left">
                            <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                                <h1 className="text-4xl font-black text-slate-900 leading-tight">{partner.name}</h1>
                                <span className="bg-emerald-50 text-emerald-600 text-[10px] px-4 py-1.5 rounded-full font-black uppercase border border-emerald-100 tracking-widest">
                  {partner.status}
                </span>
                            </div>
                            <div className="flex flex-wrap gap-x-8 gap-y-2 justify-center md:justify-start">
                                <div className="flex items-center gap-2 text-slate-500 font-bold text-sm"><MapPin size={16} className="text-blue-500"/> {partner.city || "Đà Nẵng, Việt Nam"}</div>
                                <div className="flex items-center gap-2 text-slate-500 font-bold text-sm"><User size={16} className="text-blue-500"/> MST: {partner.taxId}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABS NAVIGATION */}
                <div className="flex gap-2 bg-white p-2 rounded-[32px] shadow-sm border border-slate-200 w-fit">
                    {[
                        { id: "overview", label: "TỔNG QUAN", icon: Info },
                        { id: "commercial", label: "THƯƠNG MẠI", icon: CreditCard },
                        { id: "legal", label: "PHÁP LÝ & KYC", icon: FileCheck },
                        { id: "finance", label: "TÀI CHÍNH", icon: History }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-8 py-4 rounded-[24px] font-black text-[11px] uppercase tracking-[0.15em] transition-all ${
                                activeTab === tab.id
                                    ? "bg-blue-600 text-white shadow-xl shadow-blue-200"
                                    : "text-slate-400 hover:bg-slate-50"
                            }`}
                        >
                            <tab.icon size={16} /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* TAB CONTENT */}
                <div className="bg-white rounded-[48px] p-12 shadow-sm border border-slate-200 min-h-[400px]">
                    {activeTab === "overview" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                            <div className="space-y-10">
                                <section className="space-y-6">
                                    <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em]">Thông tin liên hệ</h4>
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400"><User size={18}/></div>
                                            <div><p className="text-[10px] font-bold text-slate-400 uppercase">Người đại diện</p><p className="font-black text-slate-700">{partner.contactName}</p></div>
                                        </div>
                                        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400"><Phone size={18}/></div>
                                            <div><p className="text-[10px] font-bold text-slate-400 uppercase">Số điện thoại</p><p className="font-black text-slate-700">{partner.phone}</p></div>
                                        </div>
                                        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400"><Mail size={18}/></div>
                                            <div><p className="text-[10px] font-bold text-slate-400 uppercase">Email công ty</p><p className="font-black text-slate-700">{partner.email}</p></div>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <div className="space-y-10">
                                <section className="space-y-6">
                                    <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em]">Vị trí pháp lý</h4>
                                    <div className="p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 space-y-4">
                                        <div className="flex gap-3">
                                            <MapPin size={20} className="text-slate-400 mt-1 shrink-0"/>
                                            <p className="font-bold text-slate-600 leading-relaxed">{partner.address}</p>
                                        </div>
                                        <div className="pt-4 border-t border-slate-200">
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-2 italic tracking-widest">Ghi chú nội bộ</p>
                                            <div className="bg-white p-4 rounded-2xl text-sm font-medium text-slate-500 border border-slate-100">
                                                "Đối tác VIP tại miền Trung. Ưu tiên giải quyết các yêu cầu tín dụng nhanh."
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    )}

                    {activeTab === "commercial" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="p-8 bg-blue-50/50 rounded-[40px] border border-blue-100">
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 italic">Xếp hạng hệ thống</p>
                                <p className="text-5xl font-black text-blue-600 tracking-tighter uppercase">{partner.tier}</p>
                                <p className="mt-4 text-xs font-bold text-blue-400">Dựa trên doanh số 2025</p>
                            </div>
                            <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Mức phí hoa hồng</p>
                                <p className="text-5xl font-black text-slate-800 tracking-tighter italic">{partner.commission}</p>
                                <p className="mt-4 text-xs font-bold text-slate-400 italic">Mặc định cho khách sạn</p>
                            </div>
                            <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-red-400">Hạn mức công nợ</p>
                                <p className="text-3xl font-black text-slate-800 tracking-tighter uppercase">{partner.creditLimit} <span className="text-xs">VND</span></p>
                                <p className="mt-4 text-xs font-bold text-red-400 italic font-black uppercase tracking-wider animate-pulse">Cần xem xét tăng</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PartnerDetail;