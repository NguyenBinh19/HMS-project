import React, { useState, useRef, useEffect } from "react";
import { Search, MapPin, Calendar, Users, Plus, Minus, ChevronDown } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function HotelSearchForm({ variant = "hero" }) {
    const isHero = variant === "hero";
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // State
    const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
    const [checkIn, setCheckIn] = useState(searchParams.get("checkIn") || "");
    const [checkOut, setCheckOut] = useState(searchParams.get("checkOut") || "");
    const [roomCount, setRoomCount] = useState(Number(searchParams.get("rooms")) || 1);
    const [adults, setAdults] = useState(Number(searchParams.get("adults")) || 2);
    const [children, setChildren] = useState(Number(searchParams.get("children")) || 0);
    const [showGuestPicker, setShowGuestPicker] = useState(false);
    const guestRef = useRef(null);

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

    // Ngày hôm nay (min cho checkIn)
    const today = new Date().toISOString().split("T")[0];

    const handleSearchClick = () => {
        if (!keyword.trim()) return;
        const params = new URLSearchParams();
        params.set("keyword", keyword.trim());
        if (checkIn) params.set("checkIn", checkIn);
        if (checkOut) params.set("checkOut", checkOut);
        params.set("rooms", String(roomCount));
        params.set("adults", String(adults));
        params.set("children", String(children));
        navigate(`/search-hotel/list?${params.toString()}`);
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
                ? "bg-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row gap-4 w-full max-w-5xl"
                : "bg-white p-3 rounded-xl shadow-sm flex flex-row gap-3 border border-slate-200 w-full items-center"
        }`}>
            {/* Điểm đến */}
            <div className={isHero ? "flex-1" : "flex-1 min-w-0"}>
                {isHero && <label className="text-[13px] font-bold text-slate-700 mb-1 block">Điểm đến</label>}
                <div className="flex items-center bg-white rounded-lg px-3 py-2.5 border border-slate-200 focus-within:border-blue-500 transition-all">
                    <MapPin className="text-slate-400 mr-2 flex-shrink-0" size={18} />
                    <input
                        type="text"
                        placeholder="Thành phố, khách sạn, điểm đến..."
                        className="bg-transparent outline-none text-slate-700 text-sm w-full"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearchClick()}
                    />
                </div>
            </div>

            {/* Ngày nhận phòng */}
            <div className={isHero ? "w-[160px]" : "w-[140px]"}>
                {isHero && <label className="text-[13px] font-bold text-slate-700 mb-1 block">Nhận phòng</label>}
                <div className="flex items-center bg-white rounded-lg px-3 py-2.5 border border-slate-200 focus-within:border-blue-500 transition-all">
                    <Calendar className="text-slate-400 mr-2 flex-shrink-0" size={18} />
                    <input
                        type="date"
                        className="bg-transparent outline-none text-slate-700 text-sm w-full"
                        value={checkIn}
                        min={today}
                        onChange={(e) => {
                            setCheckIn(e.target.value);
                            if (checkOut && e.target.value >= checkOut) setCheckOut("");
                        }}
                    />
                </div>
            </div>

            {/* Ngày trả phòng */}
            <div className={isHero ? "w-[160px]" : "w-[140px]"}>
                {isHero && <label className="text-[13px] font-bold text-slate-700 mb-1 block">Trả phòng</label>}
                <div className="flex items-center bg-white rounded-lg px-3 py-2.5 border border-slate-200 focus-within:border-blue-500 transition-all">
                    <Calendar className="text-slate-400 mr-2 flex-shrink-0" size={18} />
                    <input
                        type="date"
                        className="bg-transparent outline-none text-slate-700 text-sm w-full"
                        value={checkOut}
                        min={checkIn || today}
                        onChange={(e) => setCheckOut(e.target.value)}
                    />
                </div>
            </div>

            {/* Số phòng & Khách */}
            <div className={`relative ${isHero ? "w-[220px]" : "w-[200px]"}`} ref={guestRef}>
                {isHero && <label className="text-[13px] font-bold text-slate-700 mb-1 block">Số phòng & Khách</label>}
                <div
                    className="flex items-center bg-[#F0FFF4] rounded-lg px-3 py-2.5 border border-slate-200 cursor-pointer hover:border-blue-400 transition-all"
                    onClick={() => setShowGuestPicker(!showGuestPicker)}
                >
                    <Users className="text-slate-400 mr-2 flex-shrink-0" size={18} />
                    <div className="text-[#1A7331] text-sm font-medium truncate flex-1">{guestSummary}</div>
                    <ChevronDown size={14} className="text-slate-400 ml-1 flex-shrink-0" />
                </div>
                {showGuestPicker && (
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl p-4 z-50 w-[250px]">
                        <CounterRow label="Phòng" value={roomCount} min={1}
                            onMinus={() => setRoomCount(Math.max(1, roomCount - 1))}
                            onPlus={() => { if (roomCount < 9) setRoomCount(roomCount + 1); }} />
                        <CounterRow label="Người lớn" value={adults} min={1}
                            onMinus={() => setAdults(Math.max(1, adults - 1))}
                            onPlus={() => { if (adults < 20) setAdults(adults + 1); }} />
                        <CounterRow label="Trẻ em" value={children} min={0}
                            onMinus={() => setChildren(Math.max(0, children - 1))}
                            onPlus={() => { if (children < 10) setChildren(children + 1); }} />
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