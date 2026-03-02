import { useLocation, Link } from "react-router-dom";
import {
    Home, Hotel, Tags, Package, CalendarDays,
    LineChart, TicketPercent, Wallet, Bell, MessageSquare, Building2
} from "lucide-react";

const Sidebar = () => {
    const location = useLocation();

    // Danh sách menu
    const menuItems = [
        { icon: <Home size={20} />, label: "Dashboard", path: "/hotel/room-types" },
        { icon: <Hotel size={20} />, label: "QUẢN LÝ PHÒNG", path: "/hotel/room-types" },
        { icon: <Tags size={20} />, label: "CẤU HÌNH KẾ HOẠCH GIÁ", path: "/hotel/room-types" },
        { icon: <Package size={20} />, label: "QUẢN LÝ DỊCH VỤ", path: "/hotel/room-types" },
        { icon: <CalendarDays size={20} />, label: "LỊCH QUẢN LÝ TỒN KHO", path: "/hotel/room-types" },
        { icon: <LineChart size={20} />, label: "ĐỊNH GIÁ TỰ ĐỘNG", path: "/hotel/dynamic-pricing" },
        { icon: <TicketPercent size={20} />, label: "QUẢN LÝ MÃ GIẢM GIÁ", path: "/hotel/coupons" },
        { icon: <Wallet size={20} />, label: "TÀI CHÍNH & THANH TOÁN", path: "/hotel/room-types" },
        { icon: <Bell size={20} />, label: "QUẦY LỄ TÂN", path: "/hotel/room-types" },
        { icon: <MessageSquare size={20} />, label: "TRUNG TÂM TRÒ CHUYỆN", path: "/hotel/room-types" },
    ];

    return (
        <aside className="w-[260px] h-screen sticky top-0 bg-white flex flex-col border-r border-slate-200 flex-shrink-0">

            {/* Header Sidebar */}
            <div className="h-16 bg-blue-600 flex items-center px-6 shadow-sm flex-shrink-0">
                <span className="text-white font-bold text-lg uppercase tracking-wide flex items-center gap-2">
                    <Building2 className="text-white" size={24} /> HOTEL
                </span>
            </div>

            {/* Menu List */}
            <div className="flex-1 py-6 space-y-1">
                {menuItems.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={index}
                            to={item.path}
                            className={`
                                flex items-center gap-4 px-6 py-3 cursor-pointer transition-all duration-200 group block
                                ${isActive
                                ? "text-blue-600 bg-blue-50 border-r-4 border-blue-600 font-semibold"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"}
                            `}
                        >

                            <span className={`${isActive ? "" : "group-hover:scale-110 transition-transform"}`}>
                                {item.icon}
                            </span>
                            <span className="text-sm uppercase tracking-tight">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </aside>
    );
};

export default Sidebar;