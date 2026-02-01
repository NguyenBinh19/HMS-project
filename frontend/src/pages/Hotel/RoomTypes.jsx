import {
    Plus, Loader2, Pencil, Trash2,
    User, Baby, Building2
} from "lucide-react";
import { useEffect, useState } from "react";
// Import cả 2 Modal: Thêm mới và Chi tiết
import RoomTypeModal from "@/components/hotel/roomTypes/RoomTypeModal.jsx";
import RoomTypeDetailModal from "@/components/hotel/roomTypes/RoomTypeModalDetail.jsx";
import { roomTypeService } from "@/services/roomtypes.service.js";

const HOTEL_ID = 1;

const ManageRoomTypes = () => {
    const [roomTypes, setRoomTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    // State quản lý Modal
    const [showAddModal, setShowAddModal] = useState(false); // Modal Thêm mới
    const [selectedRoomId, setSelectedRoomId] = useState(null); // Modal Chi tiết (Nếu có ID thì mở)

    const fetchRoomTypes = async () => {
        try {
            setLoading(true);
            const res = await roomTypeService.getRoomTypesByHotelId(HOTEL_ID);
            const dataList = res?.result || [];

            const mappedData = dataList.map(item => {
                const rawStatus = item.room_status || item.roomStatus || '';
                const isActive = rawStatus.toLowerCase() === 'active';

                return {
                    ...item,
                    id: item.roomTypeId || item.room_type_id,
                    title: item.roomTitle || item.room_title,
                    area: item.room_area || item.roomArea || 0,
                    adults: item.max_adults || item.maxAdults || 0,
                    children: item.max_children  || 0,
                    totalRooms: item.total_rooms || item.totalRooms || 0,
                    isActive: isActive
                };
            });

            setRoomTypes(mappedData);
        } catch (err) {
            console.error("Lỗi tải danh sách phòng:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoomTypes();
    }, []);

    // Mở modal Thêm mới
    const handleAddNew = () => {
        setShowAddModal(true);
    };

    // Mở modal Chi tiết/Sửa (Nhận ID từ item)
    const handleEdit = (item) => {
        setSelectedRoomId(item.id);
    };

    // Callback khi thêm/sửa thành công
    const handleSuccess = () => {
        fetchRoomTypes();
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-900">
            <div className="max-w-7xl mx-auto">

                {/* HEADER TITLE */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-800 mb-2">
                        Quản lý phòng
                    </h1>
                    <p className="text-slate-500 font-medium text-[15px]">
                        Quản lý và tối ưu hóa các hạng phòng của khách sạn để tăng tỷ lệ chuyển đổi
                    </p>
                </div>

                {/* MAIN CARD */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">

                    {/* CARD HEADER */}
                    <div className="flex flex-row justify-between items-center p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800">
                            Quản lý Hạng phòng (Inventory Setup)
                        </h2>

                        <button
                            onClick={handleAddNew}
                            className="flex items-center gap-1 text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                            <Plus size={16} strokeWidth={3} />
                            Thêm hạng phòng mới
                        </button>
                    </div>

                    {/* TABLE LIST */}
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                                <Loader2 className="animate-spin mb-2" size={24} />
                                Đang tải dữ liệu...
                            </div>
                        ) : roomTypes.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">
                                Chưa có dữ liệu loại phòng nào.
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                <tr className="text-sm font-semibold text-slate-500 border-b border-slate-100">
                                    <th className="px-6 py-5 w-[30%]">Thông tin</th>
                                    <th className="px-6 py-5 w-[30%]">Sức chứa</th>
                                    <th className="px-6 py-5 w-[15%]">Số lượng vật lý</th>
                                    <th className="px-6 py-5 w-[15%]">Trạng thái</th>
                                    <th className="px-6 py-5 w-[10%]">Hành động</th>
                                </tr>
                                </thead>
                                <tbody className="text-sm">
                                {roomTypes.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">

                                        {/* CỘT 1: THÔNG TIN */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900 flex-shrink-0 mt-1">
                                                    <Building2 size={24} strokeWidth={2} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 text-[15px] mb-1">
                                                        {item.title}
                                                    </div>
                                                    <div className="text-slate-400 text-xs font-semibold">
                                                        {item.area}m²
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* CỘT 2: SỨC CHỨA */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-6 text-slate-700">
                                                <div className="flex items-center gap-1.5">
                                                    <User size={15} fill="currentColor" className="text-slate-900" />
                                                    <span className="font-medium text-[14px]">x{item.adults} Người lớn</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Baby size={16} className="text-slate-900" strokeWidth={2.5} />
                                                    <span className="font-medium text-[14px]">x{item.children} Trẻ em</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* CỘT 3: SỐ LƯỢNG */}
                                        <td className="px-6 py-5">
                                            <span className="text-slate-800 font-medium text-[15px]">
                                                {item.totalRooms} phòng
                                            </span>
                                        </td>

                                        {/* CỘT 4: TRẠNG THÁI */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className={`
                                                    w-11 h-6 rounded-full relative transition-colors duration-300 cursor-pointer
                                                    ${item.isActive ? 'bg-[#00C16A]' : 'bg-slate-300'}
                                                `}>
                                                    <div className={`
                                                        absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300
                                                        ${item.isActive ? 'left-[22px]' : 'left-0.5'}
                                                    `} />
                                                </div>
                                                <span className="text-xs font-medium text-slate-500">
                                                    {item.isActive ? 'Đang rao' : 'Tạm ẩn'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* CỘT 5: HÀNH ĐỘNG */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="w-8 h-8 flex items-center justify-center rounded bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                                                    title="Chỉnh sửa / Chi tiết"
                                                >
                                                    <Pencil size={14} strokeWidth={2.5} />
                                                </button>

                                                <button
                                                    className="w-8 h-8 flex items-center justify-center rounded bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={14} strokeWidth={2.5} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* --- MODAL 1: THÊM MỚI  --- */}
                {showAddModal && (
                    <RoomTypeModal
                        hotelId={HOTEL_ID}
                        onClose={() => setShowAddModal(false)}
                        onSuccess={handleSuccess}
                    />
                )}

                {/* --- MODAL 2: CHI TIẾT & SỬA  */}
                {selectedRoomId && (
                    <RoomTypeDetailModal
                        roomId={selectedRoomId}
                        onClose={() => setSelectedRoomId(null)}
                        onSuccess={handleSuccess}
                    />
                )}
            </div>
        </div>
    );
};

export default ManageRoomTypes;