import React, { useState, useEffect } from 'react';
import {
    Save, Plus, Settings, TrendingUp,
    ShoppingCart, Wallet
} from 'lucide-react';
import AddRankingModal from '@/components/admin/ranking/AddRankingModal.jsx';
import EditRankingModal from '@/components/admin/ranking/EditRankingModal.jsx';

const RankingRules = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedRankId, setSelectedRankId] = useState(null);
    const [rankingData, setRankingData] = useState([]);

    // Giả lập gọi API lấy danh sách hạng
    useEffect(() => {
        const mockData = [
            { id: 1, name: 'Rank S - Diamond', level: 'Cao nhất', color: '#f59e0b', bgColor: 'bg-amber-500', revenue: 5000000000, orders: 200, credit: 500000000, cashback: 1, partners: 15 },
            { id: 2, name: 'Rank A - Gold', level: 'Cao', color: '#f97316', bgColor: 'bg-orange-500', revenue: 1000000000, orders: 50, credit: 200000000, cashback: 0.5, partners: 42 },
            { id: 3, name: 'Rank B - Silver', level: 'Trung bình', color: '#64748b', bgColor: 'bg-slate-500', revenue: 500000000, orders: 20, credit: 100000000, cashback: 0.2, partners: 128 },
            { id: 4, name: 'Rank C - Bronze', level: 'Mới bắt đầu', color: '#60a5fa', bgColor: 'bg-blue-400', revenue: 100000000, orders: 5, credit: 0, cashback: 0.1, partners: 356 },
        ];
        setRankingData(mockData);
    }, []);

    const handleOpenEdit = (id) => {
        setSelectedRankId(id);
        setIsEditModalOpen(true);
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen font-sans">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Quy tắc xếp hạng</h1>
                <p className="text-slate-500 text-sm">Quản lý các cấp bậc thành viên và thiết lập điều kiện thăng hạng</p>
            </div>

            {/* Section 1: Cấu hình chu kỳ */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
                <h2 className="text-lg font-bold mb-4">Cấu hình chu kỳ đánh giá</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">Chu kỳ xét duyệt</label>
                        <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm">
                            <option>Theo Tháng (Xét vào ngày 1 hàng tháng)</option>
                            <option>Theo Quý</option>
                            <option>Theo Năm</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">Đơn vị tiền tệ</label>
                        <input type="text" value="VNĐ" readOnly className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-sm" />
                    </div>
                    <button className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                        <Save size={18} /> Lưu cấu hình
                    </button>
                </div>
            </div>

            {/* Section 2: Thang hạng đối tác */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Thang hạng đối tác</h2>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all text-sm shadow-md shadow-blue-100"
                >
                    <Plus size={18} /> Thêm hạng mới
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {rankingData.map((rank) => (
                    <div
                        key={rank.id}
                        className="bg-white p-5 rounded-2xl shadow-sm border-t-4 hover:shadow-md transition-all relative"
                        style={{ borderTopColor: rank.color }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`${rank.bgColor} p-2 rounded-xl text-white`}>
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">{rank.name}</h3>
                                <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-bold uppercase italic">{rank.level}</span>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                                <TrendingUp size={14} /> Doanh thu {'>'} {rank.revenue.toLocaleString()} / tháng
                            </div>
                            <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                                <ShoppingCart size={14} /> {'>'} {rank.orders} đơn hàng
                            </div>
                            <div className="flex items-center gap-2 text-sm text-purple-600 font-medium">
                                <Wallet size={14} /> Thấu chi {rank.credit > 0 ? (rank.credit/1000000 + 'tr') : '0'}
                            </div>
                            <div className="text-sm text-slate-600 pl-6 font-medium">
                                Hoàn tiền {rank.cashback}%
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                            <span className="text-xs text-slate-400 font-medium">{rank.partners} Đại lý</span>
                            <button
                                onClick={() => handleOpenEdit(rank.id)}
                                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all"
                            >
                                <Settings size={14} /> Sửa
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Thêm mới */}
            <AddRankingModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />

            {/* Modal Chỉnh sửa & Chi tiết */}
            <EditRankingModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                rankId={selectedRankId}
            />
        </div>
    );
};

export default RankingRules;