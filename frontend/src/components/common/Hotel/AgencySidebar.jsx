import React from 'react';
import { useLocation, Link } from "react-router-dom";
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
    CreditCard,
    Building2
} from "lucide-react";

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        {
            icon: <LayoutDashboard size={20} />,
            label: "DASHBOARD",
            path: "/homepage"
        },
        {
            icon: <Search size={20} />,
            label: "TÌM KIẾM PHÒNG",
            path: "/search-hotel"
        },
        {
            icon: <Users size={20} />,
            label: "QUẢN LÝ NHÂN VIÊN & PHÂN QUYỀN",
            path: "/homepage"
        },
        {
            icon: <Wallet size={20} />,
            label: "TRUNG TÂM TÀI CHÍNH",
            path: "/homepage",
            subItems: [
                { icon: <Wallet size={18} />, label: "Ví trả trước", path: "/homepage" },
                { icon: <CreditCard size={18} />, label: "Tín dụng", path: "/homepage" },
            ]
        },
        {
            icon: <History size={20} />,
            label: "LỊCH SỬ GIAO DỊCH",
            path: "/homepage"
        },
        {
            icon: <CalendarDays size={20} />,
            label: "QUẢN LÝ BOOKING",
            path: "/",
            subItems: [
                { icon: <CalendarDays size={18} />, label: "Booking Checkout", path: "/booking-checkout" },
                { icon: <List size={18} />, label: "Danh sách tất cả đơn hàng", path: "/agency/bookings/all" },
                { icon: <FileText size={18} />, label: "Đơn hàng đang xử lý", path: "/agency/bookings/pending" },
            ]
        },
    ];

    return (
        <aside className="w-[260px] h-screen sticky top-0 bg-white flex flex-col border-r border-slate-200 flex-shrink-0">
            {/* Header Sidebar*/}
            <div className="h-16 bg-blue-600 flex items-center px-6 shadow-sm flex-shrink-0">
                <span className="text-white font-bold text-lg uppercase tracking-wide flex items-center gap-2">
                    <Users className="text-white" size={24} /> TRAVEL AGENCY
                </span>
            </div>

            {/* Menu List */}
            <div className="flex-1 py-6 overflow-y-auto">
                {menuItems.map((item, index) => {
                    // Kiểm tra xem trang hiện tại có thuộc menu này hoặc menu con của nó không
                    const isParentActive =
                        location.pathname === item.path ||
                        location.pathname.startsWith(item.path + "/");

                    const isExactActive = isParentActive;

                    return (
                        <div key={index} className="flex flex-col">
                            {/* Menu Chính */}
                            <Link
                                to={item.path}
                                className={`
                                    flex items-center gap-4 px-6 py-3 cursor-pointer transition-all duration-200 group
                                    ${isExactActive
                                    ? "text-blue-600 bg-blue-50 border-r-4 border-blue-600 font-bold"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"}
                                `}
                            >
                                <span className={`${isExactActive ? "" : "group-hover:scale-110 transition-transform"}`}>
                                    {item.icon}
                                </span>
                                <span className="text-sm uppercase tracking-tight">{item.label}</span>
                            </Link>

                            {/* Menu Con: Chỉ hiển thị khi Menu Cha đang Active (đã bấm vào hoặc đang ở các trang con) */}
                            {item.subItems && isParentActive && (
                                <div className="bg-slate-50/50 py-1 transition-all duration-300">
                                    {item.subItems.map((sub, subIdx) => {
                                        const isSubActive = location.pathname === sub.path;
                                        return (
                                            <Link
                                                key={subIdx}
                                                to={sub.path}
                                                className={`
                                                    flex items-center gap-3 pl-14 pr-6 py-2.5 transition-colors
                                                    ${isSubActive
                                                    ? "text-blue-600 font-semibold"
                                                    : "text-slate-500 hover:text-slate-800"}
                                                `}
                                            >
                                                <span className="opacity-70">{sub.icon}</span>
                                                <span className="text-[13px]">{sub.label}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </aside>
    );
};

export default Sidebar;