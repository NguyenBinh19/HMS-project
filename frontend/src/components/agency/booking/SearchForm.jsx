import React, { useState, useRef, useEffect } from "react";
import { Search, MapPin, Calendar, Users, Plus, Minus, ChevronDown, Building2, Globe, Info } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function HotelSearchForm({ variant = "hero" }) {
    const isHero = variant === "hero";
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isFocused, setIsFocused] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [error, setError] = useState("");
    const today = new Date().toISOString().split("T")[0];
    // Nội dung chạy ngang (Nối các gợi ý bằng dấu phân cách)
    const marqueeText = "Nhập tên TP /Phường,xã  •  Nhập tên khách sạn  •  Tìm theo địa chỉ cụ thể...";

    // State
    const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
    const [checkIn, setCheckIn] = useState(searchParams.get("checkIn") || "");
    const [checkOut, setCheckOut] = useState(searchParams.get("checkOut") || "");
    const [roomCount, setRoomCount] = useState(Number(searchParams.get("rooms")) || 1);
    const [adults, setAdults] = useState(Number(searchParams.get("adults")) || 2);
    const [children, setChildren] = useState(Number(searchParams.get("children")) || 0);
    const [showGuestPicker, setShowGuestPicker] = useState(false);
    const guestRef = useRef(null);

    useEffect(() => {
        if (checkIn) {
            const dateIn = new Date(checkIn);
            const dateOut = checkOut ? new Date(checkOut) : null;

            // Tính ngày tối thiểu cho Check-out (Check-in + 1 ngày)
            const minCheckOutDate = new Date(dateIn);
            minCheckOutDate.setDate(minCheckOutDate.getDate() + 1);
            const minCheckOutStr = minCheckOutDate.toISOString().split("T")[0];

            // Nếu chưa có checkOut hoặc checkOut <= checkIn, tự động cập nhật
            if (!checkOut || (dateOut && dateOut <= dateIn)) {
                setCheckOut(minCheckOutStr);
            }
        }
    }, [checkIn, checkOut]);

    // Đóng guest picker khi click ngoài
    useEffect(() => {
        const handler = (e) => {
            if (guestRef.current && !guestRef.current.contains(e.target)) {
                setShowGuestPicker(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleSearchClick = () => {
        if (!keyword.trim()) return;
        // Validate cuối cùng trước khi chuyển trang
        if (new Date(checkOut) <= new Date(checkIn)) {
            alert("Ngày trả phòng phải sau ngày nhận phòng!");
            return;
        }
        const params = new URLSearchParams();
        params.set("keyword", keyword.trim());
        if (checkIn) params.set("checkIn", checkIn);
        if (checkOut) params.set("checkOut", checkOut);
        params.set("rooms", String(roomCount));
        params.set("adults", String(adults));
        params.set("children", String(children));
        navigate(`/agency/search-hotel/list?${params.toString()}`);
    };

    const guestSummary = `${roomCount} phòng, ${adults} người lớn, ${children} trẻ em`;


    const CounterRow = ({ label, value, onMinus, onPlus, min = 0 }) => (
        <div className="flex items-center justify-between py-2">
            <span className="text-sm text-slate-700 font-medium">{label}</span>
            <div className="flex items-center gap-2">
                <button type="button" onClick={onMinus} disabled={value <= min}
                    className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <Minus size={14} />
                </button>
                <span className="w-6 text-center text-sm font-bold">{value}</span>
                <button type="button" onClick={onPlus}
                    className="w-7 h-7 rounded-full border border-blue-400 bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors">
                    <Plus size={14} />
                </button>
            </div>
        </div>
    );

    return (
        <div className={`${
            isHero
                ? "bg-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row gap-4 w-full max-w-5xl items-end"
                : "bg-white p-2 rounded-xl shadow-sm flex flex-row gap-2 border border-slate-200 w-full items-center"
        }`}>
            {/* CSS Animation cho dòng chữ chạy ngang */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }
                .animate-marquee { display: inline-block; animation: marquee 25s linear infinite; }
            `
            }}/>

            {/* Điểm đến */}
            <div
                className="flex-[1.8] min-w-0 w-full relative group"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
            >
                {isHero && <label className="text-[13px] font-bold text-slate-700 mb-1 block">Bạn muốn đi đâu?</label>}
                {!isHero &&
                    <label className="text-[10px] font-bold text-slate-500 ml-1 mb-0.5 block uppercase">Địa điểm / Khách
                        sạn</label>}

                        {showTooltip && (
                            <div className="absolute bottom-full left-0 mb-2 w-max max-w-[400px] bg-slate-800 text-white text-[11px] p-3 rounded-lg shadow-xl z-[60] animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex gap-2 mb-2 text-blue-300 font-bold uppercase items-center">
                                    <Info size={14}/> Gợi ý tìm kiếm
                                </div>

                                <div className="space-y-1.5 text-slate-200">
                                    {/* Dùng whitespace-nowrap để chặn xuống dòng */}
                                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                                        <span className="flex-shrink-0">-</span>
                                        <span>Tìm theo <b>Thành phố</b> (Đà Nẵng, Hà Nội...)</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                                        <span className="flex-shrink-0">-</span>
                                        <span>Tìm theo <b>Tên khách sạn</b> (Mường Thanh, Pullman...)</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                                        <span className="flex-shrink-0">-</span>
                                        <span>Tìm theo <b>Địa chỉ</b> hoặc <b>Phường/Xã</b> cụ thể</span>
                                    </div>
                                </div>

                                {/* Mũi tên tooltip */}
                                <div className="absolute top-full left-6 -mt-1 border-8 border-transparent border-t-slate-800"></div>
                            </div>
                        )}
                <div
                    className="relative flex items-center bg-white rounded-lg px-3 py-2 border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-50 transition-all h-[42px] overflow-hidden">
                    <Search className="text-slate-400 mr-2 flex-shrink-0 z-10 bg-white" size={18}/>
                    <div className="relative flex-1 h-full flex items-center overflow-hidden">
                        {!keyword && !isFocused && (
                            <div className="absolute inset-0 flex items-center pointer-events-none whitespace-nowrap">
                                <div className="animate-marquee text-slate-400 text-sm pl-[100%]">{marqueeText}</div>
                                <div className="animate-marquee text-slate-400 text-sm pl-4">{marqueeText}</div>
                            </div>
                        )}
                        <input
                            type="text"
                            className="bg-transparent outline-none text-slate-700 text-sm w-full font-medium z-10 relative"
                            value={keyword}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearchClick()}
                        />
                    </div>
                </div>
            </div>

            {/* Nhận phòng */}
            <div className={isHero ? "w-[180px]" : "w-[150px]"}>
                {!isHero && <label className="text-[10px] font-bold text-slate-500 ml-1 mb-0.5 block uppercase">Nhận
                    phòng</label>}
                {isHero && <label className="text-[13px] font-bold text-slate-700 mb-1 block">Nhận phòng</label>}
                <div
                    className="flex items-center bg-white rounded-lg px-2 py-2 border border-slate-200 focus-within:border-blue-500 transition-all h-[42px]">
                    <Calendar className="text-slate-400 mr-1.5 flex-shrink-0" size={16}/>
                    <input
                        type="date"
                        className="bg-transparent outline-none text-slate-700 text-[13px] w-full"
                        value={checkIn}
                        min={today}
                        onChange={(e) => setCheckIn(e.target.value)}
                    />
                </div>
            </div>

            {/* Trả phòng */}
            <div className={isHero ? "w-[180px]" : "w-[150px]"}>
                {!isHero && <label className="text-[10px] font-bold text-slate-500 ml-1 mb-0.5 block uppercase">Trả
                    phòng</label>}
                {isHero && <label className="text-[13px] font-bold text-slate-700 mb-1 block">Trả phòng</label>}
                <div
                    className="flex items-center bg-white rounded-lg px-2 py-2 border border-slate-200 focus-within:border-blue-500 transition-all h-[42px]">
                    <Calendar className="text-slate-400 mr-1.5 flex-shrink-0" size={16}/>
                    <input
                        type="date"
                        className="bg-transparent outline-none text-slate-700 text-[13px] w-full"
                        value={checkOut}
                        min={checkIn ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split("T")[0] : today}
                        onChange={(e) => setCheckOut(e.target.value)}
                    />
                </div>
            </div>

            {/* Khách */}
            <div className={`relative ${isHero ? "w-[220px]" : "w-[160px]"}`} ref={guestRef}>
                {!isHero &&
                    <label className="text-[10px] font-bold text-slate-500 ml-1 mb-0.5 block uppercase">Khách</label>}
                {isHero && <label className="text-[13px] font-bold text-slate-700 mb-1 block">Số phòng & Khách</label>}
                <div
                    className="flex items-center bg-[#F0FFF4] rounded-lg px-2 py-2 border border-slate-200 cursor-pointer hover:border-blue-400 transition-all h-[42px]"
                    onClick={() => setShowGuestPicker(!showGuestPicker)}
                >
                    <Users className="text-slate-400 mr-1.5 flex-shrink-0" size={16}/>
                    <div
                        className="text-[#1A7331] text-[12px] font-bold truncate flex-1">{roomCount}P, {adults + children}K
                    </div>
                    <ChevronDown size={12} className="text-slate-400 ml-1 flex-shrink-0"/>
                </div>
                {showGuestPicker && (
                    <div
                        className="absolute top-full left-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl p-4 z-50 w-[250px]">
                        <CounterRow label="Phòng" value={roomCount} min={1}
                                    onMinus={() => setRoomCount(Math.max(1, roomCount - 1))}
                                    onPlus={() => {
                                        if (roomCount < 9) setRoomCount(roomCount + 1);
                                    }}/>
                        <CounterRow label="Người lớn" value={adults} min={1}
                                    onMinus={() => setAdults(Math.max(1, adults - 1))}
                                    onPlus={() => {
                                        if (adults < 20) setAdults(adults + 1);
                                    }}/>
                        <CounterRow label="Trẻ em" value={children} min={0}
                                    onMinus={() => setChildren(Math.max(0, children - 1))}
                                    onPlus={() => {
                                        if (children < 10) setChildren(children + 1);
                                    }}/>
                        <button
                            type="button"
                            onClick={() => setShowGuestPicker(false)}
                            className="mt-3 w-full bg-blue-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Xong
                        </button>
                    </div>
                )}
            </div>

            {/* Nút bấm */}
            <div className={isHero ? "" : "pt-[18px]"}>
                <button
                    onClick={handleSearchClick}
                    className="bg-[#0061E5] hover:bg-blue-700 text-white font-black px-6 rounded-lg flex items-center justify-center gap-2 transition-colors uppercase text-[12px] h-[42px] min-w-[120px] shadow-md shadow-blue-100"
                >
                    <Search size={16} strokeWidth={3}/>
                    TÌM KIẾM
                </button>
            </div>

        </div>
    );
}