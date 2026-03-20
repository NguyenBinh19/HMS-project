import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit3, Key, History, UserSearch, Lock, Unlock } from 'lucide-react';

const StaffActionMenu = ({ onEdit, onViewDetails, onToggle, status, onViewHistory }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const actions = [
        {
            label: 'Xem chi tiết',
            icon: <UserSearch size={16} />,
            onClick: onViewDetails,
            color: 'text-slate-600'
        },
        {
            label: 'Chỉnh sửa thông tin',
            icon: <Edit3 size={16} />,
            onClick: onEdit,
            color: 'text-slate-600'
        },
    ];

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-lg transition-all ${isOpen ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100 text-slate-400'}`}
            >
                <MoreVertical size={18} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[110] overflow-hidden animate-in fade-in zoom-in duration-150 origin-top-right">
                    <div className="py-2">
                        {actions.map((action, index) => (
                            <button
                                key={index}
                                onClick={() => { action.onClick(); setIsOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold hover:bg-slate-50 transition-colors ${action.color}`}
                            >
                                <span className="opacity-70">{action.icon}</span>
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffActionMenu;