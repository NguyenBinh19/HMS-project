import React from 'react';
import { Check, RefreshCw, LogIn, ExternalLink } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const KYCSuccessView = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-[540px] rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">

                {/* Header Section */}
                <div className="bg-[#f0f7ff] p-8 pb-10 flex flex-col items-center text-center relative">
                    {/* Icon và Badge */}
                    <div className="relative mb-6">
                        <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center overflow-hidden border border-blue-50">
                            <img src="https://cdn-icons-png.flaticon.com/512/1903/1903162.png" alt="process" className="w-12 h-12 object-contain" />
                        </div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#ffb800] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap shadow-sm border border-white">
                            Đang xét duyệt
                        </div>
                    </div>

                    <h2 className="text-[22px] font-bold text-[#1e293b] mb-3 leading-tight">
                        Hồ sơ của bạn đã được gửi thành công!
                    </h2>
                    <p className="text-[13px] text-slate-500 leading-relaxed max-w-[400px]">
                        Cảm ơn bạn đã hoàn tất đăng ký. Đội ngũ Admin đang kiểm tra đối chiếu thông tin doanh nghiệp của bạn.
                    </p>
                </div>

                {/* Timeline Section */}
                <div className="p-8 pt-10">
                    <h3 className="text-center font-bold text-slate-700 mb-8 text-[15px]">
                        Tiến trình xử lý hồ sơ
                    </h3>

                    <div className="max-w-[320px] mx-auto space-y-0">
                        <TimelineItem
                            status="done"
                            label="Đăng ký tài khoản"
                        />
                        <TimelineItem
                            status="done"
                            label="Gửi hồ sơ xác minh"
                        />
                        <TimelineItem
                            status="active"
                            label="Admin xét duyệt"
                            sub="Quá trình này thường mất khoảng 2 - 24 giờ làm việc."
                        />
                        <TimelineItem
                            status="waiting"
                            label="Kích hoạt hoạt động"
                            isLast
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
                        <button
                            onClick={() => navigate("/")}
                            className="flex items-center justify-center gap-2 bg-white text-slate-700 px-6 py-3 rounded-xl font-bold text-[14px] border border-slate-200 hover:bg-slate-50 transition-all flex-1"
                        >
                            <LogIn size={18} className="rotate-180"/> Trang chủ
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

const TimelineItem = ({status, label, sub, isLast}) => {
    const isDone = status === 'done';
    const isActive = status === 'active';

    return (
        <div className="flex gap-4 min-h-[64px]">
            <div className="flex flex-col items-center">
                <div
                    className={`w-[26px] h-[26px] rounded-full flex items-center justify-center z-10 transition-colors ${
                        isDone ? 'bg-[#10b981]' : isActive ? 'bg-[#ffb800]' : 'bg-slate-200'
                }`}>
                    {isDone ? (
                        <Check size={16} className="text-white stroke-[3]" />
                    ) : isActive ? (
                        <RefreshCw size={14} className="text-white animate-spin stroke-[3]" />
                    ) : (
                        <div className="w-2 h-2 bg-white rounded-full opacity-60" />
                    )}
                </div>
                {!isLast && <div className="w-[2px] flex-1 bg-slate-100 my-1"></div>}
            </div>
            <div className="pb-6">
                <p className={`text-[14px] font-bold leading-none mb-1.5 ${
                    isActive ? 'text-slate-900' : isDone ? 'text-slate-700' : 'text-slate-400'
                }`}>
                    {label}
                </p>
                {sub && (
                    <p className="text-[12px] text-slate-400 leading-relaxed font-medium">
                        {sub}
                    </p>
                )}
            </div>
        </div>
    );
};

export default KYCSuccessView;