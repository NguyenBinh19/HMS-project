import React from "react";
import { Star, DollarSign, Settings2, ShieldCheck, Coffee, Building2, Umbrella, Zap, Tag, CheckCircle2, Waves, Palmtree, Briefcase, UtensilsCrossed, Search } from "lucide-react";

export default function FilterSidebar() {
    return (
        <aside className="w-[280px] bg-white rounded-[24px] border border-slate-100 p-5 sticky top-5 h-fit shadow-sm font-sans">
            <h3 className="font-black text-[#003580] text-[15px] mb-6 flex items-center gap-2 uppercase tracking-tight">
                <Settings2 size={18} className="text-blue-600" /> Bộ lọc nâng cao
            </h3>

            {/* Khoảng giá */}
            <div className="mb-6 pb-6 border-b border-slate-100">
                <h4 className="text-[12px] font-black text-[#003580] uppercase mb-4 flex items-center gap-2 tracking-tighter">
                    <DollarSign size={14} className="text-blue-600" /> Khoảng giá (VND)
                </h4>
                <div className="flex gap-2 items-center">
                    <input type="text" defaultValue="500.000" className="w-full border border-slate-200 p-2 rounded-xl text-[13px] text-center font-bold text-slate-700 outline-none bg-slate-50" />
                    <span className="text-slate-300">—</span>
                    <input type="text" placeholder="Tối đa" className="w-full border border-slate-200 p-2 rounded-xl text-[13px] text-center font-bold outline-none" />
                </div>
            </div>

            {/* Hạng sao */}
            <div className="mb-6 pb-6 border-b border-slate-100">
                <h4 className="text-[12px] font-black text-[#003580] uppercase mb-4 flex items-center gap-2 tracking-tighter">
                    <Star size={14} className="text-blue-600" fill="currentColor" /> Hạng sao
                </h4>
                <div className="space-y-3">
                    {[3, 4, 5].map(star => (
                        <label key={star} className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                            <div className="flex items-center gap-1">
                                <div className="flex text-yellow-400">
                                    {[...Array(star)].map((_, i) => <Star key={i} size={11} fill="currentColor" />)}
                                </div>
                                <span className="text-[12px] font-bold text-slate-500 group-hover:text-blue-600">({star} sao)</span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Chính sách B2B */}
            <div className="mb-6 pb-6 border-b border-slate-100">
                <h4 className="text-[12px] font-black text-[#003580] uppercase mb-4 flex items-center gap-2 tracking-tighter">
                    <ShieldCheck size={14} className="text-blue-600" /> Chính sách B2B
                </h4>
                <div className="space-y-3">
                    <FilterItem label="Instant Confirmation" icon={<Zap size={14} className="text-yellow-500" />} />
                    <FilterItem label="Flash Sale" icon={<Tag size={14} className="text-red-500" />} />
                    <FilterItem label="Free Cancellation" icon={<CheckCircle2 size={14} className="text-green-500" />} checked />
                </div>
            </div>

            {/* Tiện ích */}
            <div className="mb-6 pb-6 border-b border-slate-100">
                <h4 className="text-[12px] font-black text-[#003580] uppercase mb-4 flex items-center gap-2 tracking-tighter">
                    <Umbrella size={14} className="text-blue-600" /> Tiện ích
                </h4>
                <div className="space-y-3">
                    <FilterItem label="Hồ bơi" icon={<Waves size={14} className="text-blue-400" />} />
                    <FilterItem label="Bãi biển riêng" icon={<Palmtree size={14} className="text-orange-400" />} />
                    <FilterItem label="Phòng họp" icon={<Briefcase size={14} className="text-slate-500" />} />
                    <FilterItem label="Ăn sáng" icon={<UtensilsCrossed size={14} className="text-orange-500" />} />
                </div>
            </div>

            <button className="w-full bg-[#0061E5] text-white py-3 rounded-xl font-black text-[11px] shadow-lg shadow-blue-100 uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                <Search size={14} strokeWidth={3} /> Áp dụng bộ lọc
            </button>
        </aside>
    );
}

const FilterItem = ({ label, icon, checked = false }) => (
    <label className="flex items-center gap-3 cursor-pointer group">
        <input type="checkbox" defaultChecked={checked} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
        <span className="text-[12px] font-bold text-slate-500 group-hover:text-blue-600 flex items-center gap-2">
            {icon} {label}
        </span>
    </label>
);