import { useState } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import {
    Home, Users, Hotel, CalendarDays, LineChart,
    TicketPercent, Wallet, Building2, ArrowRight,
    RefreshCw, UserPlus, LogOut, Repeat
} from "lucide-react";
import DemoRoleSelect from "./DemoRoleSelect";
import { HOTEL_DEMO_STEPS } from "./mockData";

const SIDEBAR_ITEMS = [
    { icon: <Home size={20} />, label: "Dashboard", path: "/demo/hotel/dashboard" },
    { icon: <Users size={20} />, label: "HỒ SƠ KHÁCH SẠN", path: "/demo/hotel/profile" },
    { icon: <Hotel size={20} />, label: "QUẢN LÝ PHÒNG", path: "/demo/hotel/room-types" },
    { icon: <CalendarDays size={20} />, label: "LỊCH QUẢN LÝ TỒN KHO", path: "/demo/hotel/rate-allotment" },
    { icon: <LineChart size={20} />, label: "ĐỊNH GIÁ TỰ ĐỘNG", path: "/demo/hotel/dynamic-pricing" },
    { icon: <TicketPercent size={20} />, label: "BÁO CÁO DOANH THU", path: "/demo/hotel/revenue-report" },
    { icon: <Wallet size={20} />, label: "TÀI CHÍNH & THANH TOÁN", path: "/demo/hotel/payout" },
];

const DemoLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [showRoleSelect, setShowRoleSelect] = useState(false);
    const [showWelcome, setShowWelcome] = useState(true);

    const currentStepIndex = HOTEL_DEMO_STEPS.findIndex(
        (s) => s.path === location.pathname
    );
    const nextStep = HOTEL_DEMO_STEPS[currentStepIndex + 1] || null;
    const prevStep = currentStepIndex > 0 ? HOTEL_DEMO_STEPS[currentStepIndex - 1] : null;

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Demo Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-6 flex items-center justify-between text-sm font-bold z-[60] relative">
                <div className="flex items-center gap-3">
                    <span className="bg-white/20 px-2 py-0.5 rounded-md text-[10px] uppercase tracking-widest">
                        Demo
                    </span>
                    <span>
                        Bạn đang trải nghiệm hệ thống với vai trò{" "}
                        <strong>Hotel Owner</strong>
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowRoleSelect(true)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-xs"
                    >
                        <Repeat size={14} /> Đổi vai trò
                    </button>
                    <button
                        onClick={() => navigate("/register")}
                        className="flex items-center gap-1.5 px-3 py-1 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-xs font-black"
                    >
                        <UserPlus size={14} /> Đăng ký ngay
                    </button>
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-xs"
                    >
                        <LogOut size={14} /> Thoát demo
                    </button>
                </div>
            </div>

            {/* Header placeholder */}
            <div className="sticky top-0 z-50 bg-white shadow-sm w-full">
                <div className="h-16 flex items-center px-6 justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-xl font-black text-blue-600 tracking-tighter">
                            HMS
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="text-sm font-bold text-slate-500">
                            Grand Palace Da Nang
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-black text-sm">
                            HO
                        </div>
                        <span className="text-sm font-bold text-slate-700">
                            Hotel Owner (Demo)
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 relative">
                {/* Sidebar */}
                <aside className="w-[260px] h-[calc(100vh-104px)] sticky top-[104px] bg-white flex flex-col border-r border-slate-200 flex-shrink-0">
                    <div className="h-16 bg-blue-600 flex items-center px-6 shadow-md flex-shrink-0">
                        <span className="text-white font-bold text-lg uppercase tracking-wide flex items-center gap-2">
                            <Building2 className="text-white" size={24} />{" "}
                            HOTEL
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto py-4 space-y-1">
                        {SIDEBAR_ITEMS.map((item, index) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={index}
                                    to={item.path}
                                    className={`flex items-center gap-4 px-6 py-3 cursor-pointer transition-all duration-200 group relative ${
                                        isActive
                                            ? "text-blue-600 bg-blue-50/80 font-semibold"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                                    }`}
                                >
                                    {isActive && (
                                        <div className="absolute right-0 top-0 h-full w-1 bg-blue-600 rounded-l-md" />
                                    )}
                                    <span
                                        className={`${
                                            isActive
                                                ? "scale-110"
                                                : "group-hover:scale-110 transition-transform"
                                        }`}
                                    >
                                        {item.icon}
                                    </span>
                                    <span className="text-sm uppercase tracking-tight leading-tight">
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Progress */}
                    <div className="p-4 border-t border-slate-100">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            Tiến trình demo
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                style={{
                                    width: `${
                                        ((currentStepIndex + 1) /
                                            HOTEL_DEMO_STEPS.length) *
                                        100
                                    }%`,
                                }}
                            />
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 font-bold">
                            {currentStepIndex + 1} / {HOTEL_DEMO_STEPS.length}{" "}
                            bước
                        </div>
                    </div>
                </aside>

                {/* Content */}
                <main className="flex-1 bg-slate-50">
                    <div className="p-6 md:p-8">
                        <Outlet />
                    </div>

                    {/* Step navigation */}
                    {(prevStep || nextStep) && (
                        <div className="px-8 pb-8 flex justify-between items-center">
                            {prevStep ? (
                                <button
                                    onClick={() => navigate(prevStep.path)}
                                    className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    <ArrowRight
                                        size={16}
                                        className="rotate-180"
                                    />{" "}
                                    {prevStep.label}
                                </button>
                            ) : (
                                <div />
                            )}
                            {nextStep ? (
                                <button
                                    onClick={() => navigate(nextStep.path)}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 active:scale-95"
                                >
                                    Bước tiếp: {nextStep.label}{" "}
                                    <ArrowRight size={16} />
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate("/register")}
                                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-black hover:shadow-xl transition-all shadow-lg active:scale-95"
                                >
                                    <UserPlus size={16} /> Đăng ký ngay để sử
                                    dụng thật!
                                </button>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Welcome overlay */}
            {showWelcome && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                    <div className="relative bg-white rounded-3xl p-12 max-w-lg text-center shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Building2 size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tighter">
                            Chào mừng đến chế độ Demo!
                        </h2>
                        <p className="text-slate-500 mb-8 leading-relaxed">
                            Bạn đang trải nghiệm hệ thống với vai trò{" "}
                            <strong>Hotel Owner</strong>. Tất cả dữ liệu là mô
                            phỏng và không ảnh hưởng đến hệ thống thật. Hãy tự do
                            khám phá các tính năng!
                        </p>
                        <button
                            onClick={() => setShowWelcome(false)}
                            className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-xl active:scale-95"
                        >
                            Bắt đầu khám phá
                        </button>
                    </div>
                </div>
            )}

            <DemoRoleSelect
                isOpen={showRoleSelect}
                onClose={() => setShowRoleSelect(false)}
            />
        </div>
    );
};

export default DemoLayout;
