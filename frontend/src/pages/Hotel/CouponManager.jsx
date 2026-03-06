import React, { useState, useEffect } from "react";
import { Edit, Trash2, Globe, Lock, Loader2, Plus } from "lucide-react";
import CreateCouponModal from "@/components/hotel/coupon/CreateCouponModal.jsx";
import UpdateCouponModal from "@/components/hotel/coupon/UpdateCouponModal.jsx";
import { promotionService } from "@/services/coupon.service.js";

export default function CouponManagement({ hotelId = 2 }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [selectedCouponId, setSelectedCouponId] = useState(null);
    const [activeTab, setActiveTab] = useState("RUNNING");

    const [coupons, setCoupons] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCoupons = async () => {
        setIsLoading(true);
        try {
            const res = await promotionService.getPromotionsByHotel(hotelId);
            const data = res.result || [];

            const now = new Date();
            let filtered = [];

            if (activeTab === "RUNNING") {
                filtered = data.filter(c => c.status === "ACTIVE" && new Date(c.startDate) <= now && new Date(c.endDate) >= now);
            } else if (activeTab === "FINISHED") {
                filtered = data.filter(c => c.status === "INACTIVE" || new Date(c.endDate) < now);
            }
            setCoupons(filtered);
        } catch (error) {
            console.error("Lỗi lấy danh sách:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, [activeTab, hotelId]);

    const handleOpenUpdate = (id) => {
        setSelectedCouponId(id);
        setIsUpdateOpen(true);
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn mã khuyến mãi này?")) return;
        try {
            await promotionService.deletePromotion(id);
            setCoupons(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            alert("Lỗi khi xóa!");
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto w-full font-sans">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Quản lý mã giảm giá</h1>
                    <p className="text-slate-500 text-sm mt-1">Quản lý chương trình khuyến mãi cho đại lý</p>
                </div>
                <button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100 transition-all">
                    <Plus size={18} /> Tạo mã mới
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-slate-200 bg-slate-50/50">
                    {[
                        { id: 'RUNNING', label: 'Đang chạy' },
                        { id: 'FINISHED', label: 'Đã kết thúc' },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`px-8 py-4 text-sm font-bold transition-all relative ${activeTab === tab.id ? "text-blue-600" : "text-slate-500 hover:text-slate-700"}`}>
                            {tab.label}
                            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="p-20 flex flex-col items-center justify-center text-slate-400">
                        <Loader2 className="animate-spin mb-3" size={40} />
                        <p className="font-medium italic">Đang tải danh sách khuyến mãi...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/30">
                            <tr className="text-slate-400 text-[10px] uppercase tracking-widest border-b border-slate-100">
                                <th className="p-4 font-bold">Mã Code</th>
                                <th className="p-4 font-bold">Mức giảm</th>
                                <th className="p-4 font-bold">Thời hạn</th>
                                <th className="p-4 font-bold text-center">Lượt dùng</th>
                                <th className="p-4 font-bold text-center">Đối tượng</th>
                                <th className="p-4 font-bold text-center">Hành động</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-sm">
                            {coupons.map((coupon) => (
                                <tr key={coupon.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-black text-slate-800">{coupon.code}</div>
                                        {/*<div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 italic">{coupon.name}</div>*/}
                                    </td>
                                    <td className="p-4 font-bold text-blue-600 text-base">
                                        {/* Chỉ hiển thị discountVal, thêm dấu % hoặc đ tùy logic của bạn */}
                                        {coupon.discountVal?.toLocaleString()}{coupon.typeDiscount === 'PERCENT' ? '%' : 'đ'}
                                    </td>
                                    <td className="p-4 text-[12px] text-slate-600 font-medium leading-relaxed">
                                        <div>{new Date(coupon.startDate).toLocaleDateString('vi-VN')}</div>
                                        <div className="text-slate-300">đến</div>
                                        <div>{new Date(coupon.endDate).toLocaleDateString('vi-VN')}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col items-center gap-1.5">
                                            <span className="text-[11px] font-bold text-slate-500">
                                                {coupon.usedCount || 0} / {coupon.maxUsage}
                                            </span>
                                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 rounded-full transition-all duration-700"
                                                     style={{ width: `${Math.min(((coupon.usedCount || 0) / coupon.maxUsage) * 100, 100)}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                                coupon.typePromotion === "PUBLIC" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                            }`}>
                                                {coupon.typePromotion === "PUBLIC" ? <Globe size={12}/> : <Lock size={12}/>}
                                                {coupon.typePromotion}
                                            </span>
                                    </td>
                                    <td className="p-4">
                                        {/* Đã loại bỏ opacity-0, icon đổi sang màu slate-800 để rõ nét */}
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleOpenUpdate(coupon.id)}
                                                className="p-2 text-slate-800 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Sửa"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(coupon.id)}
                                                className="p-2 text-slate-800 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Xóa"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        {coupons.length === 0 && (
                            <div className="p-20 text-center text-slate-400 italic text-sm">Không tìm thấy mã giảm giá nào trong mục này</div>
                        )}
                    </div>
                )}
            </div>

            <CreateCouponModal isOpen={isCreateOpen} hotelId={hotelId} onClose={() => setIsCreateOpen(false)} onSuccess={fetchCoupons} />

            <UpdateCouponModal isOpen={isUpdateOpen} couponId={selectedCouponId} onClose={() => { setIsUpdateOpen(false); setSelectedCouponId(null); }} onSuccess={fetchCoupons} />
        </div>
    );
}