import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    Building2,
    LogIn,
    UserPlus,
    Menu,
    X,
    LogOut,
    UserCircle,
    ChevronDown,
    ShieldCheck
} from "lucide-react";
import { jwtDecode } from "jwt-decode";

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem("accessToken");

    // Lấy Roles từ Token
    let userRoles = [];
    try {
        if (token) {
            const decoded = jwtDecode(token);
            const scope = decoded.scope || decoded.roles || decoded.authorities || "";
            userRoles = Array.isArray(scope) ? scope : scope.split(" ");
        }
    } catch (e) {
        userRoles = [];
    }

    const isAdmin = userRoles.some(role => role.includes("ADMIN"));

    // Kiểm tra xem User có cần xác minh (KYC) không
    const needsKyc = user &&
        !isAdmin &&
        !user.hotelId &&
        !user.agencyId;

    // 1. Cập nhật tiêu đề trình duyệt (Browser Title)
    useEffect(() => {
        const titleMap = {
            "/homepage": "Trang chủ | HMS-B2B",
            "/about-us": "Về chúng tôi | HMS-B2B",
            "/user-guide": "Hướng dẫn | HMS-B2B",
            "/contact": "Liên hệ | HMS-B2B",
            "/profile": "Hồ sơ cá nhân | HMS-B2B",
            "/login": "Đăng nhập | HMS-B2B",
            "/register": "Đăng ký đối tác | HMS-B2B",
            "/kyc-intro": "Xác minh tài khoản | HMS-B2B",
            "/kyc/status": "Trạng thái xác minh | HMS-B2B"
        };
        document.title = titleMap[location.pathname] || "HMS-B2B";
    }, [location.pathname]);

    // 2. Lấy thông tin user từ LocalStorage
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse user data:", error);
        }
    }, [location.pathname]); // Cập nhật lại khi chuyển trang để đồng bộ ID mới nếu có

    const handleLogout = () => {
        localStorage.clear();
        setUser(null);
        navigate("/login");
    };

    const navLinks = [
        { name: "Trang chủ", href: "/homepage" },
        { name: "Về chúng tôi", href: "/about-us" },
        { name: "Hướng dẫn", href: "/user-guide" },
        { name: "Liên hệ", href: "/contact" },
    ];

    // Hàm helper để hiển thị chức danh Tiếng Việt
    const getRoleLabel = () => {
        if (isAdmin) return "QUẢN TRỊ VIÊN HỆ THỐNG";
        if (userRoles.some(r => r.includes("HOTEL"))) return "KHÁCH SẠN";
        if (userRoles.some(r => r.includes("AGENCY"))) return "ĐẠI LÝ";
        return "THÀNH VIÊN";
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    {/* LOGO */}
                    <Link to="/homepage" className="flex-shrink-0 flex items-center gap-2 group">
                        <div className="bg-blue-600 p-1.5 rounded-xl transition-transform group-hover:rotate-12">
                            <Building2 className="text-white" size={24} strokeWidth={2.5} />
                        </div>
                        <span className="text-2xl font-black text-slate-800 tracking-tight">
                            HMS<span className="text-blue-600">-</span>B2B
                        </span>
                    </Link>

                    {/* DESKTOP NAV */}
                    <nav className="hidden lg:flex items-center space-x-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.href}
                                className={`px-4 py-2 text-[15px] font-bold rounded-lg transition-all ${
                                    location.pathname === link.href
                                        ? "text-blue-600 bg-blue-50"
                                        : "text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* ACTIONS */}
                    <div className="hidden lg:flex items-center gap-3">
                        {!user ? (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => navigate("/login")}
                                    className="px-6 py-2.5 text-[15px] font-bold text-slate-700 hover:text-blue-600 transition-colors"
                                >
                                    Đăng nhập
                                </button>
                                <button
                                    onClick={() => navigate("/register")}
                                    className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
                                >
                                    Đăng ký đối tác
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                                {needsKyc && (
                                    <button
                                        onClick={() => navigate("/kyc-intro")}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white font-bold text-sm shadow-md shadow-amber-100 hover:bg-amber-600 animate-pulse transition-all"
                                    >
                                        <ShieldCheck size={18} />
                                        Xác minh ngay
                                    </button>
                                )}
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white shadow-sm border border-slate-100 hover:border-blue-200 transition-all group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                        <UserCircle size={20}/>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-slate-800 leading-none">
                                            {user?.lastName} {user?.firstName}
                                        </span>
                                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mt-1">
                                            {getRoleLabel()}
                                        </span>
                                    </div>
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-rose-600 font-bold text-sm transition-colors"
                                >
                                    <LogOut size={18}/>
                                    Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>

                    {/* MOBILE BUTTON */}
                    <div className="lg:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* MOBILE MENU */}
            {isMenuOpen && (
                <div className="lg:hidden bg-white border-t border-slate-100 p-6 space-y-6 shadow-2xl animate-in slide-in-from-top-2 duration-300">
                    <nav className="flex flex-col space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={`px-4 py-3 text-lg font-bold rounded-xl ${
                                    location.pathname === link.href
                                        ? "text-blue-600 bg-blue-50"
                                        : "text-slate-700 hover:bg-slate-50"
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="pt-6 border-t border-slate-100">
                        {!user ? (
                            <div className="grid grid-cols-1 gap-3">
                                <button onClick={() => { navigate("/login"); setIsMenuOpen(false); }} className="w-full py-4 rounded-2xl border-2 border-slate-100 text-slate-700 font-bold">Đăng nhập</button>
                                <button onClick={() => { navigate("/register"); setIsMenuOpen(false); }} className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-100">Đăng ký đối tác</button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl">
                                        {user?.firstName?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-800 text-lg leading-tight">{user?.lastName} {user?.firstName}</p>
                                        <p className="text-sm text-blue-600 font-bold uppercase tracking-widest">
                                            {getRoleLabel().toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                        </p>
                                    </div>
                                </div>

                                {needsKyc && (
                                    <button
                                        onClick={() => { navigate("/kyc-intro"); setIsMenuOpen(false); }}
                                        className="w-full py-4 rounded-2xl bg-amber-500 text-white font-black flex justify-center items-center gap-2 shadow-lg shadow-amber-100"
                                    >
                                        <ShieldCheck size={22} /> Xác minh tài khoản ngay
                                    </button>
                                )}

                                <button
                                    onClick={() => { navigate("/profile"); setIsMenuOpen(false); }}
                                    className="w-full py-4 rounded-2xl bg-white border-2 border-slate-100 text-slate-800 font-black flex justify-center items-center gap-2 hover:border-blue-500 transition-all"
                                >
                                    <UserCircle size={22} className="text-blue-600" /> Hồ sơ cá nhân
                                </button>

                                <button
                                    onClick={handleLogout}
                                    className="w-full py-4 rounded-2xl bg-rose-50 text-rose-600 font-black flex justify-center items-center gap-2 border border-rose-100"
                                >
                                    <LogOut size={22} /> Đăng xuất tài khoản
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;