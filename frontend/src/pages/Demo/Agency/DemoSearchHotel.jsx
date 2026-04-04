import React from "react";
import HotelSearchForm from "@/components/demo/Agency/DemoSearchForm.jsx";
import { History, Star, Gift, Crown, Building2 } from "lucide-react";
import homepage from "@/assets/images/homepage.jpg";
import { MOCK_AGENCY_DATA } from "@/constant/agency_mockData.js";

export default function HotelSearchEngine() {
    const { rank, agencyName } = MOCK_AGENCY_DATA;

    return (
        <div className="w-full bg-[#F8FAFC] min-h-screen">
            {/* ================= HERO SECTION ================= */}
            <section className="relative h-[550px] flex flex-col items-center justify-center text-center px-4 overflow-hidden">

                {/* 1. Background Image & Overlay  */}
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000"
                    style={{ backgroundImage: `url(${homepage})` }}
                >
                    {/* Lớp phủ màu đen mờ */}
                    <div className="absolute inset-0 bg-black/70"></div>
                    {/* Lớp gradient nhẹ phía dưới */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#F8FAFC]/20"></div>
                </div>

                {/* 2. Content (Text & Headline) */}
                <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
                    <h1 className="text-white text-4xl md:text-6xl font-black mb-4 tracking-tight drop-shadow-2xl">
                        Tìm kiếm khách sạn và resort
                    </h1>
                    <p className="text-blue-50 text-sm md:text-lg opacity-90 max-w-2xl mx-auto font-medium mb-10 drop-shadow-md">
                        Hệ thống tìm kiếm thông minh dành riêng cho đại lý du lịch với giá tốt nhất và khuyến mãi đặc
                        biệt
                    </p>

                    {/* 3. Search Bar Widget */}
                    <div className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-5 duration-700">
                        <HotelSearchForm variant="hero"/>
                    </div>
                </div>
            </section>
        </div>
    );
}

function PromoCard({icon, bgColor, textColor, title, desc, badgeText, badgeSub}) {
    return (
        <div
            className="bg-white border border-slate-50 rounded-[32px] p-8 flex flex-col items-center text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div
                className={`${bgColor} ${textColor} p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform`}>{icon}</div>
            <h3 className="font-black text-slate-800 mb-1 uppercase tracking-tight">{title}</h3>
            <p className="text-[11px] text-slate-500 font-bold mb-6 italic leading-relaxed">{desc}</p>
            <div className={`${bgColor} ${textColor} w-full py-4 rounded-2xl border border-white`}>
                <div className="font-black text-lg tracking-widest">{badgeText}</div>
                <div className="text-[10px] font-bold italic opacity-70 uppercase tracking-tighter">{badgeSub}</div>
            </div>
        </div>
    );
}