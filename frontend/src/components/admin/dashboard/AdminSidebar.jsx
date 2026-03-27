import { useLocation, Link } from "react-router-dom";
import {
    LayoutDashboard,
    Settings,
    PenLine,
    BarChart3,
    FileText,
    CreditCard,
    Contact2,
    Clock,
    Users,
    HandCoins,
    ShieldCheck,
    ClipboardCheck,
    Building2,
    BookOpen, Award
} from "lucide-react";

const SidebarAdmin = () => {
    const location = useLocation();

    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: "DASHBOARD", path: "/admin/dashboard" },
        { icon: <Settings size={20} />, label: "CẤU HÌNH HỆ THỐNG", path: "/admin/system-config" },
        { icon: <BarChart3 size={20} />, label: "QUẢN LÝ XẾP HẠNG", path: "/admin/ranking-rules" },
        { icon: <PenLine size={20} />, label: "QUẢN LÝ HOA HỒNG", path: "/admin/commission" },
        { icon: <Contact2 size={20} />, label: "XỬ LÝ XÁC MINH KYC", path: "/admin/kyc-queue" },
        { icon: <Clock size={20} />, label: "LỊCH SỬ THANH TOÁN", path: "/admin/payment-transaction" },
        { icon: <Award size={20} />, label: "XÉT DUYỆT HẠNG ĐẠI LÝ", path: "/admin/set-ranking" },
        { icon: <CreditCard size={20} />, label: "XỬ LÝ PHÊ DUYỆT TÍN DỤNG", path: "/admin/credit" },
        { icon: <HandCoins size={20} />, label: "XỬ LÝ GIAO DỊCH THANH TOÁN", path: "/admin/payout-list" },
        { icon: <ClipboardCheck size={20} />, label: "QUẢN LÝ ĐẶT PHÒNG", path: "/admin/view-booking" },
        { icon: <FileText size={20} />, label: "QUẢN LÝ KHIẾU NẠI", path: "/admin/dispute-center" },
        { icon: <Users size={20} />, label: "QUẢN LÝ NGƯỜI DÙNG", path: "/admin/users" },
        { icon: <Building2 size={20} />, label: "QUẢN LÝ ĐỐI TÁC", path: "/admin/partners" },
        { icon: <BookOpen size={20} />, label: "NHẬT KÝ HỆ THỐNG", path: "/admin/audit-logs" },
    ];

    return (
        <aside className="w-[280px] h-screen sticky top-0 bg-white flex flex-col border-r border-slate-200 flex-shrink-0 font-sans shadow-lg">
            <div className="h-14 bg-[#337ab7] flex items-center px-4 flex-shrink-0">
                <span className="text-white font-semibold text-base uppercase tracking-wider flex items-center gap-3">
                    <ShieldCheck size={22} fill="white" fillOpacity={0.2} />
                    SYSTEM ADMIN
                </span>
            </div>

            <div className="flex-1 py-2 overflow-y-auto custom-scrollbar">
                {menuItems.map((item, index) => {
                    const isActive = location.pathname.startsWith(item.path);

                    return (
                        <Link
                            key={index}
                            to={item.path}
                            className={`
                                flex items-center gap-4 px-5 py-3.5 transition-all duration-200 group
                                ${isActive
                                ? "text-[#2e6da4] bg-[#f4f8fb] border-l-[4px] border-[#337ab7]"
                                : "text-[#333] hover:bg-gray-50 border-l-[4px] border-transparent"}
                            `}
                        >
                            <span className={`transition-colors ${isActive ? "text-[#337ab7]" : "text-gray-500 group-hover:text-slate-900"}`}>
                                {item.icon}
                            </span>
                            <span className={`text-[13px] tracking-tight ${isActive ? "font-bold" : "font-medium"}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </aside>
    );
};

export default SidebarAdmin;