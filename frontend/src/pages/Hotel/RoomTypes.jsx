import { Plus, Hotel, Search, Loader2, Sparkles, Filter } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import RoomTypeCard from "@/components/hotel/roomTypes/RoomTypeCard.jsx";
import RoomTypeModal from "@/components/hotel/roomTypes/RoomTypeModal.jsx";
import { roomTypeService } from "@/services/roomtypes.service.js";

const HOTEL_ID = 1;

const ManageRoomTypes = () => {
    const [roomTypes, setRoomTypes] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchRoomTypes = async () => {
        try {
            setLoading(true);
            const res = await roomTypeService.getRoomTypesByHotelId(HOTEL_ID);
            setRoomTypes(res?.result || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoomTypes();
    }, []);

    // Lọc danh sách theo từ khóa tìm kiếm
    const filteredRoomTypes = useMemo(() => {
        return roomTypes.filter(rt =>
            rt.roomTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rt.roomCode.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [roomTypes, searchTerm]);

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* --- TOP BAR DECORATION --- */}
            <div className="h-48 bg-gradient-to-r from-blue-700 to-blue-900 absolute top-0 left-0 right-0 -z-10" />

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">

                {/* --- HEADER SECTION --- */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 text-white">
                    <div>
                        <h1 className="text-3xl font-extrabold flex items-center gap-3">
                            Quản Lý Loại Phòng
                        </h1>
                        <p className="text-blue-100 mt-2 max-w-xl text-lg font-light opacity-90">
                            Thiết lập và quản lý các hạng phòng, giá cả và tiện ích.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20 text-sm font-medium">
                            Tổng số: <span className="font-bold text-white text-lg ml-1">{roomTypes.length}</span>
                        </div>
                        <button
                            onClick={() => setOpen(true)}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl
                            bg-white text-blue-700 font-bold shadow-lg shadow-blue-900/20
                            hover:bg-blue-50 hover:shadow-xl transition-all active:scale-95"
                        >
                            <Plus size={20} strokeWidth={3} />
                            Thêm Mới
                        </button>
                    </div>
                </div>

                {/* --- TOOLBAR (SEARCH) --- */}
                <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-200 mb-8 flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên phòng hoặc mã..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-slate-50 transition-colors"
                        />
                    </div>
                </div>

                {/* --- CONTENT AREA --- */}
                {loading ? (
                    /* SKELETON LOADING STATE */
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-[280px] animate-pulse flex flex-col gap-4">
                                <div className="h-6 w-2/3 bg-slate-200 rounded" />
                                <div className="h-4 w-1/3 bg-slate-100 rounded" />
                                <div className="flex-1 bg-slate-50 rounded-xl mt-2" />
                                <div className="flex gap-2 mt-2">
                                    <div className="h-8 w-20 bg-slate-200 rounded-lg" />
                                    <div className="h-8 w-20 bg-slate-200 rounded-lg" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : roomTypes.length === 0 ? (
                    /* EMPTY STATE (NO DATA) */
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm">
                        <div className="bg-blue-50 p-6 rounded-full mb-4">
                            <Sparkles className="text-blue-500" size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Chưa có loại phòng nào</h3>
                        <p className="text-slate-500 mt-2 mb-8 text-center max-w-sm">
                            Hệ thống chưa ghi nhận loại phòng nào. Hãy bắt đầu bằng cách tạo loại phòng đầu tiên.
                        </p>
                        <button
                            onClick={() => setOpen(true)}
                            className="px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-1 transition-all"
                        >
                            Tạo ngay
                        </button>
                    </div>
                ) : filteredRoomTypes.length === 0 ? (
                    /* EMPTY SEARCH RESULT */
                    <div className="text-center py-20">
                        <p className="text-slate-500 text-lg">Không tìm thấy loại phòng nào phù hợp với "{searchTerm}"</p>
                        <button
                            onClick={() => setSearchTerm("")}
                            className="text-blue-600 font-semibold mt-2 hover:underline"
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                ) : (
                    /* CARD GRID */
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredRoomTypes.map((roomType) => (
                            <RoomTypeCard
                                key={roomType.roomTypeId}
                                roomType={roomType}
                                onRefresh={fetchRoomTypes}
                            />
                        ))}
                    </div>
                )}

                {/* MODAL */}
                {open && (
                    <RoomTypeModal
                        hotelId={HOTEL_ID}
                        onClose={() => setOpen(false)}
                        onSuccess={fetchRoomTypes}
                    />
                )}
            </div>
        </div>
    );
};

export default ManageRoomTypes;