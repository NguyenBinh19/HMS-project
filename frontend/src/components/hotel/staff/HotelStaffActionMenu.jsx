import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit3, History, Eye, Lock, Unlock } from 'lucide-react';

const StaffActionMenu = ({ onEdit, onToggle, onViewDetails, onViewHistory, status }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleAction = (callback) => {
        if (callback) callback();
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block text-left" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-lg transition-all active:scale-90 ${
                    isOpen ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100 text-slate-400'
                }`}
            >
                <MoreVertical size={20} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-slate-100 z-[110] py-2 animate-in fade-in zoom-in duration-150 origin-top-right">
                    <div className="px-4 py-2 mb-1 border-b border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thao tác nhân viên</span>
                    </div>

                    <button onClick={() => handleAction(onViewDetails)} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-all">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Eye size={16} /></div>
                        <span className="font-medium">Xem chi tiết hồ sơ</span>
                    </button>

                    <button onClick={() => handleAction(onEdit)} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-600 transition-all">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center"><Edit3 size={16} /></div>
                        <span className="font-medium">Chỉnh sửa thông tin</span>
                    </button>

                    <button onClick={() => handleAction(onViewHistory)} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-all">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center"><History size={16} /></div>
                        <span className="font-medium">Lịch sử đặt phòng</span>
                    </button>

                </div>
            )}
        </div>
    );
};

export default StaffActionMenu;