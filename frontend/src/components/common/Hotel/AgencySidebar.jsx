import {
    LayoutDashboard,
    Search,
    Users,
    Wallet,
    History,
    BookOpen,
    Route,
    FileText,
    Clock
} from "lucide-react";

export default function AgencySidebar() {
    return (
        <aside className="w-64 bg-white border-r min-h-screen fixed left-0 top-0">
            {/* LOGO */}
            <div className="h-14 flex items-center px-4 bg-blue-600 text-white font-bold">
                ✈️ TRAVEL AGENCY
            </div>

            {/* MENU */}
            <nav className="px-3 py-4 text-sm space-y-1">
                <SidebarItem icon={<LayoutDashboard size={16} />} label="Dashboard" />
                <SidebarItem
                    icon={<Search size={16} />}
                    label="Tìm kiếm phòng"
                    active
                />
                <SidebarItem
                    icon={<Users size={16} />}
                    label="Quản lý nhân viên & phân quyền"
                />
                <SidebarItem
                    icon={<Wallet size={16} />}
                    label="Trung tâm tài chính"
                />
                <SidebarItem
                    icon={<History size={16} />}
                    label="Ví trả trước"
                />
                <SidebarItem
                    icon={<Wallet size={16} />}
                    label="Tín dụng"
                />

                <div className="pt-3 text-xs text-slate-400 uppercase">
                    Giao dịch
                </div>

                <SidebarItem
                    icon={<History size={16} />}
                    label="Lịch sử giao dịch"
                />
                <SidebarItem
                    icon={<BookOpen size={16} />}
                    label="Quản lý booking"
                />

                <div className="pt-3 text-xs text-slate-400 uppercase">
                    Hành trình
                </div>

                <SidebarItem
                    icon={<Route size={16} />}
                    label="Xây dựng hành trình"
                />
                <SidebarItem
                    icon={<FileText size={16} />}
                    label="Xem trước hành trình"
                />
                <SidebarItem
                    icon={<FileText size={16} />}
                    label="Danh sách tất cả đơn hàng"
                />
                <SidebarItem
                    icon={<Clock size={16} />}
                    label="Đơn hàng đang xử lý"
                />
            </nav>
        </aside>
    );
}

function SidebarItem({ icon, label, active }) {
    return (
        <div
            className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer
        ${
                active
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-slate-700 hover:bg-slate-100"
            }`}
        >
            {icon}
            {label}
        </div>
    );
}
