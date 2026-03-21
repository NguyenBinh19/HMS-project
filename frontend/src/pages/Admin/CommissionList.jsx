import React, { useEffect, useState } from 'react';
import {
    Plus,
    Edit2,
    Archive,
    AlertCircle,
    Loader2,
    Info, PlayCircle
} from 'lucide-react';
import { commissionService } from '@/services/commission.service.js';
import AddCommissionModal from '@/components/admin/commission/AddCommissionModal';
import CommissionModalForm from '@/components/admin/commission/CommissionModalForm';
import { format } from 'date-fns';

const CommissionList = () => {
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    // confirmModal lưu ID và số lượng hotel
    const [confirmModal, setConfirmModal] = useState({ show: false, id: null, hotelCount: 0 });

    const hasDefault = commissions.some(item => item.commissionType === 'DEFAULT');

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await commissionService.getAllCommissions();
            setCommissions(res.result || []);
        } catch (error) {
            alert("Không thể tải danh sách hoa hồng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const openArchiveConfirm = async (item) => {
        const { commissionId, commissionType, hotelCount } = item;

        if (commissionType === 'DEAL') {
            try {
                const res = await commissionService.getHotelsUsingDeal(commissionId);
                // Nếu API trả về mảng trong res.result
                const count = res.result?.length || 0;
                setConfirmModal({ show: true, id: commissionId, hotelCount: count });
            } catch (error) {
                setConfirmModal({ show: true, id: commissionId, hotelCount: hotelCount || 0 });
            }
        } else {
            setConfirmModal({ show: true, id: commissionId, hotelCount: hotelCount || 0 });
        }
    };

    const handleArchive = async () => {
        try {
            await commissionService.deleteCommission(confirmModal.id, {
                reason: "Ngừng áp dụng và đưa vào lưu trữ hệ thống"
            });
            alert("Đã chuyển chính sách vào mục lưu trữ thành công");
            setConfirmModal({ show: false, id: null, hotelCount: 0 });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi khi thực hiện lưu trữ");
        }
    };

    const renderTypeTag = (type) => {
        const styles = {
            DEAL: "bg-orange-100 text-orange-700 border-orange-200",
            HOTEL: "bg-blue-100 text-blue-700 border-blue-200",
            DEFAULT: "bg-green-100 text-green-700 border-green-200"
        };
        const labels = {
            DEAL: "Khuyến mãi (DEAL)",
            HOTEL: "Theo khách sạn",
            DEFAULT: "Mặc định hệ thống"
        };
        return (
            <span className={`px-2 py-1 rounded-md text-[10px] font-black border uppercase ${styles[type] || ""}`}>
                {labels[type] || type}
            </span>
        );
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Quản lý chính sách hoa hồng</h2>
                        <p className="text-[11px] text-red-500 font-bold italic mt-1 uppercase tracking-wider">
                            Lưu ý: Mỗi thời điểm chỉ tồn tại duy nhất một chính sách mặc định!
                        </p>
                    </div>
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl transition-all font-bold text-sm shadow-lg shadow-gray-200"
                    >
                        <Plus size={18} /> Thêm mới
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                        <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Loại hình</th>
                            <th className="px-6 py-4">Giá trị</th>
                            <th className="px-6 py-4">Hiệu lực</th>
                            <th className="px-6 py-4">Trạng thái</th>
                            <th className="px-6 py-4 text-center">Thao tác</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-20 text-center">
                                    <Loader2 className="animate-spin mx-auto text-blue-500 mb-2" size={32} />
                                    <span className="text-xs font-bold text-gray-400 uppercase">Đang tải dữ liệu...</span>
                                </td>
                            </tr>
                        ) : commissions.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-20 text-center text-gray-400 font-bold uppercase text-xs">Trống</td>
                            </tr>
                        ) : (
                            commissions.map((item) => (
                                <tr key={item.commissionId}
                                    className={`hover:bg-gray-50/50 transition-colors ${!item.isActive ? 'opacity-60 bg-gray-50/30' : ''}`}>
                                    <td className="px-6 py-4 font-black text-xs text-gray-400">#{item.commissionId}</td>
                                    <td className="px-6 py-4">{renderTypeTag(item.commissionType)}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className="font-black text-gray-900 text-base">{item.commissionValue.toLocaleString()}</span>
                                        <span
                                            className="ml-1 text-gray-400 font-bold text-xs">{item.rateType === 'PERCENT' ? '%' : 'VND'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold">
                                        {item.startDate ? (
                                            <div className="flex flex-col">
                                                <span
                                                    className="text-gray-700">{format(new Date(item.startDate), 'dd/MM/yyyy')}</span>
                                                <span
                                                    className="text-gray-400 font-medium italic">đến {format(new Date(item.endDate), 'dd/MM/yyyy')}</span>
                                            </div>
                                        ) : <span className="text-blue-500 uppercase text-[9px]">Vĩnh viễn</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${item.isActive ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                                                <div
                                                    className={`w-1.5 h-1.5 rounded-full ${item.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}/>
                                                {item.isActive ? 'Hoạt động' : 'Đã Lưu trữ'}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center gap-1">
                                            <button
                                                onClick={() => {
                                                    setSelectedId(item.commissionId);
                                                    setIsEditOpen(true);
                                                }}
                                                className={`p-2 rounded-xl transition-all ${item.isActive ? 'text-gray-400 hover:text-blue-600 hover:bg-blue-50' : 'text-blue-500 hover:bg-blue-50'}`}
                                                title={item.isActive ? "Chỉnh sửa" : "Xem chi tiết"}
                                            >
                                                {item.isActive ? <Edit2 size={16}/> : <Info size={18}/>}
                                            </button>

                                            {/* NÚT KÍCH HOẠT RIÊNG CHO DEAL KHI ĐANG TẮT */}
                                            {item.commissionType === 'DEAL' && !item.isActive && (
                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm("Kích hoạt lại gói Deal này?")) {
                                                            try {
                                                                await commissionService.activeCommission(item.commissionId);
                                                                alert("Kích hoạt thành công!");
                                                                fetchData();
                                                            } catch (e) {
                                                                alert("Lỗi khi kích hoạt");
                                                            }
                                                        }
                                                    }}
                                                    className="p-2 text-green-500 hover:bg-green-50 rounded-xl"
                                                    title="Kích hoạt lại Deal"
                                                >
                                                    <PlayCircle size={18}/>
                                                </button>
                                            )}

                                            {item.commissionType !== 'DEFAULT' && item.isActive && (
                                                <button onClick={() => openArchiveConfirm(item)}
                                                        className="p-2 text-gray-400 hover:text-red-500">
                                                    <Archive size={16}/>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Confirm Archive */}
            {confirmModal.show && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div
                        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center border border-gray-100">
                        <AlertCircle size={48} className="mx-auto text-red-500 mb-4"/>
                        <h3 className="text-xl font-black text-gray-800 uppercase mb-2">Xác nhận lưu trữ?</h3>
                        <div className="p-4 bg-gray-50 rounded-2xl mb-6">
                            <p className="text-xs text-gray-600 font-medium italic">
                                ⚠️ Hiện tại đang có <span
                                className="font-black text-red-500">{confirmModal.hotelCount} khách sạn</span> đang sử
                                dụng chính sách này.
                            </p>
                        </div>
                        <p className="text-[11px] text-gray-400 font-bold uppercase mb-8 px-4">
                            Việc đưa chính sách vào lưu trữ <span
                            className="text-gray-900">sẽ không làm ảnh hưởng</span> đến các hotel hiện đang sử
                            dụng. <br/>
                            <span className="text-red-600 italic">(Lưu ý: Đã lưu trữ thì không thể chỉnh sửa hoặc kích hoạt lại)</span>
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setConfirmModal({ show: false, id: null, hotelCount: 0 })} className="py-3 bg-gray-100 rounded-2xl font-bold text-xs uppercase">Quay lại</button>
                            <button onClick={handleArchive} className="py-3 bg-red-600 text-white rounded-2xl font-bold text-xs uppercase">Đồng ý lưu trữ</button>
                        </div>
                    </div>
                </div>
            )}

            {isAddOpen && (
                <AddCommissionModal
                    isOpen={isAddOpen}
                    onClose={() => setIsAddOpen(false)}
                    onSuccess={fetchData}
                    hasDefault={hasDefault}
                />
            )}
            {isEditOpen && (
                <CommissionModalForm
                    id={selectedId}
                    isOpen={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                    onSuccess={fetchData}
                />
            )}
        </div>
    );
};

export default CommissionList;