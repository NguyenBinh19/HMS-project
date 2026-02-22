import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { authService } from "../../services/auth.service.js";
import {
    Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, LogIn, Plane, X, ShieldAlert
} from "lucide-react";
import Toast from "../../components/common/notification/Toast.jsx";
import ToastPortal from "../../components/common/notification/ToastPortal.jsx";
import LoginSlider from "../../components/auth/LoginSlider.jsx";

const API_BASE_URL = "http://localhost:8386";
const BG_URL = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop";

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { updateUser } = useAuth();

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [toast, setToast] = useState({ show: false, message: "", type: "info" });

    const [errorModal, setErrorModal] = useState({
        show: false,
        title: "",
        message: ""
    });

    const [focusedField, setFocusedField] = useState(null);

    const from = location.state?.from?.pathname || "/";

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError("");
    };

    const handleSocialLogin = (provider) => {
        window.location.href = `${API_BASE_URL}/oauth2/authorization/${provider}`;
    };

    const closeErrorModal = () => {
        setErrorModal({ ...errorModal, show: false });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setError("Vui lòng nhập đầy đủ thông tin.");
            return;
        }

        setLoading(true);
        try {
            const res = await authService.login(formData.email, formData.password);

            console.log("Login Response:", res);
            if (res) {
                if (updateUser) {
                    await updateUser(res.user);
                }
                setToast({ show: true, message: "Đăng nhập thành công!", type: "success" });
                setTimeout(() => {
                    navigate(from, { replace: true });
                }, 800);
            }
        } catch (err) {
            console.error("Login Error:", err);

            let modalTitle = "Đăng nhập thất bại";
            let modalMsg = "Có lỗi xảy ra, vui lòng thử lại.";
            let shouldShowModal = false;

            if (err.response) {
                const status = err.response.status;
                const data = err.response.data;

                const backendMessage = data.message || data.error || "";
                const lowerMsg = backendMessage.toLowerCase();

                if (status === 403 && (lowerMsg.includes("khóa") || lowerMsg.includes("locked") || lowerMsg.includes("banned"))) {
                    modalTitle = "Tài khoản bị khóa";
                    modalMsg = backendMessage || "Tài khoản của bạn đã bị khóa do vi phạm chính sách.";
                    shouldShowModal = true;
                }
                else if (status === 403 || lowerMsg.includes("disabled") || lowerMsg.includes("chưa được xác thực")) {
                    modalTitle = "Tài khoản chưa kích hoạt";
                    modalMsg = "Vui lòng kiểm tra email của bạn để xác thực tài khoản trước khi đăng nhập.";
                    shouldShowModal = true;
                }
                else if (status === 401 || lowerMsg.includes("bad credentials")) {
                    modalTitle = "Thông tin không chính xác";
                    modalMsg = "Email hoặc mật khẩu bạn nhập không đúng. Vui lòng thử lại.";
                    shouldShowModal = true;
                }
                else {
                    setError(backendMessage || "Lỗi hệ thống.");
                }
            } else {
                setError("Không thể kết nối đến máy chủ.");
            }

            if (shouldShowModal) {
                setErrorModal({
                    show: true,
                    title: modalTitle,
                    message: modalMsg
                });
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative h-screen w-screen overflow-hidden flex items-center justify-center font-sans bg-slate-900">

            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat animate-ken-burns-slow"
                style={{ backgroundImage: `url(${BG_URL})` }}
            >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px]" />
            </div>

            <button
                onClick={() => navigate("/")}
                className="absolute top-6 left-6 z-30 flex items-center gap-2 text-white/90 hover:text-white px-4 py-2 rounded-full bg-white/10 border border-white/20 shadow-lg hover:bg-white/20 transition-all group backdrop-blur-md"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-bold">Trang chủ</span>
            </button>

            <div className="relative z-10 w-full h-full md:h-auto md:max-w-6xl md:aspect-[16/9] bg-white md:rounded-[2.5rem] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 animate-zoom-in">

                <LoginSlider />

                <div className="flex flex-col relative overflow-y-auto custom-scrollbar bg-white">

                    <div className="absolute top-0 right-0 p-8 hidden md:flex gap-4">
                        <span className="text-sm font-semibold text-slate-400">Bạn chưa có tài khoản?</span>
                        <Link to="/register" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                            Đăng ký ngay
                        </Link>
                    </div>

                    <div className="flex-1 flex flex-col justify-center p-8 md:p-12 lg:p-16">
                        <div className="max-w-md mx-auto w-full">

                            <div className="mb-10 relative">
                                <div className="absolute -top-10 -left-10 w-20 h-20 bg-blue-100 rounded-full blur-xl opacity-50"></div>
                                <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-2 flex items-center gap-3">
                                    Tiếp tục hành trình
                                    <Plane className="text-blue-500 animate-pulse" size={28} />
                                </h1>
                                <p className="text-slate-500 text-lg font-medium">
                                    Đăng nhập để mở khóa những <span className="text-blue-600 font-bold">ưu đãi độc quyền</span>.
                                </p>
                                <div className="h-1.5 w-20 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full mt-4"></div>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold flex items-center gap-3 animate-shake">
                                    <div className="p-1.5 bg-rose-100 rounded-full"><Lock size={14} /></div>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="relative group">
                                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'email' ? 'text-blue-600' : 'text-slate-400'}`}>
                                        <Mail size={20} />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`peer w-full pl-12 pr-4 py-4 bg-slate-50 border-2 rounded-2xl outline-none font-semibold text-slate-800 transition-all duration-300
                                    ${focusedField === 'email' ? 'border-blue-500 bg-white shadow-lg shadow-blue-500/10' : 'border-slate-100 hover:border-slate-300 group-hover:bg-slate-100'}
                                `}
                                        placeholder=" "
                                    />
                                    <label className={`absolute left-12 transition-all duration-300 pointer-events-none
                                ${focusedField === 'email' || formData.email
                                        ? '-top-2.5 bg-white px-2 text-xs font-bold text-blue-600'
                                        : 'top-4 text-slate-400 font-medium'
                                    }
                             `}>
                                        Email đăng nhập
                                    </label>
                                </div>

                                {/* Input Password */}
                                <div className="relative group">
                                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'password' ? 'text-blue-600' : 'text-slate-400'}`}>
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`peer w-full pl-12 pr-12 py-4 bg-slate-50 border-2 rounded-2xl outline-none font-semibold text-slate-800 transition-all duration-300
                                    ${focusedField === 'password' ? 'border-blue-500 bg-white shadow-lg shadow-blue-500/10' : 'border-slate-100 hover:border-slate-300 group-hover:bg-slate-100'}
                                `}
                                        placeholder=" "
                                    />
                                    <label className={`absolute left-12 transition-all duration-300 pointer-events-none
                                ${focusedField === 'password' || formData.password
                                        ? '-top-2.5 bg-white px-2 text-xs font-bold text-blue-600'
                                        : 'top-4 text-slate-400 font-medium'
                                    }
                             `}>
                                        Mật khẩu
                                    </label>
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-all">
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>

                                <div className="flex justify-between items-center">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                                        <span className="text-sm font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">Ghi nhớ</span>
                                    </label>
                                    <Link to="/forgot-password" className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline decoration-2 underline-offset-4 transition-colors">
                                        Quên mật khẩu?
                                    </Link>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : <>Đăng nhập ngay <LogIn size={20} className="group-hover:translate-x-1 transition-transform" /></>}
                                </button>
                            </form>

                            <div className="my-8 flex items-center gap-4">
                                <div className="h-[1px] bg-slate-200 flex-1"></div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hoặc tiếp tục với</span>
                                <div className="h-[1px] bg-slate-200 flex-1"></div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => handleSocialLogin('google')}
                                    className="flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-bold text-slate-600 text-sm group"
                                >
                                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" className="w-5 h-5 group-hover:scale-110 transition-transform" /> Google
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSocialLogin('facebook')}
                                    className="flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-xl hover:bg-[#1877F2]/5 hover:border-[#1877F2]/20 hover:text-[#1877F2] transition-all font-bold text-slate-600 text-sm group"
                                >
                                    <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="F" className="w-5 h-5 group-hover:scale-110 transition-transform" /> Facebook
                                </button>
                            </div>
                        </div>

                        <p className="mt-8 text-center text-slate-500 font-medium md:hidden">
                            Chưa có tài khoản? <Link to="/register" className="text-blue-600 font-black hover:underline">Đăng ký ngay</Link>
                        </p>
                    </div>
                </div>
            </div>

            <ToastPortal>
                {toast.show && <div className="fixed top-6 right-6 z-50 animate-slide-in-right"><Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} /></div>}
            </ToastPortal>

            {errorModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-zoom-in relative">
                        {/* Header Modal */}
                        <div className="bg-rose-50 p-6 flex flex-col items-center justify-center text-center border-b border-rose-100">
                            <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-4 shadow-inner">
                                <ShieldAlert size={32} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800">{errorModal.title}</h3>
                        </div>

                        <div className="p-6 text-center">
                            <p className="text-slate-600 font-medium leading-relaxed">
                                {errorModal.message}
                            </p>
                        </div>

                        <div className="p-4 bg-slate-50 flex justify-center">
                            <button
                                onClick={closeErrorModal}
                                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all active:scale-95"
                            >
                                Đã hiểu
                            </button>
                        </div>

                        <button onClick={closeErrorModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 hover:bg-white rounded-full transition-all">
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}

            <style>{`
         @keyframes ken-burns-slow { 0% { transform: scale(1); } 100% { transform: scale(1.15); } }
         .animate-ken-burns-slow { animation: ken-burns-slow 20s infinite alternate ease-in-out; }
         @keyframes zoom-in { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
         .animate-zoom-in { animation: zoom-in 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
         @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
         .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>
        </div>
    );
};

export default Login;