import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit3, Key, History } from 'lucide-react';

const StaffActionMenu = ({ onEdit }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-all"
            >
                <MoreVertical size={18} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-10 overflow-hidden animate-in fade-in zoom-in duration-100">
                    <button onClick={() => { onEdit(); setIsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        <Edit3 size={16} className="text-slate-400" /> Chỉnh sửa thông tin
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        <Key size={16} className="text-slate-400" /> Đặt lại mật khẩu
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        <History size={16} className="text-slate-400" /> Xem lịch sử đặt phòng
                    </button>
                </div>
            )}
        </div>
    );
};

export default StaffActionMenu;