import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  CheckCircle2, Loader2, ArrowLeft, 
  Lock, Eye, EyeOff, KeyRound, ShieldCheck, Check
} from "lucide-react";
import { authService } from "../../services/auth.service.js";

import Toast from "../../components/common/Notification/Toast";
import ToastPortal from "../../components/common/Notification/ToastPortal";

const BG_URL = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  // Password Strength State
  const [passwordScore, setPasswordScore] = useState(0);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false, hasNumber: false, hasSpecial: false, hasUpper: false
  });

  // --- LOGIC CHECK PASSWORD STRENGTH ---
  useEffect(() => {
    const criteria = {
        length: password.length >= 6,
        hasNumber: /\d/.test(password),
        hasUpper: /[A-Z]/.test(password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    setPasswordCriteria(criteria);
    const score = Object.values(criteria).filter(Boolean).length;
    setPasswordScore(score);
  }, [password]);

  const showToastOnce = (msg, type = "error") => {
    setToast({ show: true, message: msg, type });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!password || !confirm) {
      showToastOnce("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    if (password !== confirm) {
      showToastOnce("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (passwordScore < 2) {
        showToastOnce("Mật khẩu quá yếu. Vui lòng đặt mật khẩu mạnh hơn.");
        return;
    }

    setLoading(true);
    try {
      // Gọi Service (Lưu ý: Service nhận token và newPassword)
      await authService.resetPassword(token, password);
      setIsSuccess(true); // Chuyển sang giao diện thành công
    } catch (err) {
      const msg = err.response?.data?.message || "Liên kết không hợp lệ hoặc đã hết hạn.";
      showToastOnce(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  // Helper UI
  const getStrengthColor = () => {
    if (passwordScore <= 1) return "bg-red-500";
    if (passwordScore === 2) return "bg-yellow-500";
    if (passwordScore === 3) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordScore === 0) return "";
    if (passwordScore <= 1) return "Yếu";
    if (passwordScore === 2) return "Trung bình";
    if (passwordScore === 3) return "Tốt";
    return "Tuyệt vời";
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center font-sans bg-slate-900 overflow-hidden px-4">
      
      {/* 1. BACKGROUND */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat animate-ken-burns-slow"
        style={{ backgroundImage: `url(${BG_URL})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/90 via-slate-900/60 to-blue-900/40 backdrop-blur-[3px]" />
      </div>

      {/* 2. MAIN CARD */}
      <div className="relative z-10 w-full max-w-[450px] bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-zoom-in border border-white/50">
        
        {/* Decorative Top Bar */}
        <div className={`h-2 w-full transition-colors duration-500 ${isSuccess ? "bg-emerald-500" : "bg-blue-600"}`}></div>

        <div className="p-8 md:p-10">
          
          {/* LOGO AREA */}
          <div className="text-center mb-8">
             <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
                {isSuccess ? (
                    <CheckCircle2 size={32} className="text-emerald-500" />
                ) : (
                    <KeyRound size={32} className="text-blue-600" />
                )}
             </div>
             <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {isSuccess ? "Thành công!" : "Đặt lại mật khẩu"}
             </h2>
             {!isSuccess && (
                 <p className="text-slate-500 text-sm mt-2 font-medium">
                    Vui lòng nhập mật khẩu mới của bạn.
                 </p>
             )}
          </div>

          {/* === TRẠNG THÁI: THÀNH CÔNG === */}
          {isSuccess ? (
             <div className="text-center animate-fade-in-up">
                <p className="text-slate-600 mb-8 leading-relaxed">
                    Mật khẩu của bạn đã được cập nhật. <br/>
                    Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ.
                </p>
                <button 
                    onClick={() => navigate("/login")}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98]"
                >
                    Đăng nhập ngay
                </button>
             </div>
          ) : (
             /* === TRẠNG THÁI: FORM NHẬP === */
             <form onSubmit={onSubmit} className="space-y-6">
                
                {/* 1. New Password */}
                <div className="relative group">
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'password' ? 'text-blue-600' : 'text-slate-400'}`}>
                        <Lock size={20} />
                    </div>
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full pl-12 pr-12 py-3.5 bg-slate-50 border-2 rounded-xl outline-none font-semibold text-slate-800 transition-all ${focusedField === 'password' ? 'border-blue-500 bg-white shadow-lg shadow-blue-500/10' : 'border-slate-100 hover:border-slate-300'}`}
                        placeholder="Mật khẩu mới"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-2">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>

                {/* Password Strength Meter (Expandable) */}
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${password ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Độ mạnh</span>
                            <span className={`text-[10px] font-bold ${passwordScore <= 1 ? "text-red-500" : passwordScore === 2 ? "text-yellow-500" : "text-green-500"}`}>
                                {getStrengthText()}
                            </span>
                        </div>
                        <div className="h-1 w-full bg-slate-200 rounded-full mb-2 overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${getStrengthColor()}`} style={{ width: `${(passwordScore / 4) * 100}%` }}></div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                             <Badge active={passwordCriteria.length} text="6+ ký tự" />
                             <Badge active={passwordCriteria.hasNumber} text="Số" />
                             <Badge active={passwordCriteria.hasUpper} text="In hoa" />
                             <Badge active={passwordCriteria.hasSpecial} text="Đặc biệt" />
                        </div>
                    </div>
                </div>

                {/* 2. Confirm Password */}
                <div className="relative group">
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'confirm' ? 'text-blue-600' : 'text-slate-400'}`}>
                        <ShieldCheck size={20} />
                    </div>
                    <input
                        type={showConfirm ? "text" : "password"}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        onFocus={() => setFocusedField('confirm')}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full pl-12 pr-12 py-3.5 bg-slate-50 border-2 rounded-xl outline-none font-semibold text-slate-800 transition-all ${focusedField === 'confirm' ? 'border-blue-500 bg-white shadow-lg shadow-blue-500/10' : 'border-slate-100 hover:border-slate-300'}`}
                        placeholder="Xác nhận mật khẩu"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-2">
                        {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" /> : "Đặt lại mật khẩu"}
                </button>

                <div className="text-center mt-4">
                    <button 
                        type="button"
                        onClick={() => navigate("/login")}
                        className="text-sm font-bold text-slate-500 hover:text-blue-600 hover:underline flex items-center justify-center gap-1 mx-auto transition-colors"
                    >
                        <ArrowLeft size={16} /> Quay lại đăng nhập
                    </button>
                </div>
             </form>
          )}

        </div>
      </div>

      {/* Toast Notification */}
      <ToastPortal>
        {toast.show && (
             <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] animate-slide-in-up">
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast({ ...toast, show: false })} 
                />
             </div>
        )}
      </ToastPortal>

      {/* Global Styles */}
      <style>{`
         @keyframes ken-burns-slow { 
             0% { transform: scale(1); } 
             100% { transform: scale(1.1); } 
         }
         .animate-ken-burns-slow { animation: ken-burns-slow 20s infinite alternate ease-in-out; }
         
         @keyframes zoom-in { 
             0% { opacity: 0; transform: scale(0.95); } 
             100% { opacity: 1; transform: scale(1); } 
         }
         .animate-zoom-in { animation: zoom-in 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

// Sub-component Badge
const Badge = ({ active, text }) => (
    <div className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md transition-all duration-300 ${active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"}`}>
        {active ? <Check size={10} strokeWidth={4} /> : <div className="w-2 h-2 rounded-full bg-slate-300"></div>}
        {text}
    </div>
);

export default ResetPassword;