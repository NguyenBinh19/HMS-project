import { useState } from "react";
import {
    Building2, LogIn, UserPlus, ChevronDown, Menu, X
} from "lucide-react";

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { name: "Trang chủ", href: "#" },
        { name: "Về chúng tôi", href: "#" },
        { name: "Hướng dẫn", href: "#" },
        { name: "Liên hệ", href: "#" },
        { name: "Trải nghiệm hệ thống", href: "#" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    {/* --- LOGO --- */}
                    <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
                        <Building2 className="text-blue-600" size={32} strokeWidth={2.5} />
                        <span className="text-2xl font-black text-blue-600 tracking-tight">
                            HMS-B2B
                        </span>
                    </div>

                    {/* --- DESKTOP NAV --- */}
                    <nav className="hidden lg:flex space-x-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-[15px] font-medium text-slate-600 hover:text-blue-600 transition-colors"
                            >
                                {link.name}
                            </a>
                        ))}
                    </nav>

                    {/* --- ACTIONS (Buttons + Lang) --- */}
                    <div className="hidden lg:flex items-center gap-4">
                        {/* Đăng nhập */}
                        <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-blue-600 text-blue-600 font-bold hover:bg-blue-50 transition-all">
                            <LogIn size={18} />
                            Đăng nhập
                        </button>

                        {/* Đăng ký */}
                        <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all">
                            <UserPlus size={18} />
                            Đăng ký đối tác
                        </button>

                    </div>

                    {/* --- MOBILE MENU BUTTON --- */}
                    <div className="lg:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-md text-slate-600 hover:bg-slate-100"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* --- MOBILE MENU CONTENT --- */}
            {isMenuOpen && (
                <div className="lg:hidden bg-white border-t border-slate-100 p-4 space-y-4 shadow-xl">
                    <nav className="flex flex-col space-y-4">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-base font-medium text-slate-700 hover:text-blue-600"
                            >
                                {link.name}
                            </a>
                        ))}
                    </nav>
                    <div className="border-t pt-4 space-y-3">
                        <button className="w-full flex justify-center items-center gap-2 px-4 py-2 rounded-lg border border-blue-600 text-blue-600 font-bold">
                            <LogIn size={18} /> Đăng nhập
                        </button>
                        <button className="w-full flex justify-center items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-bold">
                            <UserPlus size={18} /> Đăng ký đối tác
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;