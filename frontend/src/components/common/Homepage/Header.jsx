import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    Building2, Menu, X, LogOut, UserCircle, ShieldCheck,
    ChevronDown, Bell, HeartPulse, User, LayoutDashboard
} from "lucide-react";
import { jwtDecode } from "jwt-decode";

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const dropdownRef = useRef(null);
    const token = localStorage.getItem("accessToken");

    // Click outside handler cho Admin Dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsAdminDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    let userRoles = [];
    let hotelIdFromToken = null;
    let agencyIdFromToken = null;
    try {
        if (token) {
            const decoded = jwtDecode(token);
            const scope = decoded.scope || decoded.roles || decoded.authorities || "";
            userRoles = Array.isArray(scope) ? scope : scope.split(" ");
            hotelIdFromToken = decoded.hotelId || decoded.hotel_id;
            agencyIdFromToken = decoded.agencyId || decoded.agency_id;
        }
    } catch (e) { userRoles = []; }

    const isAdmin = userRoles.some(role => role.includes("ADMIN"));

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) setUser(JSON.parse(storedUser));
        } catch (error) { console.error(error); }
    }, [location.pathname]);

    // Cập nhật Title
    useEffect(() => {
        if (location.pathname === "/homepage" || location.pathname === "/") {
            document.title = "Trang chủ | HMS-B2B";
        }
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.clear();
        setUser(null);
        navigate("/login");
    };

    // Menu dành cho Guest
    const navLinks = [
        { name: "Trang chủ", href: "/homepage" },
        { name: "Về chúng tôi", href: "/about-us" },
        { name: "Hướng dẫn", href: "/user-guide" },
        { name: "Liên hệ", href: "/contact" },
    ];

    // const needsKyc = user && !isAdmin && !user.hotelId && !user.agencyId;
    const currentHotelId = user?.hotelId || hotelIdFromToken;
    const currentAgencyId = user?.agencyId || agencyIdFromToken;

    // needsKyc sẽ false ngay khi một trong hai nguồn (Token/State) có ID
    const needsKyc = user && !isAdmin && !currentHotelId && !currentAgencyId;

    return (
        <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
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

                    {/* DESKTOP NAV - (Guest) */}
                    {!user && (
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
                    )}

                    {/* ACTIONS */}
                    <div className="hidden lg:flex items-center gap-3">
                        {!user ? (
                            /* GIAO DIỆN GUEST */
                            <div className="flex items-center gap-3">
                                <button onClick={() => navigate("/login")} className="px-6 py-2.5 text-[15px] font-bold text-slate-700 hover:text-blue-600 transition-colors">
                                    Đăng nhập
                                </button>
                                <button onClick={() => navigate("/register")} className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
                                    Đăng ký đối tác
                                </button>
                            </div>
                        ) : isAdmin ? (
                            /* GIAO DIỆN ADMIN */
                            <div className="flex items-center gap-5">

                                <div className="relative" ref={dropdownRef}>
                                    <div
                                        onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                                        className="flex items-center gap-3 cursor-pointer group p-1.5 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-[#006AFF] flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                            AD
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[15px] font-bold text-slate-800 leading-none">Admin</span>
                                            <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md mt-1 self-start uppercase tracking-wider">
                                                Super Admin
                                            </span>
                                        </div>
                                        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isAdminDropdownOpen ? 'rotate-180' : ''}`} />
                                    </div>

                                    {/* Dropdown Menu */}
                                    {isAdminDropdownOpen && (
                                        <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in duration-150">
                                            <button onClick={() => { navigate("/profile"); setIsAdminDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600">
                                                <User size={18} /> Hồ sơ cá nhân
                                            </button>
                                            <button onClick={() => { navigate("/admin/dashboard"); setIsAdminDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600">
                                                <LayoutDashboard size={18} /> Dashboard quản trị
                                            </button>
                                            <div className="h-px bg-slate-100 my-1"></div>
                                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors">
                                                <LogOut size={18} /> Đăng xuất
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* GIAO DIỆN HOTEL/AGENCY */
                            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                                {/* Nút Xác minh - Chỉ hiện nếu cần KYC */}
                                {needsKyc && (
                                    <button
                                        onClick={() => navigate("/kyc-intro")}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white font-bold text-sm animate-pulse hover:bg-amber-600 transition-colors"
                                    >
                                        <ShieldCheck size={18} />
                                        <span className="hidden xl:inline">Xác minh ngay</span>
                                    </button>
                                )}

                                {/* NÚT PROFILE RIÊNG BIỆT - Luôn hiển thị */}
                                <button
                                    onClick={() => navigate("/profile")}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                                        location.pathname === "/profile"
                                            ? "bg-blue-600 text-white shadow-md"
                                            : "bg-white text-slate-600 hover:text-blue-600 border border-slate-100 shadow-sm"
                                    }`}
                                >
                                    <User size={18} />
                                    <span>Hồ sơ</span>
                                </button>

                                {/* Hiển thị tên User (Chỉ để xem, không bấm) */}
                                <div className="flex items-center gap-3 px-3 py-1.5">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                        <UserCircle size={20}/>
                                    </div>
                                    <div className="flex flex-col">
            <span className="text-sm font-black text-slate-800 leading-none">
                {user?.lastName} {user?.firstName}
            </span>
                                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">
                {userRoles.some(r => r.includes("HOTEL")) ? "Khách sạn" : "Đại lý"}
            </span>
                                    </div>
                                </div>

                                {/* Nút Đăng xuất */}
                                <div className="w-px h-8 bg-slate-200 mx-1"></div>
                                <button
                                    onClick={handleLogout}
                                    className="px-3 text-slate-400 hover:text-rose-600 transition-colors"
                                    title="Đăng xuất"
                                >
                                    <LogOut size={18}/>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* MOBILE BUTTON */}
                    <div className="lg:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all">
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* MOBILE MENU */}
            {isMenuOpen && (
                <div className="lg:hidden bg-white border-t border-slate-100 p-6 space-y-6 shadow-2xl animate-in slide-in-from-top-2">
                    <nav className="flex flex-col space-y-2">
                        {!user && navLinks.map((link) => (
                            <Link key={link.name} to={link.href} onClick={() => setIsMenuOpen(false)} className="px-4 py-3 text-lg font-bold rounded-xl hover:bg-slate-50 text-slate-700">
                                {link.name}
                            </Link>
                        ))}
                        {isAdmin && (
                            <>
                                <Link to="/admin/dashboard" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 text-lg font-bold rounded-xl text-blue-600 bg-blue-50">Dashboard Admin</Link>
                                <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 text-lg font-bold rounded-xl text-slate-700">Hồ sơ cá nhân</Link>
                            </>
                        )}
                    </nav>
                    <button onClick={handleLogout} className="w-full py-4 rounded-2xl bg-rose-50 text-rose-600 font-black flex justify-center items-center gap-2 border border-rose-100">
                        <LogOut size={22} /> Đăng xuất tài khoản
                    </button>
                </div>
            )}
        </header>
    );
};

export default Header;