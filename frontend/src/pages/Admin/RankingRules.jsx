import React, { useState, useEffect } from 'react';
// Import thêm các icon cần thiết
import {
    Plus, Settings, RefreshCw, Trash2, CheckCircle2, Trophy,
    BarChart3, AlertCircle, ShoppingCart, Star, Crown,
    Medal, Gem, Award, Zap
} from 'lucide-react';
import { rankService } from '@/services/rank.service.js';
import AddRankingModal from '@/components/admin/ranking/AddRankingModal';
import EditRankingDetailModal from '@/components/admin/ranking/EditRankingModal';

const RankingRules = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedRankId, setSelectedRankId] = useState(null);
    const [rankingData, setRankingData] = useState([]);
    const [loading, setLoading] = useState(false);

    // 1. Map đối chiếu giữa string và Component Icon
    const iconMap = {
        star: Star,
        trophy: Trophy,
        crown: Crown,
        medal: Medal,
        gem: Gem,
        award: Award,
        zap: Zap,
    };

    const fetchRanks = async () => {
        setLoading(true);
        try {
            const res = await rankService.getAllRanks();
            const activeRanks = (res.result || []).filter(rank => rank.isActive === true);
            const sortedData = activeRanks.sort((a, b) => b.priority - a.priority);
            setRankingData(sortedData);
        } catch (error) {
            console.error("Lỗi tải danh sách hạng:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRanks(); }, []);

    const handleSoftDelete = async (rank, name) => {
        const isConfirmed = window.confirm(
            `Xác nhận xóa hạng "${name.toUpperCase()}"?\n\nLưu ý: Hạng này sẽ không còn xuất hiện trong hệ thống đăng ký của đại lý.`
        );
        if (!isConfirmed) return;
        try {
            await rankService.deleteRank(rank.id);
            alert("Đã xóa hạng thành công!");
            fetchRanks();
        } catch (error) {
            alert("Có lỗi xảy ra khi thực hiện.");
        }
    };

    return (
        <div className="p-4 md:p-8 lg:p-10 bg-[#f4f7fe] min-h-screen font-sans text-slate-700">
            <div className="max-w-[1600px] mx-auto">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase">
                            Quy tắc xếp hạng
                        </h1>
                        <p className="text-slate-500 text-xs md:text-sm">
                            Quản lý cấp bậc và điều kiện đại lý (Chỉ hiển thị hạng đang hoạt động)
                        </p>
                    </div>
                    <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
                        <button onClick={fetchRanks} className="p-2.5 md:p-3 bg-white border border-slate-200 rounded-xl md:rounded-2xl hover:bg-slate-50 shadow-sm">
                            <RefreshCw size={20} className={loading ? "animate-spin text-blue-600" : ""}/>
                        </button>
                        <button onClick={() => setIsAddModalOpen(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 md:px-6 md:py-3 rounded-xl md:rounded-2xl font-bold hover:bg-blue-700 shadow-lg transition-all active:scale-95">
                            <Plus size={18}/> Tạo hạng mới
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-[450px] bg-white border border-slate-100 rounded-[32px] animate-pulse"></div>
                        ))}
                    </div>
                ) : rankingData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[32px] border-2 border-dashed border-slate-200 shadow-sm">
                        <AlertCircle size={48} className="text-slate-200 mb-4"/>
                        <p className="text-slate-400 font-bold text-lg">Không có hạng thành viên nào đang hoạt động</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                        {rankingData.map((rank) => {
                            // 2. Lấy Component tương ứng từ Map, nếu không có thì mặc định là Trophy
                            const RankIcon = iconMap[rank.icon] || Trophy;

                            return (
                                <div
                                    key={rank.id}
                                    className="group bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] transition-all duration-500 flex flex-col relative overflow-hidden h-full"
                                >
                                    {/* Header Card */}
                                    <div className="p-6 md:p-8 pb-4">
                                        <div className="flex justify-between items-center mb-5">
                                            <div
                                                className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-white transition-transform group-hover:scale-110 duration-300"
                                                style={{
                                                    backgroundColor: rank.color,
                                                    boxShadow: `0 8px 16px -4px ${rank.color}80`
                                                }}
                                            >
                                                {/* Hiển thị Icon */}
                                                <RankIcon size={28}/>
                                            </div>
                                            <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl text-center min-w-[60px]">
                                                <span className="block text-[9px] font-bold text-slate-400 uppercase">Ưu tiên</span>
                                                <span className="text-base font-black text-slate-800 leading-none">{rank.priority}</span>
                                            </div>
                                        </div>

                                        <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-1.5 truncate" title={rank.rankName}>
                                            {rank.rankName}
                                        </h3>

                                        <div className="flex items-center gap-1.5 mb-4">
                                            <CheckCircle2 size={14} className="text-emerald-500"/>
                                            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-tight">Đang hoạt động</span>
                                        </div>
                                    </div>

                                    {/* Body & Actions */}
                                    <div className="px-6 md:px-8 space-y-4 flex-grow">
                                        {/* Phần điều kiện doanh thu/đơn hàng  */}
                                        <div className="bg-blue-50/50 rounded-[24px] p-4 md:p-5 border border-blue-100/50 relative">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Yêu cầu lên hạng</span>
                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${rank.logic === 'AND' ? 'bg-blue-600 text-white border-blue-600' : 'bg-amber-500 text-white border-amber-500'}`}>
                                                    {rank.logic === 'AND' ? 'ĐẠT CẢ 2' : 'ĐẠT 1 TRONG 2'}
                                                </span>
                                            </div>
                                            <div className="space-y-2.5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-1.5 rounded-lg ${rank.logic === 'AND' ? 'bg-blue-100' : 'bg-amber-100'}`}>
                                                        <BarChart3 size={14} className={rank.logic === 'AND' ? 'text-blue-600' : 'text-amber-600'} />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700 truncate">
                                                        {rank.minTotalRevenue?.toLocaleString()} <small>đ</small>
                                                    </span>
                                                </div>
                                                <div className="ml-4 h-4 border-l-2 border-dashed border-slate-200 relative">
                                                    <span className="absolute -left-[9px] top-1/2 -translate-y-1/2 bg-[#fcfdfe] px-1 text-[8px] font-black text-slate-400 uppercase">
                                                        {rank.logic === 'AND' ? 'Và' : 'Hoặc'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-1.5 rounded-lg ${rank.logic === 'AND' ? 'bg-blue-100' : 'bg-amber-100'}`}>
                                                        <ShoppingCart size={14} className={rank.logic === 'AND' ? 'text-blue-600' : 'text-amber-600'} />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700 truncate">
                                                        {rank.minTotalBooking} đơn hàng
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-slate-900 rounded-[20px] p-3 md:p-4 text-center">
                                                <span className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Ví thấu chi</span>
                                                <span className="text-xs md:text-sm font-black text-white whitespace-nowrap">{rank.creditLimit?.toLocaleString()}đ</span>
                                            </div>
                                            <div className="bg-orange-50 rounded-[20px] p-3 md:p-4 text-center border border-orange-100">
                                                <span className="block text-[9px] font-bold text-orange-400 uppercase mb-1">Duy trì</span>
                                                <span className="text-xs md:text-sm font-black text-orange-700">{rank.maintainMinBooking} đơn</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 p-6 md:p-8 pt-0 flex gap-2 md:gap-3">
                                        <button onClick={() => { setSelectedRankId(rank.id); setIsEditModalOpen(true); }} className="flex-[3] flex items-center justify-center gap-2 py-3 md:py-3.5 bg-slate-100 text-slate-700 font-bold rounded-xl md:rounded-2xl hover:bg-slate-900 hover:text-white transition-all group/btn text-sm">
                                            <Settings size={16} className="group-hover/btn:rotate-90 transition-transform duration-300"/> Chi tiết
                                        </button>
                                        <button onClick={() => handleSoftDelete(rank, rank.rankName)} className="flex-1 flex items-center justify-center py-3 md:py-3.5 text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white rounded-xl md:rounded-2xl transition-all"><Trash2 size={18}/></button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <AddRankingModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={fetchRanks} />
                <EditRankingDetailModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} rankId={selectedRankId} onSuccess={fetchRanks} />
            </div>
        </div>
    );
};

export default RankingRules;