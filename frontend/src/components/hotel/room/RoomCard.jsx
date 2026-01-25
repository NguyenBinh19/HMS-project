import { useState } from "react";
import {
    ChevronDown, Users, DoorClosed,
    Hash, DollarSign, BedDouble, Info, Loader2
} from "lucide-react";
import { roomTypeService } from "@/services/roomtypes.service";

const RoomTypeCard = ({ roomType }) => {
    const [showDetail, setShowDetail] = useState(false);
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleToggleDetail = async () => {
        if (showDetail) {
            setShowDetail(false);
            return;
        }

        // Chỉ gọi API lần đầu tiên mở, các lần sau dùng cache
        if (!detail) {
            try {
                setLoading(true);
                const res = await roomTypeService.getRoomTypeDetail(roomType.roomTypeId);
                setDetail(res.result || res);
            } catch (err) {
                console.error("Load room type detail error", err);
            } finally {
                setLoading(false);
            }
        }
        setShowDetail(true);
    };

    return (
        <div className={`group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col overflow-hidden ${showDetail ? 'ring-2 ring-blue-500/20' : ''}`}>

            {/* --- TOP SECTION (Always Visible) --- */}
            <div className="p-6 pb-4 flex-1">
                {/* Header: Code & Title */}
                <div className="flex justify-between items-start mb-3">
                    <div className="bg-slate-100 text-slate-500 text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                        <Hash size={12} />
                        {roomType.roomCode}
                    </div>
                    <div className={`w-2 h-2 rounded-full ${roomType.roomStatus === 'INACTIVE' ? 'bg-red-400' : 'bg-green-500'}`} />
                </div>

                <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-700 transition-colors mb-4 line-clamp-2">
                    {roomType.roomTitle}
                </h3>

                {/* Price Section */}
                <div className="flex items-baseline gap-1 pt-2 border-t border-slate-100">
                    <span className="text-2xl font-extrabold text-blue-900">
                        {roomType.basePrice?.toLocaleString()}
                    </span>
                    <span className="text-sm font-medium text-slate-400">VNĐ / đêm</span>
                </div>
            </div>

            {/* --- ACTION BUTTON --- */}
            <div
                onClick={handleToggleDetail}
                className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between cursor-pointer hover:bg-blue-50 transition-colors group/btn"
            >
                <span className="text-sm font-semibold text-slate-600 group-hover/btn:text-blue-700">
                    {showDetail ? "Thu gọn" : "Xem chi tiết"}
                </span>
                <ChevronDown
                    size={18}
                    className={`text-slate-400 group-hover/btn:text-blue-600 transition-transform duration-300 ${showDetail ? 'rotate-180' : ''}`}
                />
            </div>

            {/* --- DETAIL SECTION --- */}
            {showDetail && (
                <div className="bg-slate-50/50 px-6 pb-6 pt-2 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
                    {loading ? (
                        /* Skeleton Loading Effect */
                        <div className="space-y-3 py-2">
                            <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse" />
                            <div className="h-4 bg-slate-200 rounded w-1/2 animate-pulse" />
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="h-10 bg-slate-200 rounded animate-pulse" />
                                <div className="h-10 bg-slate-200 rounded animate-pulse" />
                            </div>
                        </div>
                    ) : (
                        /* Loaded Content */
                        <div className="space-y-4">
                            {/* Description */}
                            <div className="relative pl-3 border-l-2 border-blue-200 mt-2">
                                <p className="text-sm text-slate-600 leading-relaxed italic">
                                    "{detail?.description || "Chưa có mô tả chi tiết cho loại phòng này."}"
                                </p>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                                    <Users size={20} className="text-blue-500 mb-1" />
                                    <span className="text-xs text-slate-400">Sức chứa</span>
                                    <span className="font-bold text-slate-800">{detail?.maxGuest} khách</span>
                                </div>

                                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                                    <DoorClosed size={20} className="text-orange-500 mb-1" />
                                    <span className="text-xs text-slate-400">Số lượng</span>
                                    <span className="font-bold text-slate-800">{detail?.totalRooms} phòng</span>
                                </div>
                            </div>

                            {/* Status Badge Full */}
                            <div className="flex justify-end pt-2">
                                <span className={`
                                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border
                                    ${detail?.roomStatus === "ACTIVE"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-slate-100 text-slate-500 border-slate-200"}
                                `}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${detail?.roomStatus === "ACTIVE" ? "bg-green-500" : "bg-slate-400"}`} />
                                    {detail?.roomStatus === "ACTIVE" ? "Đang hoạt động" : "Ngưng hoạt động"}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RoomTypeCard;