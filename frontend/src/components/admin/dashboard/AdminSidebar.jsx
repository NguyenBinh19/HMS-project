import { useLocation, Link } from "react-router-dom";
import {
    LayoutDashboard,
    Settings,
    Database,
    BarChart3,
    FileText,
    CreditCard,
    Wallet,
    Gavel,
    Users,
    ClipboardList,
    ShieldCheck,
    History
} from "lucide-react";

const SidebarAdmin = () => {
    const location = useLocation();

    // Danh sách menu
    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: "DASHBOARD", path: "/admin/dashboard" },
        { icon: <Settings size={20} />, label: "CẤU HÌNH HỆ THỐNG", path: "/admin/system-config" },
        { icon: <Database size={20} />, label: "DỮ LIỆU CHUẨN", path: "/admin/master-data" },
        { icon: <BarChart3 size={20} />, label: "QUY TẮC XẾP HẠNG", path: "/admin/ranking-rules" },
        { icon: <FileText size={20} />, label: "TIN TỨC / CMS", path: "/admin/cms" },
        { icon: <ShieldCheck size={20} />, label: "HÀNG ĐỢI KYC", path: "/admin/kyc-queue" },
        { icon: <CreditCard size={20} />, label: "HÀNG ĐỢI TÍN DỤNG", path: "/admin/credit-queue" },
        { icon: <Wallet size={20} />, label: "HÀNG ĐỢI THANH TOÁN", path: "/admin/payment-queue" },
        { icon: <ClipboardList size={20} />, label: "QUẢN LÝ ĐẶT PHÒNG", path: "/admin/view-booking" },
        { icon: <Gavel size={20} />, label: "TRUNG TÂM GIẢI QUYẾT TRANH CHẤP", path: "/admin/dispute-center" },
        { icon: <Users size={20} />, label: "QUẢN LÝ NGƯỜI DÙNG", path: "/admin/users" },
        { icon: <History size={20} />, label: "NHẬT KÝ KIỂM TRA", path: "/admin/audit-logs" },
    ];

    return (
        <aside className="w-[280px] h-screen sticky top-0 bg-white flex flex-col border-r border-slate-200 flex-shrink-0 font-sans">

            {/* Header Sidebar - Màu xanh và icon Shield  */}
            <div className="h-14 bg-[#337ab7] flex items-center px-4 flex-shrink-0">
                <span className="text-white font-semibold text-base uppercase tracking-wider flex items-center gap-3">
                    <ShieldCheck className="text-white" size={22} fill="white" fillOpacity={0.2} />
                    SYSTEM ADMIN
                </span>
            </div>

            {/* Menu List */}
            <div className="flex-1 py-2 overflow-y-auto">
                {menuItems.map((item, index) => {
                    // Giả sử item đang active là KYC để giống ảnh demo
                    const isActive = location.pathname.startsWith(item.path);

                    return (
                        <Link
                            key={index}
                            to={item.path}
                            className={`
                                flex items-center gap-4 px-5 py-3.5 transition-colors duration-150 group
                                ${isActive
                                ? "text-[#2e6da4] bg-[#f4f8fb] border-l-[3px] border-[#337ab7]"
                                : "text-[#333] hover:bg-gray-50 border-l-[3px] border-transparent"}
                            `}
                        >
                            <span className={`flex-shrink-0 ${isActive ? "text-[#337ab7]" : "text-gray-700"}`}>
                                {item.icon}
                            </span>
                            <span className={`text-[13px] font-medium leading-tight ${isActive ? "font-bold" : ""}`}>
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