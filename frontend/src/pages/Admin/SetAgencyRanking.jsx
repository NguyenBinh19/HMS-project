import React, { useState } from 'react';
import { Award, AlertTriangle, Save, Calendar, CheckCircle2, TrendingUp, Info } from 'lucide-react';

const AgencyRankingTab = ({ user }) => {
    // Dữ liệu mẫu (Thực tế sẽ lấy từ API của bạn)
    const tiers = [
        { id: 'SILVER', name: 'Silver Partner', limit: 50000000, discount: 5 },
        { id: 'GOLD', name: 'Gold Partner', limit: 200000000, discount: 10 },
        { id: 'PLATINUM', name: 'Platinum Partner', limit: 500000000, discount: 15 }
    ];

    const agencyStats = {
        currentRank: 'SILVER',
        currentDebt: 45000000, // Đang nợ 45tr
        ytdRevenue: 180000000
    };

    const [selectedTier, setSelectedTier] = useState(agencyStats.currentRank);
    const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // UC086.E1 Logic: Nếu nợ > hạn mức của hạng mới -> Chặn
    const targetTier = tiers.find(t => t.id === selectedTier);
    const isConflictDebt = agencyStats.currentDebt > targetTier.limit;

    const handleUpdate = () => {
        if (isConflictDebt) return;
        setIsUpdating(true);
        // Giả lập API call
        setTimeout(() => {
            setIsUpdating(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }, 1000);
    };

    return (
        <div className="animate-in fade-in slide-in-from-top-2 duration-400">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Doanh thu Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                        <TrendingUp size={16} /> <span className="text-xs font-bold uppercase">Doanh thu năm</span>
                    </div>
                    <p className="text-xl font-black text-slate-800">{agencyStats.ytdRevenue.toLocaleString()} đ</p>
                </div>
                {/* Công nợ Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 text-amber-600 mb-2">
                        <Info size={16} /> <span className="text-xs font-bold uppercase">Dư nợ hiện tại</span>
                    </div>
                    <p className="text-xl font-black text-slate-800">{agencyStats.currentDebt.toLocaleString()} đ</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Award size={18} className="text-blue-500" /> Cấu hình phân hạng đại lý
                    </h3>
                    {showSuccess && (
                        <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold animate-pulse">
                            <CheckCircle2 size={14} /> Đã cập nhật hạng thành công
                        </span>
                    )}
                </div>

                {/* Exception Handling: E1 */}
                {isConflictDebt && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700">
                        <AlertTriangle className="shrink-0" size={18} />
                        <div className="text-xs">
                            <p className="font-bold mb-1">Xung đột hạn mức công nợ (UC086.E1)</p>
                            <p>Không thể chọn hạng này vì dư nợ của đại lý ({agencyStats.currentDebt.toLocaleString()}đ) đang vượt quá hạn mức nợ cho phép ({targetTier.limit.toLocaleString()}đ).</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {tiers.map((t) => (
                        <div
                            key={t.id}
                            onClick={() => setSelectedTier(t.id)}
                            className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                                selectedTier === t.id ? 'border-blue-500 bg-blue-50/30' : 'border-slate-50 hover:bg-slate-50'
                            }`}
                        >
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Hạng đối tác</p>
                            <p className="font-bold text-slate-800">{t.name}</p>
                            <div className="mt-2 text-[11px] text-slate-500">
                                <span>Chiết khấu: <b>{t.discount}%</b></span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row items-end gap-4 pt-6 border-t border-slate-50">
                    <div className="flex-1 w-full">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block flex items-center gap-1">
                            <Calendar size={14}/> Ngày bắt đầu áp dụng
                        </label>
                        <input
                            type="date"
                            value={effectiveDate}
                            onChange={(e) => setEffectiveDate(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                        />
                    </div>
                    <button
                        onClick={handleUpdate}
                        disabled={isConflictDebt || isUpdating}
                        className={`px-8 py-2.5 rounded-xl font-bold text-sm text-white flex items-center gap-2 transition-all ${
                            isConflictDebt ? 'bg-slate-200 cursor-not-allowed text-slate-400' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100'
                        }`}
                    >
                        {isUpdating ? 'Đang lưu...' : <><Save size={16}/> Lưu thay đổi</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AgencyRankingTab;