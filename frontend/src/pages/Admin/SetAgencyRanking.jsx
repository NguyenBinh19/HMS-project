import React, { useState, useEffect } from 'react';
import {
    Award, ChevronRight, CheckCircle2, XCircle,
    Clock, MapPin, Loader2, RefreshCw, TrendingUp, FileText, UserCheck,
    ArrowUpRight, ArrowDownRight, Mail, Calendar, Info, ArrowRight
} from 'lucide-react';
import { rankService } from '@/services/rank.service.js';
import { kycService } from '@/services/kyc.service.js';

const AgencyRankingManager = () => {
    const [activeTab, setActiveTab] = useState('UPGRADE');
    const [periods, setPeriods] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [agencies, setAgencies] = useState([]);
    const [loading, setLoading] = useState(false);

    const [selectedAgency, setSelectedAgency] = useState(null);
    const [agencyDetail, setAgencyDetail] = useState(null);
    const [kycDetail, setKycDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [reason, setReason] = useState('');

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                const [allCycles, latest] = await Promise.all([
                    rankService.getAllRankCycles(),
                    rankService.getLatestPeriod()
                ]);

                const latestData = latest?.result; // Ví dụ: {startDate: "2025-07-01", endDate: "2025-12-31"}
                const rawPeriods = allCycles?.result?.periods || [];

                // Lấy năm hiện tại của hệ thống (2026)
                const currentYear = new Date().getFullYear();

                // Xác định xem BE đang trả về Kỳ 2 năm trước hay Kỳ 1 năm nay
                // Dựa vào tháng của endDate (nếu là tháng 12 thì là Kỳ 2, nếu tháng 06 là Kỳ 1)
                const isLatestK2 = latestData?.endDate.includes("-12-");

                const formattedPeriods = [
                    {
                        type: "Kỳ 1",
                        // Nếu BE đang trả về Kỳ 2 năm trước (2025),
                        // thì nút Kỳ 1 phải hiển thị dữ liệu của năm hiện tại (2026) để admin có thể xem trước hoặc đối soát
                        startDate: `${currentYear}-${rawPeriods[0]?.value}`,
                        endDate: `${currentYear}-${rawPeriods[1]?.value}`
                    },
                    {
                        type: "Kỳ 2",
                        // Nếu BE đang trả về Kỳ 2 năm trước (2025), nút Kỳ 2 sẽ lấy năm (currentYear - 1)
                        startDate: `${isLatestK2 ? currentYear - 1 : currentYear}-${rawPeriods[2]?.value}`,
                        endDate: `${isLatestK2 ? currentYear - 1 : currentYear}-${rawPeriods[3]?.value}`
                    }
                ];

                setPeriods(formattedPeriods);

                // QUAN TRỌNG: Phải set đúng Object từ BE trả về để đảm bảo startDate/endDate khớp 100%
                setSelectedPeriod(latestData);

            } catch (error) {
                console.error("Lỗi khởi tạo:", error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const fetchAgencies = async () => {
        if (!selectedPeriod || !selectedPeriod.startDate || !selectedPeriod.endDate) {
            console.warn("Chưa có thông tin chu kỳ (Period), không thể tải ứng viên.");
            return;
        }
        setLoading(true);
        try {
            const payload = { startDate: selectedPeriod.startDate, endDate: selectedPeriod.endDate };
            const res = activeTab === 'UPGRADE'
                ? await rankService.getUpgradeCandidates(payload)
                : await rankService.getDowngradeCandidates(payload);
            setAgencies(res?.result || []);
        } catch (error) { setAgencies([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAgencies(); }, [activeTab, selectedPeriod]);

    const handleViewDetail = async (agency) => {
        setSelectedAgency(agency);
        setLoadingDetail(true);
        setKycDetail(null);
        try {
            const rankPayload = {
                agencyId: agency.agencyId,
                startDate: selectedPeriod.startDate,
                endDate: selectedPeriod.endDate,
                targetRankId: agency.targetRankId,
                changeType: activeTab
            };
            const rankRes = await rankService.getAgencyRankDetail(rankPayload);
            setAgencyDetail(rankRes?.result || null);

            const kycId = rankRes?.result?.partnerVerificationId;
            if (kycId) {
                const kycRes = await kycService.getVerificationDetail(kycId);
                setKycDetail(kycRes?.result || null);
            }
        } catch (error) { console.error(error); }
        finally { setLoadingDetail(false); }
    };

    const handleConfirmChange = async (status) => {
        const cleanReason = reason?.trim() || "";
        if (cleanReason.length < 5) {
            return alert("Vui lòng nhập lý do cụ thể (tối thiểu 5 ký tự) trước khi xác nhận.");
        }
        try {
            await rankService.changeRank({
                agencyId: selectedAgency.agencyId,
                currentRankId: agencyDetail?.currentRank?.id,
                targetRankId: agencyDetail?.targetRank?.id,
                totalRevenue: agencyDetail?.totalRevenue,
                changeType: activeTab,
                reason: cleanReason,
                status // 'APPROVE' hoặc 'HOLD'
            });
            alert("Thao tác thành công!");
            setSelectedAgency(null);
            setReason('');
            fetchAgencies();
        } catch (error) { alert("Lỗi cập nhật"); }
    };

    return (
        <div className="p-4 md:p-10 bg-[#F4F7FE] min-h-screen font-sans text-slate-700">
            <div className="max-w-[1600px] mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase flex items-center gap-3">
                            Xét duyệt hạng đại lý
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Phân tích và phê duyệt nâng/hạ cấp bậc dựa trên hiệu suất kinh doanh</p>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-2 rounded-[2rem] shadow-sm border border-slate-100">
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            {periods.map(p => (
                                <button key={p.type} onClick={() => setSelectedPeriod(p)}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all uppercase tracking-tighter ${selectedPeriod?.startDate === p.startDate ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>
                                    {p.type} ({p.startDate.split('-')[0]})
                                </button>
                            ))}
                        </div>
                        <button onClick={fetchAgencies} className="p-2.5 hover:bg-slate-50 rounded-full transition-all text-slate-400">
                            <RefreshCw size={18} className={loading ? "animate-spin text-blue-600" : ""}/>
                        </button>
                    </div>
                </div>

                {/* Tabs & Period Info */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-1">
                    <div className="flex gap-2">
                        {['UPGRADE', 'DOWNGRADE'].map(t => (
                            <button key={t} onClick={() => setActiveTab(t)}
                                    className={`px-6 py-3 text-xs font-black transition-all rounded-t-2xl flex items-center gap-2 ${activeTab === t ? 'bg-white border-x border-t border-slate-200 text-blue-600 -mb-[1px]' : 'text-slate-400 hover:text-slate-600'}`}>
                                {t === 'UPGRADE' ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
                                {t === 'UPGRADE' ? 'ỨNG VIÊN NÂNG HẠNG' : 'ĐỀ XUẤT HẠ HẠNG'}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-3">
                        <Calendar size={14}/> {selectedPeriod?.startDate} - {selectedPeriod?.endDate}
                    </div>
                </div>

                {/* Grid Danh sách Agency */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full py-20 flex flex-col items-center gap-4">
                            <Loader2 className="animate-spin text-blue-600" size={48}/>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Đang tải dữ liệu ứng viên...</p>
                        </div>
                    ) : agencies.length > 0 ? agencies.map(agency => (
                        <div key={agency.agencyId} onClick={() => handleViewDetail(agency)}
                             className="group bg-white p-6 rounded-[2.5rem] border border-slate-100 hover:border-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/5 transition-all cursor-pointer relative overflow-hidden">

                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-slate-50 rounded-[1.2rem] flex items-center justify-center font-black text-xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                        {agency.agencyName.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-800 text-base leading-tight group-hover:text-blue-600 transition-colors">{agency.agencyName}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold mt-1 flex items-center gap-1 uppercase tracking-tighter">
                                            <Mail size={10}/> {agency.email}
                                        </p>
                                    </div>
                                </div>
                                <div className={`p-2 rounded-xl ${activeTab === 'UPGRADE' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                    {activeTab === 'UPGRADE' ? <ArrowUpRight size={18}/> : <ArrowDownRight size={18}/>}
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-slate-50 rounded-2xl flex justify-between items-center group-hover:bg-white group-hover:border group-hover:border-slate-100 transition-all">
                                <div className="space-y-1 text-center flex-1">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Hiện tại</p>
                                    <p className="font-black text-slate-600 uppercase text-xs tracking-widest">{agency.currentRank}</p>
                                </div>
                                <div className="flex-none px-2 text-slate-300">
                                    <ChevronRight size={16}/>
                                </div>
                                <div className="space-y-1 text-center flex-1">
                                    <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest leading-none">Đề xuất</p>
                                    <p className="font-black text-blue-600 uppercase text-xs tracking-widest">{agency.targetRank}</p>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-end">
                                <div className="flex items-center gap-1 bg-slate-900 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                                    Chi tiết <ChevronRight size={10}/>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-inner">
                            <Info className="mx-auto text-slate-300 mb-4" size={48}/>
                            <p className="font-black text-slate-400 uppercase tracking-[0.3em] text-sm italic">Không có ứng viên nào được đề xuất</p>
                        </div>
                    )}
                </div>

                {/* Modal Chi tiết nâng cao */}
                {selectedAgency && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden">
                            {loadingDetail ? (
                                <div className="p-20 flex flex-col items-center gap-4 text-blue-600">
                                    <Loader2 className="animate-spin" size={40}/>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Đang đối soát dữ liệu...</span>
                                </div>
                            ) : (
                                <div className="flex flex-col lg:flex-row">

                                    {/* CỘT TRÁI: THÔNG TIN ĐỐI TÁC */}
                                    <div className="lg:w-[35%] bg-slate-50/80 p-8 border-r border-slate-100">
                                        <div className="space-y-8">
                                            <div>
                                                <h2 className="text-xl font-black text-slate-800 tracking-tight leading-tight">
                                                    {kycDetail?.legalName || agencyDetail?.agencyName}
                                                </h2>
                                                <p className="text-[11px] text-slate-500 mt-2 flex items-start gap-1 italic">
                                                    <MapPin size={14} className="shrink-0 text-blue-500"/>
                                                    {kycDetail?.businessAddress || agencyDetail?.address}
                                                </p>
                                            </div>

                                            {/* Card Doanh thu - Đổi icon dựa trên Tab */}
                                            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Doanh thu đạt được</p>
                                                <div className="flex items-baseline gap-1 relative z-10">
                                    <span className="text-2xl font-black text-slate-900 italic">
                                        {agencyDetail?.totalRevenue?.toLocaleString()}
                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">VNĐ</span>
                                                </div>
                                                {activeTab === 'UPGRADE'
                                                    ? <TrendingUp className="absolute -bottom-2 -right-2 text-emerald-500/10" size={80}/>
                                                    : <TrendingUp className="absolute -bottom-2 -right-2 text-rose-500/10 rotate-180" size={80}/>
                                                }
                                            </div>

                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-blue-600 pl-2">Thông tin định danh</h4>
                                                <div className="space-y-2">
                                                    {[
                                                        { label: "Mã số thuế", value: kycDetail?.taxCode },
                                                        { label: "Giấy phép KD", value: kycDetail?.businessLicenseNumber },
                                                        { label: "Người đại diện", value: kycDetail?.representativeName },
                                                        { label: "Số CCCD/Passport", value: kycDetail?.representativeCICNumber }
                                                    ].map((item, idx) => (
                                                        <div key={idx} className="flex justify-between items-center bg-white/50 p-3 rounded-xl border border-slate-100">
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase">{item.label}</span>
                                                            <span className="text-[11px] font-black text-slate-700 tracking-tight">{item.value || "---"}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CỘT PHẢI: QUYẾT ĐỊNH XẾT HẠNG - THAY ĐỔI THEO TAB */}
                                    <div className="lg:w-[65%] p-10 flex flex-col justify-between bg-white">
                                        <div className="space-y-8">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                    <Award size={16} className={activeTab === 'UPGRADE' ? "text-blue-600" : "text-rose-600"}/>
                                                    Lộ trình {activeTab === 'UPGRADE' ? "Nâng hạng đối tác" : "Hạ hạng đối tác"}
                                                </h3>
                                                <button onClick={() => setSelectedAgency(null)} className="text-slate-300 hover:text-rose-500 transition-all">
                                                    <XCircle size={24}/>
                                                </button>
                                            </div>

                                            {/* So sánh hạng - Màu sắc thay đổi theo Tab */}
                                            <div className={`flex items-center gap-4 p-3 rounded-[2.2rem] ${activeTab === 'UPGRADE' ? 'bg-blue-50/50' : 'bg-rose-50/50'}`}>
                                                <div className="flex-1 bg-white p-5 rounded-[1.8rem] text-center shadow-sm">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Hạng hiện tại</p>
                                                    <p className="text-lg font-black uppercase tracking-tight" style={{ color: agencyDetail?.currentRank?.color }}>
                                                        {agencyDetail?.currentRank?.rankName}
                                                    </p>
                                                </div>
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg border-4 border-white ${activeTab === 'UPGRADE' ? 'bg-blue-600' : 'bg-rose-600'}`}>
                                                    <ArrowRight size={20} strokeWidth={3} className={activeTab === 'DOWNGRADE' ? 'rotate-45 translate-y-0.5' : ''}/>
                                                </div>
                                                <div className="flex-1 bg-white p-5 rounded-[1.8rem] text-center shadow-sm border-2 border-dashed border-slate-200">
                                                    <p className={`text-[8px] font-black uppercase mb-1 italic ${activeTab === 'UPGRADE' ? 'text-blue-500' : 'text-rose-500'}`}>
                                                        {activeTab === 'UPGRADE' ? 'Đề xuất nâng lên' : 'Đề xuất hạ xuống'}
                                                    </p>
                                                    <p className={`text-lg font-black uppercase tracking-tight ${activeTab === 'UPGRADE' ? 'text-blue-600' : 'text-rose-600'}`}>
                                                        {agencyDetail?.targetRank?.rankName}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Quyền lợi / Hạn chế mới */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className={`p-5 rounded-3xl border ${activeTab === 'UPGRADE' ? 'bg-blue-50/40 border-blue-50' : 'bg-rose-50/40 border-rose-50'}`}>
                                                    <p className={`text-[9px] font-black uppercase tracking-widest mb-1 italic ${activeTab === 'UPGRADE' ? 'text-blue-500/60' : 'text-rose-500/60'}`}>
                                                        Hạn mức công nợ {activeTab === 'UPGRADE' ? 'mới' : 'sau khi hạ'}
                                                    </p>
                                                    <p className="text-xl font-black text-slate-800 italic">
                                                        {agencyDetail?.targetRank?.creditLimit?.toLocaleString()} <span className="text-[10px] not-italic text-slate-400">VNĐ</span>
                                                    </p>
                                                </div>
                                                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Doanh thu duy trì tối thiểu</p>
                                                    <p className="text-xl font-black text-slate-800 italic">
                                                        {agencyDetail?.targetRank?.maintainMinRevenue?.toLocaleString()} <span className="text-[10px] not-italic text-slate-400">VNĐ</span>
                                                    </p>
                                                </div>
                                                <div className={`col-span-full p-5 rounded-[1.8rem] text-white/90 ${activeTab === 'UPGRADE' ? 'bg-slate-900' : 'bg-orange-600'}`}>
                                                    <div className="flex items-start gap-3">
                                                        <Info size={16} className="text-white/60 mt-0.5 shrink-0"/>
                                                        <div className="space-y-1">
                                                            <p className="text-[9px] font-black uppercase tracking-widest opacity-60">
                                                                {activeTab === 'UPGRADE' ? 'Đặc quyền hạng mới' : 'Lưu ý hạng mới'}
                                                            </p>
                                                            <p className="text-xs font-medium leading-relaxed italic">
                                                                "{agencyDetail?.targetRank?.description}"
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Ghi chú phê duyệt */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center ml-2">
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                        Lý do {activeTab === 'UPGRADE' ? 'phê duyệt nâng hạng' : 'xác nhận hạ hạng'} <span className="text-rose-500">*</span>
                                                    </label>
                                                    {(!reason || reason.trim().length < 5) && (
                                                        <span className="text-[9px] font-bold text-rose-400 italic animate-pulse">Yêu cầu nhập tối thiểu 5 ký tự</span>
                                                    )}
                                                </div>
                                                <textarea
                                                    className={`w-full p-5 bg-slate-50 border rounded-[1.8rem] outline-none transition-all text-sm font-medium min-h-[90px] shadow-inner ${
                                                        !reason || reason.trim().length < 5
                                                            ? 'border-rose-200 focus:border-rose-500'
                                                            : 'border-slate-200 focus:border-blue-500 focus:bg-white'
                                                    }`}
                                                    placeholder={activeTab === 'UPGRADE' ? "Nhập lý do nâng hạng..." : "Nhập lý do hạ hạng (Ví dụ: Doanh thu không đạt mục tiêu 3 kỳ liên tiếp)..."}
                                                    value={reason}
                                                    onChange={(e) => setReason(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Nút hành động */}
                                        {/* Nút hành động */}
                                        <div className="flex gap-4 pt-8">
                                            <button
                                                onClick={() => handleConfirmChange('HOLD')}
                                                className="px-8 py-4 rounded-2xl bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                                            >
                                                {activeTab === 'UPGRADE' ? 'Tạm giữ (Hold)' : 'Xem xét thêm'}
                                            </button>
                                            <button
                                                disabled={!reason || reason.trim().length < 5}
                                                onClick={() => handleConfirmChange('APPROVE')}
                                                className={`flex-1 py-4 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 ${
                                                    (!reason || reason.trim().length < 5)
                                                        ? 'bg-slate-300 cursor-not-allowed shadow-none'
                                                        : activeTab === 'UPGRADE'
                                                            ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
                                                            : 'bg-rose-600 hover:bg-rose-700 shadow-rose-100'
                                                }`}
                                            >
                                                {activeTab === 'UPGRADE' ? <CheckCircle2 size={16}/> : <ArrowDownRight size={16}/>}
                                                {activeTab === 'UPGRADE' ? 'Xác nhận nâng hạng' : 'Xác nhận hạ hạng'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgencyRankingManager;