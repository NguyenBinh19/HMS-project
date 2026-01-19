import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Mail, ArrowLeft, Loader2, KeyRound, CheckCircle2, ArrowRight 
} from "lucide-react";
import { authService } from "../../services/auth.service.js";

import Toast from "../../components/common/Notification/Toast";
import ToastPortal from "../../components/common/Notification/ToastPortal";

const BG_URL = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop";

const ForgotPassword = () => {
  const navigate = useNavigate();

  // Form State
  const [email, setEmail] = useState("");
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // Chuyển đổi giữa Form và Success Message
  const [focusedField, setFocusedField] = useState(null);
  const [error, setError] = useState("");

  // Toast State
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  const showToastOnce = (msg, type = "error") => {
    setToast({ show: true, message: msg, type });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate
    if (!email.trim()) {
      setError("Vui lòng nhập địa chỉ email.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Địa chỉ email không đúng định dạng.");
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      // Thành công -> Chuyển sang giao diện Success
      setIsSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.message || "Không tìm thấy tài khoản với email này.";
      setError(msg);
      showToastOnce(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center font-sans bg-slate-900 overflow-hidden px-4">
      
      {/* 1. BACKGROUND */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat animate-ken-burns-slow"
        style={{ backgroundImage: `url(${BG_URL})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/90 via-slate-900/60 to-cyan-900/40 backdrop-blur-[3px]" />
      </div>

      {/* 2. BACK BUTTON */}
      <button 
        onClick={() => navigate("/login")}
        className="absolute top-6 left-6 z-30 flex items-center gap-2 text-white/90 hover:text-white px-4 py-2 rounded-full bg-white/10 border border-white/20 shadow-lg hover:bg-white/20 transition-all group backdrop-blur-md"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-bold">Quay lại</span>
      </button>

      {/* 3. MAIN CARD */}
      <div className="relative z-10 w-full max-w-[480px] bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-zoom-in border border-white/50">
        
        {/* Decorative Top Bar */}
        <div className={`h-2 w-full transition-colors duration-500 ${isSuccess ? "bg-emerald-500" : "bg-cyan-600"}`}></div>

        <div className="p-8 md:p-12">
          
          {/* LOGO / ICON AREA */}
          <div className="text-center mb-8">
             <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-5 shadow-inner transition-colors duration-500 ${isSuccess ? "bg-emerald-50" : "bg-cyan-50"}`}>
                {isSuccess ? (
                    <div className="animate-bounce-slow">
                        <CheckCircle2 size={40} className="text-emerald-500" />
                    </div>
                ) : (
                    <KeyRound size={36} className="text-cyan-600" />
                )}
             </div>
             
             <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">
                {isSuccess ? "Đã gửi yêu cầu!" : "Quên mật khẩu?"}
             </h2>
             
             {!isSuccess && (
                 <p className="text-slate-500 font-medium leading-relaxed">
                    Đừng lo lắng. Hãy nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
                 </p>
             )}
          </div>

          {/* === TRẠNG THÁI: THÀNH CÔNG === */}
          {isSuccess ? (
             <div className="text-center animate-fade-in-up">
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 mb-8">
                    <p className="text-slate-700 text-sm leading-relaxed">
                        Chúng tôi đã gửi một liên kết đặt lại mật khẩu đến: <br/>
                        <span className="font-bold text-emerald-700 block mt-1 text-base">{email}</span>
                    </p>
                </div>
                
                <p className="text-xs text-slate-400 mb-6">
                    Không nhận được email? Hãy kiểm tra mục Spam hoặc thử lại sau 5 phút.
                </p>

                <button 
                    onClick={() => navigate("/login")}
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-lg shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    Quay lại đăng nhập <ArrowRight size={18} />
                </button>
             </div>
          ) : (
             /* === TRẠNG THÁI: FORM NHẬP === */
             <form onSubmit={onSubmit} className="space-y-6">
                
                {/* Error Alert */}
                {error && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold text-center animate-shake">
                        {error}
                    </div>
                )}

                {/* Email Input */}
                <div className="relative group">
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'email' ? 'text-cyan-600' : 'text-slate-400'}`}>
                        <Mail size={22} />
                    </div>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full pl-14 pr-4 py-4 bg-slate-50 border-2 rounded-2xl outline-none font-semibold text-slate-800 transition-all duration-300
                            ${focusedField === 'email' ? 'border-cyan-500 bg-white shadow-lg shadow-cyan-500/10' : 'border-slate-100 hover:border-slate-300'}
                        `}
                        placeholder="Nhập địa chỉ email của bạn"
                        autoFocus
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-cyan-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <> <Loader2 className="animate-spin" /> Đang xử lý... </>
                    ) : (
                        "Gửi liên kết xác nhận"
                    )}
                </button>
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

      {/* Styles */}
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

         @keyframes bounce-slow {
             0%, 100% { transform: translateY(-5%); }
             50% { transform: translateY(5%); }
         }
         .animate-bounce-slow { animation: bounce-slow 2s infinite ease-in-out; }
         
         @keyframes fade-in-up {
             0% { opacity: 0; transform: translateY(10px); }
             100% { opacity: 1; transform: translateY(0); }
         }
         .animate-fade-in-up { animation: fade-in-up 0.5s ease-out; }
      `}</style>
    </div>
  );
};

export default ForgotPassword;