import React, { useState, useEffect } from "react";
import {
    CheckCircle2, Clock, AlertCircle, FileText,
    ShieldCheck, ArrowRight, RefreshCw, Calendar, Lock,
    ChevronRight, Info, UserCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { kycService, KYC_STATUS } from "@/services/kyc.service.js";

const VerificationStatusPage = () => {
    const navigate = useNavigate();
    const userId = "b00b85a6-6865-4f6a-a14f-fc7d6ff4d972";

    const [kycDetail, setKycDetail] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const res = await kycService.getVerificationByUser(userId);

            const data = res.result || res;

            if (Array.isArray(data) && data.length > 0) {

                const latest = data.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];
                setKycDetail(latest);
            }
        } catch (error) {
            console.error("Lỗi:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReupload = () => {
        navigate("/kyc-intro", {
            state: {
                fromStatus: kycDetail.status,
                oldKycId: kycDetail.id
            }
        });
    };

    if (loading) return <LoadingState />;
    if (!kycDetail) return <EmptyState onStart={() => navigate("/kyc-intro")} />;

    const theme = getStatusTheme(kycDetail.status);

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-10 font-sans text-slate-700 animate-in fade-in duration-500">
            {/* Top Header */}
            <div className="flex justify-between items-end mb-8 border-b border-slate-100 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tighter uppercase italic">
                        Xác thực đối tác <ShieldCheck className="text-blue-600" size={28}/>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Trạng thái định danh pháp lý của doanh nghiệp</p>
                </div>
                <div className="hidden md:block text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mã định danh</p>
                    <div className="bg-slate-100 px-3 py-1 rounded-lg font-mono text-xs font-bold text-slate-600 border border-slate-200">
                        #KYC-{kycDetail.id}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                    {/* Status Banner */}
                    <div className={`rounded-[2rem] border-2 shadow-sm overflow-hidden ${theme.border}`}>
                        <div className={`p-8 flex flex-col md:flex-row items-center gap-8 ${theme.bg}`}>
                            <div className="p-6 bg-white rounded-[1.5rem] shadow-sm">{theme.icon}</div>
                            <div className="text-center md:text-left flex-1">
                                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-[11px] font-black uppercase tracking-widest shadow-sm mb-4 ${theme.text}`}>
                                    <span className={`w-2.5 h-2.5 rounded-full ${theme.dot}`}></span>
                                    {kycDetail.status}
                                </div>
                                <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">{theme.title}</h2>
                                <p className="text-slate-600 text-sm leading-relaxed font-medium">{theme.desc}</p>
                            </div>
                        </div>

                        {/* Admin Note Section */}
                        {(kycDetail.status === KYC_STATUS.REJECT || kycDetail.status === KYC_STATUS.NEED_MORE_INFO) && (
                            <div className="p-8 bg-white/50 border-t-2 border-slate-100">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-2xl bg-slate-900 text-white shadow-xl">
                                    <div className="flex gap-4">
                                        <Info size={20} className="text-blue-400 shrink-0 mt-1"/>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Yêu cầu từ bộ phận thẩm định</p>
                                            <p className="text-sm font-medium italic text-slate-200">
                                                Vui lòng kiểm tra lại thông tin và ảnh tải lên.
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={handleReupload} className="whitespace-nowrap flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl text-xs font-black hover:bg-blue-700 transition-all uppercase">
                                        Cập nhật ngay <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>


                    <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
                            <div className="p-2 bg-blue-50 rounded-lg"><FileText size={18} className="text-blue-600"/></div>
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Chi tiết hồ sơ Backend</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            <DataRow label="Tên pháp lý (Legal Name)" value={kycDetail.legalName} />
                            <DataRow label="Mã số thuế (Tax Code)" value={kycDetail.taxCode} />
                            <DataRow label="Loại đối tác" value={kycDetail.partnerType} />
                            <DataRow label="Ngày gửi (Submitted At)" value={kycDetail.submittedAt ? new Date(kycDetail.submittedAt).toLocaleString('vi-VN') : "N/A"} />
                            <DataRow label="Người duyệt (Reviewed By)" value={kycDetail.reviewedBy || "Hệ thống đang chờ..."} />
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl">
                        <UserCheck className="text-blue-400 mb-6" size={40} />
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Quyền lợi trạng thái</h4>
                        <div className="space-y-4">
                            <BenefitItem active={kycDetail.status === KYC_STATUS.VERIFIED} label="Thanh toán công nợ" />
                            <BenefitItem active={kycDetail.status === KYC_STATUS.VERIFIED} label="Tăng hạng hiển thị" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-components
const DataRow = ({ label, value }) => (
    <div className="border-l-2 border-slate-100 pl-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-bold text-slate-800">{value || "---"}</p>
    </div>
);

const BenefitItem = ({ active, label }) => (
    <div className={`flex items-center gap-3 text-xs font-bold ${active ? 'text-white' : 'text-slate-600 opacity-50'}`}>
        <CheckCircle2 size={14} className={active ? 'text-blue-400' : 'text-slate-700'}/>
        {label}
    </div>
);

const LoadingState = () => (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="animate-spin text-blue-600" size={32} />
        <p className="text-slate-500 font-bold uppercase text-[10px]">Đang đồng bộ dữ liệu...</p>
    </div>
);

const EmptyState = ({ onStart }) => (
    <div className="max-w-md mx-auto mt-20 text-center space-y-8 bg-white p-12 rounded-[3rem] border border-slate-100 shadow-xl">
        <ShieldCheck size={60} className="mx-auto text-blue-100" />
        <h3 className="text-2xl font-black text-slate-800 uppercase italic">Chưa xác thực</h3>
        <button onClick={onStart} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest">
            Bắt đầu ngay
        </button>
    </div>
);

const getStatusTheme = (status) => {
    switch (status) {
        case KYC_STATUS.VERIFIED:
            return { icon: <CheckCircle2 size={40} className="text-emerald-500" />, bg: "bg-emerald-50/50", border: "border-emerald-100", dot: "bg-emerald-500", text: "text-emerald-700", label: "VERIFIED", title: "Đối tác chính thức", desc: "Hồ sơ của bạn đã được phê duyệt thành công." };
        case KYC_STATUS.REJECT:
            return { icon: <AlertCircle size={40} className="text-red-500" />, bg: "bg-red-50/50", border: "border-red-100", dot: "bg-red-500", text: "text-red-700", label: "REJECTED", title: "Hồ sơ bị từ chối", desc: "Vui lòng xem lại thông tin pháp lý đã cung cấp." };
        case KYC_STATUS.NEED_MORE_INFO:
            return { icon: <Clock size={40} className="text-blue-500" />, bg: "bg-blue-50/50", border: "border-blue-100", dot: "bg-blue-500", text: "text-blue-700", label: "NEED INFO", title: "Yêu cầu bổ sung", desc: "Chúng tôi cần thêm tài liệu để hoàn tất quy trình." };
        default:
            return { icon: <Clock size={40} className="text-amber-500" />, bg: "bg-amber-50/50", border: "border-amber-100", dot: "bg-amber-500", text: "text-amber-700", label: "PENDING", title: "Đang thẩm định", desc: "Hồ sơ đang được chuyên viên xem xét." };
    }
};

export default VerificationStatusPage;