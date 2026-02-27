import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, addDays, parseISO, differenceInSeconds, isBefore, isAfter } from "date-fns";
import {
    MapPin, Wifi, Coffee, Users, Snowflake,
    Maximize, Minus, Plus, Clock,
    Star, Utensils, Check, BedDouble, Calendar as CalendarIcon,
    ChevronRight, Image as ImageIcon, Info, AlertCircle
} from "lucide-react";
import GalleryModal from "../../components/common/Hotel/GalleryModal.jsx";
import publicApi from "../../services/publicApi.config";
import { bookingService } from "@/services/booking.service";
import { roomTypeService } from "@/services/roomtypes.service.js";

import Header from "../../components/common/Homepage/Header";
import AgencySidebar from "../../components/common/Hotel/AgencySidebar";

// --- 1. SUB-COMPONENT: TIMER MODAL ---
const BookingTimerModal = ({ expiredAt, onExpire, onExtend, isExtending }) => {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (!expiredAt) return;
        const interval = setInterval(() => {
            const now = new Date();
            const end = typeof expiredAt === 'string' ? parseISO(expiredAt) : expiredAt;
            const diff = differenceInSeconds(end, now);
            if (diff <= 0) {
                clearInterval(interval);
                setTimeLeft(0);
                onExpire();
            } else {
                setTimeLeft(diff);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [expiredAt]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300 text-center">
                <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <Clock className="text-blue-600 w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-800">Đang giữ phòng</h3>
                <p className="text-slate-500 text-sm mt-2 font-medium">Phiên giữ phòng đã bắt đầu. Vui lòng hoàn tất trong thời gian quy định.</p>
                <div className={`text-6xl font-mono font-black my-8 ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-blue-600'}`}>
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
                <div className="space-y-3">
                    <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg transition-all active:scale-95">TIẾP TỤC THANH TOÁN</button>
                    <button onClick={onExtend} disabled={isExtending || timeLeft <= 0} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
                        {isExtending ? <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div> : "GIA HẠN THÊM"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- 2. MAIN COMPONENT ---
export default function HotelDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [openGallery, setOpenGallery] = useState(false);
    const [hotel, setHotel] = useState(null);
    const [roomTypes, setRoomTypes] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(true);

    const [dates, setDates] = useState({
        checkIn: format(new Date(), 'yyyy-MM-dd'),
        checkOut: format(addDays(new Date(), 1), 'yyyy-MM-dd')
    });
    const [tempDates, setTempDates] = useState({ ...dates });

    const [selectedRooms, setSelectedRooms] = useState([]);
    const [bookingSession, setBookingSession] = useState(null);
    const [isExtending, setIsExtending] = useState(false);

    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    // Tính toán tổng tiền dự kiến dựa trên mảng selectedRooms
    const totalEstimatedPrice = useMemo(() => {
        return selectedRooms.reduce((total, item) => total + (item.price * item.count), 0);
    }, [selectedRooms]);

    const handleUpdateDates = () => {
        const checkIn = parseISO(tempDates.checkIn);
        const checkOut = parseISO(tempDates.checkOut);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (isBefore(checkIn, today)) {
            alert("Ngày nhận phòng không được ở quá khứ.");
            return;
        }
        if (!isAfter(checkOut, checkIn)) {
            alert("Ngày trả phòng phải sau ngày nhận ít nhất 1 đêm.");
            return;
        }
        setDates(tempDates);
        setSelectedRooms([]); // Reset lựa chọn khi đổi ngày vì giá/số lượng có thể thay đổi
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoadingRooms(true);
            try {
                const [hotelRes, staticRoomsData, availabilityData] = await Promise.all([
                    publicApi.get(`/hotels/${id}`),
                    roomTypeService.getRoomTypesDetailByHotelId(id),
                    bookingService.checkAvailability({
                        hotelId: Number(id),
                        checkIn: dates.checkIn,
                        checkOut: dates.checkOut
                    })
                ]);

                setHotel(hotelRes.data.result);
                const staticList = staticRoomsData.result || [];
                const dynamicList = availabilityData.result || [];

                const mergedRooms = staticList.map(staticRoom => {
                    const dynamicRoom = dynamicList.find(d => d.roomTypeId === staticRoom.roomTypeId);
                    return {
                        id: staticRoom.roomTypeId,
                        name: staticRoom.roomTitle,
                        description: staticRoom.description,
                        maxAdults: staticRoom.maxAdults,
                        area: staticRoom.roomArea,
                        bedType: staticRoom.bedType,
                        amenities: Array.isArray(staticRoom.amenities) ? staticRoom.amenities : [],
                        price: dynamicRoom?.price || 0,
                        quantity: dynamicRoom?.quantityAvaiable || 0,
                        isSoldOut: !dynamicRoom || dynamicRoom.quantityAvaiable <= 0,
                    };
                });
                setRoomTypes(mergedRooms);
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setLoadingRooms(false);
            }
        };
        fetchData();
    }, [id, dates]);

    const handleUpdateQuantity = (room, delta) => {
        setSelectedRooms(prev => {
            const existing = prev.find(item => item.id === room.id);
            if (existing) {
                const newCount = existing.count + delta;
                if (newCount > room.quantity) {
                    alert(`Hệ thống chỉ còn trống ${room.quantity} phòng!`);
                    return prev;
                }
                if (newCount <= 0) return prev.filter(item => item.id !== room.id);
                return prev.map(item => item.id === room.id ? { ...item, count: newCount } : item);
            } else {
                if (delta <= 0) return prev;
                return [...prev, { ...room, count: 1 }];
            }
        });
    };

    const handleBookNow = async () => {
        if (selectedRooms.length === 0) return;

        try {
            const payload = {
                hotelId: Number(id),
                checkInDate: dates.checkIn,
                checkOutDate: dates.checkOut,
                items: selectedRooms.map(room => ({
                    roomTypeId: Number(room.id),
                    quantity: Number(room.count)
                }))
            };

            const res = await bookingService.holdRoom(payload);

            if (res?.result) {
                navigate("/booking-checkout", {
                    state: {
                        holdCode: res.result.holdCode,
                        expiredAt: res.result.expiredAt,
                        hotelId: id,
                        hotelName: hotel.hotelName,
                        checkInDate: dates.checkIn,
                        checkOutDate: dates.checkOut,
                        selectedRooms: selectedRooms, // Gửi cả danh sách phòng được chọn
                        totalPrice: totalEstimatedPrice
                    }
                });
            }
        } catch (error) {
            console.error("Lỗi đặt phòng:", error.response?.data);
            alert(`Thông báo: ${error.response?.data?.message || "Không thể giữ phòng!"}`);
        }
    };

    const handleExtendHold = async () => {
        if (!bookingSession) return;
        setIsExtending(true);
        try {
            const res = await bookingService.extendHold(bookingSession.holdCode);
            if (res?.result) {
                setBookingSession(prev => ({ ...prev, expiredAt: res.result.expiredAt }));
            }
        } catch (error) {
            alert("Hết thời gian gia hạn hoặc lỗi hệ thống!");
        } finally {
            setIsExtending(false);
        }
    };
const gallery =
        hotel?.images?.length > 0
            ? hotel.images
            : ["https://pix8.agoda.net/hotelImages/186/186135/186135_17083113400050872001.jpg"];
    if (!hotel) return <div className="flex justify-center items-center h-screen"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="bg-[#f8fafc] min-h-screen flex font-sans">
            <AgencySidebar />

            <div className="flex-1 ml-64 flex flex-col min-h-screen relative overflow-x-hidden">
                <Header />

                {bookingSession && (
                    <BookingTimerModal
                        expiredAt={bookingSession.expiredAt}
                        onExpire={() => { setBookingSession(null); window.location.reload(); }}
                        onExtend={handleExtendHold}
                        isExtending={isExtending}
                    />
                )}

                <main className="max-w-[1200px] mx-auto w-full px-6 py-8 pb-48">
                    <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
                        {/* IMAGE AREA */}
                        <div className="relative h-[480px] bg-slate-200">

                            {/* HERO IMAGE */}
                            <img
                                src={hotel.images?.[0]}
                                className="w-full h-full object-cover cursor-pointer"
                                alt="Hotel"
                                onClick={() => setOpenGallery(true)}
                            />

                            {/* FLOATING GALLERY CARD */}
                            {hotel.images?.length > 1 && (
                                <div className="absolute right-6 bottom-6 bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-3 w-[220px]">
                                    <div className="grid grid-cols-2 gap-2">
                                        {hotel.images.slice(1, 5).map((img, i) => (
                                            <img
                                                key={i}
                                                src={img}
                                                onClick={() => setOpenGallery(true)}
                                                className="h-20 w-full object-cover rounded-xl cursor-pointer hover:opacity-90 transition"
                                            />
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setOpenGallery(true)}
                                        className="mt-3 w-full text-xs font-bold text-blue-600 hover:underline"
                                    >
                                        Xem tất cả ảnh
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* INFO AREA */}
                        <div className="p-8">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex text-yellow-400">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} size={16} fill="currentColor" />
                                    ))}
                                </div>
                                <span className="text-slate-500 text-sm font-bold">4.8/5</span>
                            </div>

                            <h1 className="text-3xl font-black text-slate-900 mb-2">
                                {hotel.hotelName}
                            </h1>

                            <div className="flex items-center gap-2 text-blue-600 font-bold mb-6 text-sm">
                                <MapPin size={18} />
                                <span>{hotel.address}</span>
                            </div>

                            <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-100">
                                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold italic">
                                    Wifi miễn phí
                                </span>
                                <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold italic">
                                    Có bữa sáng
                                </span>
                            </div>
                        </div>
                    </section>
                   {openGallery && (
                    <GalleryModal
                        images={gallery}
                        onClose={() => setOpenGallery(false)}
                    />
                )}
                    <div className="bg-white p-6 mb-10 rounded-2xl shadow-xl border border-slate-100 flex items-end gap-6 sticky top-20 z-40">
                        <div className="flex-1 space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><CalendarIcon size={14} className="text-blue-600" /> Nhận phòng</label>
                            <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-700" value={tempDates.checkIn} onChange={(e) => setTempDates({ ...tempDates, checkIn: e.target.value })} />
                        </div>
                        <div className="flex-1 space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><CalendarIcon size={14} className="text-blue-600" /> Trả phòng</label>
                            <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-700" value={tempDates.checkOut} onChange={(e) => setTempDates({ ...tempDates, checkOut: e.target.value })} />
                        </div>
                        <button onClick={handleUpdateDates} className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-[50px] rounded-xl font-black text-sm uppercase tracking-widest shadow-lg active:scale-95">Cập nhật ngày</button>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-2xl font-black text-slate-800">Chọn phòng và xem giá</h2>
                        {loadingRooms ? (
                            <div className="py-24 text-center bg-white rounded-3xl border border-dashed">
                                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="font-bold text-slate-400">Đang cập nhật giá mới nhất...</p>
                            </div>
                        ) : roomTypes.map((room) => {
                            const selectedEntry = selectedRooms.find(r => r.id === room.id);
                            const currentCount = selectedEntry ? selectedEntry.count : 0;
                            const isSelected = currentCount > 0;

                            return (
                                <div key={room.id} className={`bg-white border rounded-[20px] flex flex-col md:flex-row p-5 gap-6 transition-all ${isSelected ? 'border-blue-500 shadow-lg ring-1 ring-blue-500' : 'border-slate-200 shadow-sm hover:border-blue-300'}`}>
                                    <div className="w-full md:w-64 h-48 shrink-0 rounded-xl overflow-hidden bg-slate-100 relative">
                                        <img src={`https://picsum.photos/seed/${room.id}/500/350`} className={`w-full h-full object-cover ${room.isSoldOut ? 'grayscale' : ''}`} alt="" />
                                        {room.isSoldOut && <div className="absolute inset-0 bg-black/50 flex items-center justify-center font-black text-white text-sm uppercase">Hết phòng</div>}
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-xl font-black text-slate-900 mb-2">{room.name}</h3>
                                        <div className="flex flex-wrap gap-4 text-xs text-slate-500 font-bold mb-4">
                                            <span className="flex items-center gap-1"><Users size={14} /> {room.maxAdults} Người lớn</span>
                                            <span className="flex items-center gap-1"><BedDouble size={14} /> {room.bedType}</span>
                                            <span className="flex items-center gap-1"><Maximize size={14} /> {room.area} m²</span>
                                        </div>

                                        {room.amenities.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {room.amenities.map((am, i) => (
                                                    <span key={i} className="bg-slate-50 text-slate-400 text-[9px] px-2 py-1 rounded border border-slate-100 uppercase font-black tracking-tighter">{am}</span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-y-2">
                                            <div className="flex items-center gap-2 text-emerald-600 text-[11px] font-black"><Check size={14} /> Xác nhận ngay</div>
                                            <div className="flex items-center gap-2 text-emerald-600 text-[11px] font-black"><Check size={14} /> Miễn phí hủy phòng</div>
                                        </div>
                                    </div>

                                    <div className="min-w-[220px] md:border-l border-slate-100 md:pl-6 flex flex-col justify-between items-end">
                                        <div className="text-right">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Giá Net phòng/đêm</div>
                                            <div className="text-2xl font-black text-emerald-600">{room.price > 0 ? formatCurrency(room.price) : "—"}</div>
                                        </div>
                                        <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                                            <button onClick={() => handleUpdateQuantity(room, -1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-400 hover:text-blue-600 border border-slate-200 transition-colors">
                                                <Minus size={16} />
                                            </button>
                                            <span className="w-6 text-center font-black text-slate-800 text-lg">{currentCount}</span>
                                            <button
                                                onClick={() => handleUpdateQuantity(room, 1)}
                                                disabled={room.isSoldOut}
                                                className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-400 hover:text-blue-600 border border-slate-200 transition-colors disabled:opacity-50"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </main>

                <div className="fixed bottom-0 right-0 left-64 bg-white border-t border-slate-200 p-6 z-50 shadow-[0_-15px_40px_rgba(0,0,0,0.08)]">
                    <div className="max-w-[1200px] mx-auto flex justify-between items-center">
                        <div className="flex items-center gap-6">
                            {selectedRooms.length > 0 ? (
                                <>
                                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
                                        <Utensils size={24} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Lựa chọn của bạn</span>
                                        <h4 className="text-xl font-black text-slate-800 leading-none">
                                            {selectedRooms.length} loại phòng ({selectedRooms.reduce((acc, curr) => acc + curr.count, 0)} phòng)
                                        </h4>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center gap-4 text-slate-400 italic">
                                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center"><AlertCircle size={24} /></div>
                                    <span className="font-bold text-sm uppercase tracking-widest">Chưa chọn phòng</span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-12">
                            <div className="text-right">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tổng tiền dự kiến</span>
                                <div className="text-3xl font-black text-blue-600 tracking-tighter">
                                    {formatCurrency(totalEstimatedPrice)}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleBookNow}
                                disabled={selectedRooms.length === 0}
                                className={`px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-2xl active:scale-95 ${selectedRooms.length > 0 ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                            >
                                {selectedRooms.length > 0 ? "ĐẶT NGAY" : "CHỌN PHÒNG"} <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}