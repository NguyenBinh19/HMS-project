import React, { useState } from "react";
import { List, Map, Star, MapPin, ChevronLeft, ChevronRight, Search, Eye } from "lucide-react";
import HotelSearchForm from "@/components/agency/booking/SearchForm.jsx";
import FilterSidebar from "@/components/agency/booking/FilterGroup.jsx";
import homepage from "@/assets/images/homepage.jpg";

export default function HotelSearchContainer() {
    return (
        <div className="w-full bg-[#F3F7FA] min-h-screen font-sans pb-20">
            {/* Banner Section */}
            <section className="relative h-[420px] flex items-center justify-center px-4">
                <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${homepage})` }}>
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
                </div>
                <div className="relative z-10 w-full max-w-5xl text-center">
                    <h1 className="text-white text-4xl md:text-5xl font-black mb-6 tracking-tight uppercase leading-tight">
                        Nền tảng Đặt phòng B2B An toàn <br/> & Thông minh nhất Việt Nam
                    </h1>
                    <p className="text-slate-200 text-lg mb-10 font-medium opacity-90 italic">
                        Giải pháp giữ tiền trung gian (Escrow) bảo vệ dòng tiền 100% - Tích hợp AI tìm kiếm phòng siêu tốc
                    </p>
                    <div className="bg-white p-3 rounded-2xl shadow-2xl">
                        <HotelSearchForm variant="compact" />
                    </div>
                </div>
            </section>

            <div className="max-w-[1300px] mx-auto py-8 px-6">
                {/* Search Info Header */}
                <div className="bg-white rounded-[24px] border border-slate-100 p-6 mb-8 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h2 className="text-[#003580] font-black text-xl flex items-center gap-2 uppercase tracking-tighter">
                                <Search size={22} strokeWidth={3} className="text-blue-600" /> Kết quả tìm kiếm
                            </h2>
                            <div className="flex items-center gap-4 text-slate-400 text-[12px] font-bold mt-2 italic">
                                <span className="flex items-center gap-1"><MapPin size={14} className="text-blue-500"/> Đà Nẵng</span>
                                <span>📅 24/01 - 26/01</span>
                                <span>👥 2 Người lớn</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[12px] font-black flex items-center gap-2 shadow-lg shadow-blue-100">
                                <List size={16} /> DANH SÁCH
                            </button>
                            <button className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[12px] font-black flex items-center gap-2 hover:bg-slate-200 transition-all">
                                <Map size={16} /> BẢN ĐỒ
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-50">
                        <span className="text-[11px] font-black text-slate-400 uppercase italic">Hiển thị: <span className="text-slate-800">12 khách sạn</span></span>
                        <div className="h-4 w-[1px] bg-slate-200 mx-2"></div>
                        <span className="text-[11px] font-black text-slate-400 uppercase italic mr-2">Sắp xếp theo:</span>
                        <button className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-[11px] font-bold shadow-md">Giá thấp → cao</button>
                        <button className="px-4 py-1.5 bg-white text-slate-500 rounded-lg text-[11px] font-bold border border-slate-200 hover:border-blue-400 transition-all">Đánh giá cao nhất</button>
                        <button className="px-4 py-1.5 bg-white text-slate-500 rounded-lg text-[11px] font-bold border border-slate-200 hover:border-blue-400 transition-all">Gợi ý tốt nhất</button>
                    </div>
                </div>

                <div className="flex gap-8">
                    <aside className="w-[280px] shrink-0">
                        <FilterSidebar />
                    </aside>

                    <div className="flex-1 space-y-4">
                        <HotelCard
                            name="Muong Thanh Luxury Da Nang"
                            img="https://images.unsplash.com/photo-1551882547-ff43c63ebeaf?q=80&w=800"
                            price="1.900.000" oldPrice="2.500.000" saving="600.000"
                            location="Cách trung tâm 1.2km • Sát biển Mỹ Khê"
                            rating="4.8/5 (Excellent)"
                        />
                        <HotelCard
                            name="InterContinental Danang Sun Peninsula"
                            img="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800"
                            price="3.150.000" oldPrice="4.200.000" saving="1.050.000"
                            location="Cách trung tâm 15km • Vịnh Bắc Bộ"
                            rating="4.9/5 (Exceptional)"
                        />
                        {/* Pagination */}
                        <div className="flex justify-center gap-2 mt-12">
                            <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-blue-600 transition-all"><ChevronLeft size={18}/></button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-600 text-white font-black text-[13px] shadow-lg shadow-blue-100">1</button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-[13px] hover:border-blue-500 transition-all">2</button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-blue-600 transition-all"><ChevronRight size={18}/></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const HotelCard = ({ name, img, price, oldPrice, saving, location, rating }) => (
    <div className="bg-white border border-slate-100 rounded-[28px] p-4 flex gap-6 hover:shadow-xl transition-all group overflow-hidden relative">
        <div className="w-[260px] h-[180px] rounded-[20px] overflow-hidden shrink-0 relative">
            <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
            <div className="absolute top-2 left-2 flex flex-col gap-1">
                <span className="bg-red-500 text-white text-[9px] font-black px-2 py-1 rounded-md italic uppercase">Flash Sale -15%</span>
                <span className="bg-[#00A32E] text-white text-[9px] font-black px-2 py-1 rounded-md italic uppercase tracking-tighter shadow-sm">⚡ Instant Booking</span>
            </div>
        </div>

        <div className="flex-1 flex flex-col justify-between py-1">
            <div className="flex justify-between items-start">
                <div className="max-w-[65%]">
                    <h3 className="text-[#003580] font-black text-[19px] leading-tight uppercase tracking-tight group-hover:text-blue-600 transition-colors">{name}</h3>
                    <div className="flex items-center gap-1.5 mt-2">
                        <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => <Star key={i} size={13} fill="currentColor" />)}
                        </div>
                        <span className="text-[#003580] text-[11px] font-black uppercase ml-1 italic">{rating}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] font-bold mt-4 flex items-center gap-1 italic"><MapPin size={12} className="text-blue-500" /> {location}</p>
                </div>

                <div className="text-right">
                    <p className="text-slate-400 line-through text-[11px] font-bold opacity-60 italic">{oldPrice} đ</p>
                    <p className="text-[#00A32E] text-[26px] font-black tracking-tighter my-1">{price} <span className="text-[16px]">đ</span></p>
                    <div className="bg-[#F0FFF4] text-[#1A7331] text-[10px] font-black px-2 py-1.5 rounded-xl border border-[#DCFCE7] italic uppercase tracking-tighter">
                        Tiết kiệm: {saving} đ
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-end mt-4">
                <div className="flex gap-2">
                    {["Pool", "Beachfront", "Breakfast"].map(t => (
                        <span key={t} className="px-3 py-1 bg-slate-50 text-slate-500 text-[9px] font-black rounded-lg uppercase border border-slate-100">{t}</span>
                    ))}
                </div>
                <button className="bg-blue-600 text-white px-7 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2">
                    <Eye size={14} strokeWidth={3} /> Xem phòng
                </button>
            </div>
        </div>
    </div>
);