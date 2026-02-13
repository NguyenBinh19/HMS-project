import React from 'react';
import {
    LayoutDashboard,
    Search,
    Users,
    Wallet,
    History,
    CalendarDays,
    FileText,
    Map,
    Eye,
    List,
    CreditCard
} from "lucide-react";

export default function Sidebar() {
    return (
        <aside className="w-[260px] bg-white border-r min-h-screen fixed left-0 top-0 flex flex-col font-sans">
            {/* 1. HEADER LOGO */}
            <div className="h-16 shrink-0 flex items-center px-5 bg-blue-600 text-white gap-3">
                <Users size={24} strokeWidth={2.5} />
                <span className="font-bold text-lg tracking-wide">TRAVEL AGENCY</span>
            </div>

            {/* 2. MENU ITEMS */}
            <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1 custom-scrollbar">

                {/* Dashboard */}
                <SidebarItem
                    icon={<LayoutDashboard size={18} />}
                    label="DASHBOARD"
                />

                {/* Tìm kiếm phòng */}
                <SidebarItem
                    icon={<Search size={18} />}
                    label="TÌM KIẾM PHÒNG"
                />

                {/* Quản lý nhân viên - Multiline text */}
                <SidebarItem
                    icon={<Users size={18} />}
                    label="QUẢN LÝ NHÂN VIÊN & PHÂN QUYỀN"
                />

                {/* --- NHÓM TÀI CHÍNH --- */}
                <SidebarItem
                    icon={<Wallet size={18} />}
                    label="TRUNG TÂM TÀI CHÍNH"
                />
                {/* Sub-items của Tài chính */}
                <div className="space-y-1 mb-2">
                    <SubSidebarItem
                        icon={<Wallet size={16} />}
                        label="Ví trả trước"
                    />
                    <SubSidebarItem
                        icon={<CreditCard size={16} />}
                        label="Tín dụng"
                    />
                </div>

                {/* Lịch sử giao dịch */}
                <SidebarItem
                    icon={<History size={18} />}
                    label="LỊCH SỬ GIAO DỊCH"
                />

                {/* --- NHÓM BOOKING --- */}
                <SidebarItem
                    icon={<CalendarDays size={18} />}
                    label="QUẢN LÝ BOOKING"
                />
                {/* Sub-items của Booking (Có mục Active) */}
                <div className="space-y-1 mb-2">
                    <SubSidebarItem
                        icon={<FileText size={16} />}
                        label="Booking checkout"
                        isActive={true}
                    />
                    <SubSidebarItem
                        icon={<Map size={16} />}
                        label="Xây dựng hành trình"
                    />
                    <SubSidebarItem
                        icon={<Eye size={16} />}
                        label="Xem trước hành trình"
                    />
                    <SubSidebarItem
                        icon={<List size={16} />}
                        label="Danh sách tất cả đơn hàng"
                    />
                </div>

            </div>
        </aside>
    );
}

// Component cho Menu Cha (In hoa, đậm hơn)
function SidebarItem({ icon, label }) {
    return (
        <div className="flex items-start gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors group">
            <span className="mt-0.5 text-slate-600 group-hover:text-blue-600">
                {icon}
            </span>
            <span className="text-[13px] font-bold uppercase leading-tight">
                {label}
            </span>
        </div>
    );
}

// Component cho Menu Con
function SubSidebarItem({ icon, label, isActive }) {
    return (
        <div
            className={`
                flex items-center gap-3 pl-12 pr-4 py-2.5 cursor-pointer text-[13px] font-medium transition-all
                ${isActive
                ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }
            `}
        >
            <span className={isActive ? "text-blue-600" : "text-slate-400"}>
                {icon}
            </span>
            <span>{label}</span>
        </div>
    );
}