import React from "react";
import HotelSearchForm from "@/components/agency/booking/SearchForm.jsx";
import { History, Star, Gift, Crown, Building2 } from "lucide-react";
import homepage from "@/assets/images/homepage.jpg";

export default function HotelSearchEngine() {
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
                    {/* Lớp gradient nhẹ phía dưới để hòa hợp với phần content trắng */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#F8FAFC]/20"></div>
                </div>

                {/* 2. Content (Text & Headline) */}
                <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
                    <h1 className="text-white text-4xl md:text-6xl font-black mb-4 tracking-tight drop-shadow-2xl">
                        Tìm kiếm khách sạn và resort
                    </h1>
                    <p className="text-blue-50 text-sm md:text-lg opacity-90 max-w-2xl mx-auto font-medium mb-10 drop-shadow-md">
                        Hệ thống tìm kiếm thông minh dành riêng cho đại lý du lịch với giá tốt nhất và khuyến mãi đặc biệt
                    </p>

                    {/* 3. Search Bar Widget */}
                    <div className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-5 duration-700">
                        <HotelSearchForm variant="hero" />
                    </div>
                </div>
            </section>

            {/* Phần Gợi ý thông minh */}
            <div className="max-w-6xl mx-auto py-12 px-6">
                <div className="flex items-center gap-2 mb-6">
                    <h2 className="text-xl font-black text-slate-800">Gợi ý thông minh</h2>
                </div>

                {/* Lịch sử tìm kiếm gần đây */}
                <div className="flex flex-wrap items-center gap-2 mb-10">
                    <span className="text-slate-500 text-sm font-bold flex items-center gap-1 mr-2 italic">
                        <History size={16} /> Lịch sử tìm kiếm gần đây
                    </span>
                    {["Đà Nẵng (20-22/05)", "Hà Nội (01-05/06)", "Phú Quốc (15-18/07)"].map((loc) => (
                        <div key={loc} className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[12px] font-bold border border-blue-100 hover:bg-blue-100 transition-colors cursor-pointer">
                            {loc}
                        </div>
                    ))}
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <PromoCard
                        icon={<Star size={22} />} bgColor="bg-[#EBF8FF]" textColor="text-[#2B6CB0]"
                        title="Flash Sale Mường Thanh" desc="Chiết khấu thêm 5% cho Đại lý hạng A"
                        badgeText="GIẢM 5%" badgeSub="Áp dụng đến 30/06/2026"
                    />
                    <PromoCard
                        icon={<Gift size={22} />} bgColor="bg-[#FAF5FF]" textColor="text-[#6B46C1]"
                        title="Combo Vịnh Hạ Long" desc="Tặng 1 đêm miễn phí cho mỗi 3 đêm đặt"
                        badgeText="TẶNG 1 ĐÊM" badgeSub="Áp dụng đến 31/12/2026"
                    />
                    <PromoCard
                        icon={<Crown size={22} />} bgColor="bg-[#FFFFF0]" textColor="text-[#B7791F]"
                        title="Đại lý VIP" desc="Ưu tiên xử lý booking và hỗ trợ 24/7"
                        badgeText="VIP SUPPORT" badgeSub="Luôn sẵn sàng hỗ trợ"
                    />
                </div>

                {/* Khách sạn InterContinental Highlight */}
                <div className="mt-8 bg-white border border-slate-100 rounded-[24px] p-6 flex items-center gap-5 hover:shadow-xl transition-all shadow-sm">
                    <div className="bg-[#E6FFFA] p-4 rounded-2xl">
                        <Building2 className="text-[#319795]" size={32} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-black text-slate-800 text-lg uppercase">Khách sạn InterContinental</h3>
                        <p className="text-sm text-slate-500 font-medium italic">Giá tốt nhất thị trường với chính sách hủy linh hoạt</p>
                    </div>
                    <div className="bg-[#F0FFF4] px-10 py-4 rounded-2xl border border-emerald-100 text-center">
                        <div className="text-[#2F855A] font-black text-lg">GIÁ TỐT NHẤT</div>
                        <div className="text-[#38A169] text-[10px] font-bold italic opacity-80 uppercase tracking-tighter">Cam kết giá thấp hơn 5%</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PromoCard({ icon, bgColor, textColor, title, desc, badgeText, badgeSub }) {
    return (
        <div className="bg-white border border-slate-50 rounded-[32px] p-8 flex flex-col items-center text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className={`${bgColor} ${textColor} p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform`}>{icon}</div>
            <h3 className="font-black text-slate-800 mb-1 uppercase tracking-tight">{title}</h3>
            <p className="text-[11px] text-slate-500 font-bold mb-6 italic leading-relaxed">{desc}</p>
            <div className={`${bgColor} ${textColor} w-full py-4 rounded-2xl border border-white`}>
                <div className="font-black text-lg tracking-widest">{badgeText}</div>
                <div className="text-[10px] font-bold italic opacity-70 uppercase tracking-tighter">{badgeSub}</div>
            </div>
        </div>
    );
}