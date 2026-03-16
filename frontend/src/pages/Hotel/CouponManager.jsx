import React, { useState, useEffect } from "react";
import { Edit, Trash2, Globe, Lock, Loader2, Plus } from "lucide-react";
import CreateCouponModal from "@/components/hotel/coupon/CreateCouponModal.jsx";
import UpdateCouponModal from "@/components/hotel/coupon/UpdateCouponModal.jsx";
import { promotionService } from "@/services/coupon.service.js";

export default function CouponManagement() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [selectedCouponId, setSelectedCouponId] = useState(null);
    const [activeTab, setActiveTab] = useState("RUNNING");
    const [coupons, setCoupons] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCoupons = async () => {
        setIsLoading(true);
        try {
            const res = await promotionService.getPromotionsByHotel();
            const data = res.result || [];

            let filtered = [];
            if (activeTab === "RUNNING") {
                filtered = data.filter(c => c.status === "ACTIVE" && !c.isDeleted);
            } else if (activeTab === "FINISHED") {
                filtered = data.filter(c => c.status === "INACTIVE" || c.isDeleted);
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
    }, [activeTab]);

    const handleOpenUpdate = (id) => {
        setSelectedCouponId(id);
        setIsUpdateOpen(true);
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Bạn có chắc chắn muốn xóa mã này không?")) return;
        try {
            await promotionService.deletePromotion(id);
            await fetchCoupons();
        } catch (error) {
            alert("Lỗi khi xóa khuyến mãi!");
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto w-full font-sans bg-slate-50/30 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý mã giảm giá</h1>
                    <p className="text-slate-500 text-sm mt-1">Quản lý chương trình khuyến mãi cho đại lý</p>
                </div>
                <button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-sm transition-all">
                    <Plus size={18} /> Tạo mã mới
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Chỉ giữ 2 Tab: Đang chạy (Active) và Đã kết thúc (Inactive) */}
                <div className="flex border-b border-slate-200 bg-white">
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
                    <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase font-bold tracking-wider border-b border-slate-100">
                                <th className="p-4">Mã Code</th>
                                <th className="p-4">Mức giảm</th>
                                <th className="p-4">Thời hạn</th>
                                <th className="p-4">Lượt dùng</th>
                                <th className="p-4 text-center">Đối tượng</th>
                                <th className="p-4 text-center">Trạng thái</th>
                                <th className="p-4 text-center">Hành động</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {coupons.map((coupon) => (
                                <tr key={coupon.id} className="hover:bg-slate-50/30 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800">{coupon.code}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-semibold text-slate-700">
                                            {coupon.discountVal?.toLocaleString()}{coupon.typeDiscount === 'PERCENT' ? '%' : 'đ'}
                                        </div>
                                        {coupon.maxDiscount > 0 && (
                                            <div className="text-[10px] text-slate-400">Tối đa {coupon.maxDiscount.toLocaleString()}đ</div>
                                        )}
                                    </td>
                                    <td className="p-4 text-slate-600 text-[13px]">
                                        <div className="font-medium">
                                            {new Date(coupon.applyStartDate).toLocaleDateString('vi-VN').slice(0, 5)} - {new Date(coupon.applyEndDate).toLocaleDateString('vi-VN')}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="text-[11px] text-slate-500 font-medium">
                                                {coupon.usedCount || 0} / {coupon.maxUsage}
                                            </div>
                                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 transition-all"
                                                     style={{ width: `${Math.min(((coupon.usedCount || 0) / coupon.maxUsage) * 100, 100)}%` }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                                                coupon.typePromotion === "PUBLIC" ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-purple-50 text-purple-600 border-purple-100"
                                            }`}>
                                                {coupon.typePromotion === "PUBLIC" ? <Globe size={12}/> : <Lock size={12}/>}
                                                {coupon.typePromotion}
                                            </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-center">
                                            <div
                                                className={`w-9 h-5 rounded-full relative transition-colors cursor-not-allowed ${coupon.status === 'ACTIVE' ? 'bg-blue-600' : 'bg-slate-300'}`}
                                            >
                                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${coupon.status === 'ACTIVE' ? 'left-5' : 'left-1'}`} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-3">
                                            <button onClick={() => handleOpenUpdate(coupon.id)} className="text-slate-400 hover:text-blue-600 transition-colors"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(coupon.id)} className="text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        {coupons.length === 0 && (
                            <div className="p-20 text-center text-slate-400 italic text-sm">Không có dữ liệu khuyến mãi</div>
                        )}
                    </div>
                )}
            </div>

            <CreateCouponModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={fetchCoupons} />
            <UpdateCouponModal
                isOpen={isUpdateOpen}
                couponId={selectedCouponId}
                onClose={() => {
                    setIsUpdateOpen(false);
                    setSelectedCouponId(null);
                }}
                onSuccess={fetchCoupons}
            />
        </div>
    );
}