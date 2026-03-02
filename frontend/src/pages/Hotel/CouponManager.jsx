import React, { useState, useEffect } from "react";
import { Edit, Trash2, Globe, Lock, Loader2 } from "lucide-react";
import CreateCouponModal from "@/components/hotel/coupon/CreateCouponModal.jsx";
import { couponApi } from "@/services/coupon.service.js";

export default function CouponManagement() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("running");

    // State quản lý dữ liệu từ API
    const [coupons, setCoupons] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Lấy dữ liệu
    const fetchCoupons = async () => {
        setIsLoading(true);
        try {
            const data = await couponApi.getCoupons({ status: activeTab });
            setCoupons(data);
        } catch (error) {
            console.error("Lỗi:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, [activeTab]);

    // Bật/Tắt trạng thái
    const handleToggleStatus = async (id, currentStatus) => {
        // Cập nhật giao diện trước cho mượt (Optimistic Update)
        setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));
        try {
            await couponApi.toggleStatus(id, !currentStatus);
        } catch (error) {
            setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: currentStatus } : c)); // Hoàn tác nếu lỗi
            alert("Lỗi khi đổi trạng thái!");
        }
    };

    // Xóa mã
    const handleDelete = async (id) => {
        if(!window.confirm("Bạn có chắc chắn muốn xóa mã này?")) return;
        try {
            await couponApi.deleteCoupon(id);
            setCoupons(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            alert("Lỗi khi xóa!");
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto w-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Quản lý mã giảm giá
                    </h1>
                    <p className="text-slate-500 font-medium text-[15px] mt-1">
                        Quản lý chương trình khuyến mãi cho đại lý
                    </p>
                </div>
                <button onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium">
                    Tạo mã mới
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-slate-200 px-4">
                    {['running', 'ended', 'scheduled'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-4 text-sm font-medium border-b-2 capitalize ${
                                activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500"
                            }`}
                        >
                            {tab === 'running' ? 'Đang chạy' : tab === 'ended' ? 'Đã kết thúc' : 'Đã lên lịch'}
                        </button>
                    ))}
                </div>

                {/* Table & Loading */}
                {isLoading ? (
                    <div className="p-12 flex flex-col items-center justify-center text-slate-500">
                        <Loader2 className="animate-spin mb-2" size={32} />
                        <p>Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                                <th className="p-4 font-semibold">Mã Code</th>
                                <th className="p-4 font-semibold">Mức giảm</th>
                                <th className="p-4 font-semibold">Thời hạn</th>
                                <th className="p-4 font-semibold">Lượt dùng</th>
                                <th className="p-4 font-semibold text-center">Đối tượng</th>
                                <th className="p-4 font-semibold text-center">Trạng thái</th>
                                <th className="p-4 font-semibold text-center">Hành động</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {coupons.map((coupon) => (
                                <tr key={coupon.id} className="hover:bg-slate-50/50">
                                    <td className="p-4 font-bold text-slate-800">{coupon.code}</td>
                                    <td className="p-4 text-slate-600 text-sm">{coupon.discount}</td>
                                    <td className="p-4 text-slate-600 text-sm">{coupon.duration}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-500 w-24">
                                                    {coupon.usage.used} / {coupon.usage.total}
                                                </span>
                                            <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-600" style={{ width: `${(coupon.usage.used / coupon.usage.total) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                                coupon.target.isPublic ? "bg-indigo-50 text-indigo-600" : "bg-purple-50 text-purple-600"
                                            }`}>
                                                {coupon.target.isPublic ? <Globe size={12}/> : <Lock size={12}/>}
                                                {coupon.target.type}
                                            </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div
                                            onClick={() => handleToggleStatus(coupon.id, coupon.isActive)}
                                            className={`w-10 h-5 rounded-full relative cursor-pointer mx-auto ${coupon.isActive ? 'bg-blue-600' : 'bg-slate-300'}`}
                                        >
                                            <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-all ${coupon.isActive ? 'left-[22px]' : 'left-[3px]'}`}></div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-3">
                                            <button className="text-blue-600"><Edit size={16} /></button>
                                            <button onClick={() => handleDelete(coupon.id)} className="text-red-500"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {coupons.length === 0 && (
                                <tr><td colSpan="7" className="p-8 text-center text-slate-500">Không có dữ liệu</td></tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal tạo mã */}
            <CreateCouponModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => { setIsModalOpen(false); fetchCoupons(); }}
            />
        </div>
    );
}