import React, { useState } from "react";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router-dom"; // 1. Import hook điều hướng

export default function HotelSearchForm({ variant = "hero" }) {
    const isHero = variant === "hero";
    const navigate = useNavigate(); // 2. Khởi tạo navigate

    // Tạo state để bắt giá trị
    const [keyword, setKeyword] = useState("");

    // Hàm xử lý khi bấm nút Tìm Kiếm
    const handleSearchClick = () => {
        if (!keyword.trim()) return;

        // Đẩy từ khóa lên URL và chuyển sang trang danh sách kết quả
        navigate(`/list-search-hotel?keyword=${encodeURIComponent(keyword.trim())}`);
    };

    return (
        <div className={`${
            isHero
                ? "bg-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row gap-4 w-full max-w-5xl"
                : "bg-white p-3 rounded-xl shadow-sm flex flex-row gap-3 border border-slate-200 w-full items-center"
        }`}>
            {/* Điểm đến */}
            <div className="flex-1">
                {isHero && <label className="text-[13px] font-bold text-slate-700 mb-1 block">Điểm đến</label>}
                <div className="flex items-center bg-white rounded-lg px-3 py-2.5 border border-slate-200 focus-within:border-blue-500 transition-all">
                    <MapPin className="text-slate-400 mr-2" size={18} />
                    <input
                        type="text"
                        className="bg-transparent outline-none text-slate-700 text-sm w-full"
                        // Gắn state vào input
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()} // Hỗ trợ bấm Enter để tìm
                    />
                </div>
            </div>

            {/* Ngày nhận/trả (Giữ nguyên giao diện tĩnh) */}
            <div className={isHero ? "flex-1" : "w-[250px]"}>
                {isHero && <label className="text-[13px] font-bold text-slate-700 mb-1 block">Ngày nhận/trả</label>}
                <div className="flex items-center bg-white rounded-lg px-3 py-2.5 border border-slate-200 focus-within:border-blue-500">
                    <Calendar className="text-slate-400 mr-2" size={18} />
                    <input type="text" placeholder="Th 2 26 thg 1 2026 - Th 4 28 thg 1 2026" className="bg-transparent outline-none text-slate-700 text-sm w-full" readOnly />
                </div>
            </div>

            {/* Khách (Giữ nguyên giao diện tĩnh) */}
            <div className={isHero ? "flex-1" : "w-[250px]"}>
                {isHero && <label className="text-[13px] font-bold text-slate-700 mb-1 block">Số phòng & Khách</label>}
                <div className="flex items-center bg-[#F0FFF4] rounded-lg px-3 py-2.5 border border-slate-200">
                    <Users className="text-slate-400 mr-2" size={18} />
                    <div className="text-[#1A7331] text-sm font-medium truncate">1 phòng, 2 người lớn, 0 trẻ em</div>
                </div>
            </div>

            {/* Nút bấm */}
            <div className={isHero ? "flex items-end" : ""}>
                <button
                    onClick={handleSearchClick}
                    className="bg-[#0061E5] hover:bg-blue-700 text-white font-bold px-8 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors uppercase text-sm h-[42px]"
                >
                    <Search size={16} strokeWidth={3} />
                    TÌM KIẾM
                </button>
            </div>
        </div>
    );
}