import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import publicApi from "../../../src/services/publicApi.config.js";
import GalleryModal from "../../components/common/Hotel/GalleryModal.jsx";
import Header from "../../components/common/Homepage/Header";
import Footer from "../../components/common/Homepage/Footer";
import AgencySidebar from "../../components/common/Hotel/AgencySidebar.jsx";

import {
    MapPin,
    Wifi,
    Coffee,
    Tv,
    Bath,
    Users,
} from "lucide-react";

/* ================= MOCK ROOM DATA (GIỮ NGUYÊN) ================= */
const rooms = [
    {
        id: 1,
        name: "Deluxe King Ocean View",
        capacity: "2 Người lớn · 1 Trẻ em",
        price: "1.800.000 đ",
        agentPrice: "700.000 đ",
        image: "https://picsum.photos/300/200?room1",
    },
    {
        id: 2,
        name: "Executive Suite",
        capacity: "2 Người lớn · 2 Trẻ em",
        price: "2.400.000 đ",
        agentPrice: "800.000 đ",
        image: "https://picsum.photos/300/200?room2",
    },
    {
        id: 3,
        name: "Family Room",
        capacity: "4 Người lớn · 2 Trẻ em",
        price: "3.300.000 đ",
        agentPrice: "1.200.000 đ",
        image: "https://picsum.photos/300/200?room3",
    },
];

export default function HotelDetailPage() {
    const { id } = useParams();
    const [hotel, setHotel] = useState(null);
    const [openGallery, setOpenGallery] = useState(false);

    useEffect(() => {
        publicApi
            .get(`/hotels/${id}`)
            .then((res) => setHotel(res.data.result))
            .catch(console.error);
    }, [id]);

    if (!hotel) {
        return <div className="p-10 text-center">Loading hotel...</div>;
    }

    const gallery =
        hotel.images?.length > 0
            ? hotel.images
            : ["https://pix8.agoda.net/hotelImages/186/186135/186135_17083113400050872001.jpg"];
    const colors = [
        "bg-red-100 text-red-700",
        "bg-green-100 text-green-700",
        "bg-blue-100 text-blue-700",
        "bg-yellow-100 text-yellow-700",
        "bg-purple-100 text-purple-700",
        "bg-pink-100 text-pink-700",
        "bg-indigo-100 text-indigo-700",
    ];
    return (
        <div className="bg-slate-50 min-h-screen flex">
            {/* ================= LEFT SIDEBAR ================= */}
            <AgencySidebar />

            {/* ================= RIGHT CONTENT ================= */}
            <div className="flex-1 ml-64">
                <Header />

                {/* ================= GALLERY ================= */}
                <section className="max-w-7xl mx-auto px-4 mt-4">
                    <div className="relative h-[420px] rounded-2xl overflow-hidden">
                        {/* HERO IMAGE */}
                        <img
                            src={gallery?.[0]}
                            className="w-full h-full object-cover cursor-pointer"
                        />

                        {/* FLOATING GALLERY CARD */}
                        {gallery.length > 1 && (
                            <div className="absolute right-6 bottom-6 bg-white rounded-xl shadow-xl p-2 w-[180px]">
                                <div className="grid grid-cols-2 gap-2">
                                    {gallery.slice(1, 5).map((img, i) => (
                                        <img
                                            key={i}
                                            src={img}
                                            onClick={() => setOpenGallery(true)}
                                            className="h-20 w-full object-cover rounded-lg cursor-pointer hover:opacity-90"
                                        />
                                    ))}
                                </div>

                                {/* VIEW ALL */}
                                <button
                                    onClick={() => setOpenGallery(true)}
                                    className="
        bg-white/90
        shadow
        flex items-center justify-center
        hover:bg-white
        transition
    "
                                >
                                </button>


                            </div>
                        )}
                    </div>
                </section>

                {openGallery && (
                    <GalleryModal
                        images={gallery}
                        onClose={() => setOpenGallery(false)}
                    />
                )}


                {/* ================= MAIN ================= */}
                <section className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-3 space-y-6">
                        {/* ===== HOTEL HEADER ===== */}
                        <div className="space-y-2">
                            {/* TITLE + BADGES */}
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl font-bold text-slate-900">
                                    {hotel.hotelName}
                                </h1>

                                <div className="flex flex-wrap gap-2 text-sm font-bold">
                                    {hotel.amenities?.map((a, i) => {
                                        const colorClass = colors[i % colors.length];

                                        return (
                                            <span
                                                key={i}
                                                className={`px-2 py-0.5 rounded-full ${colorClass}`}
                                            >
                {a}
            </span>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* RATING */}
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <span className="text-yellow-400">
                                    {"★".repeat(hotel.starRating || 5)}
                                </span>
                                <span className="font-semibold text-slate-800">
                                    {hotel.avgRating?.toFixed(1)}/5
                                </span>
                                <span>({hotel.totalReviews} đánh giá)</span>
                            </div>

                            {/* ADDRESS */}
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <MapPin size={14} className="text-blue-600" />
                                <span>{hotel.address}</span>
                                <span className="text-blue-600 cursor-pointer hover:underline">
                                    Xem bản đồ
                                </span>
                            </div>
                        </div>

                        {/* ===== TABS (GIỮ NGUYÊN) ===== */}
                        <div className="border-b flex gap-6 text-sm font-semibold">
                            <button className="border-b-2 border-blue-600 text-blue-600 pb-3">
                                Phòng & Giá
                            </button>
                            <button className="text-slate-500 pb-3">Chính sách</button>
                            <button className="text-slate-500 pb-3">Đánh giá</button>
                        </div>

                        {/* ===== ROOMS (GIỮ MOCK) ===== */}
                        <div>
                            <h2 className="text-lg font-semibold mb-4">
                                Chọn phòng và xem giá
                            </h2>

                            <div className="space-y-4">
                                {rooms.map((room) => (
                                    <div
                                        key={room.id}
                                        className="bg-white border rounded-xl p-4 flex gap-4 items-center"
                                    >
                                        <img
                                            src={room.image}
                                            className="w-32 h-24 object-cover rounded-lg"
                                        />

                                        <div className="flex-1">
                                            <h3 className="font-semibold">{room.name}</h3>

                                            <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                                <Users size={14} />
                                                {room.capacity}
                                            </div>

                                            <div className="flex gap-3 text-xs text-slate-500 mt-2">
                                                <Wifi size={14} /> Wifi
                                                <Tv size={14} /> TV
                                                <Bath size={14} /> Bồn tắm
                                                <Coffee size={14} /> Bữa sáng
                                            </div>
                                        </div>

                                        <div className="text-right min-w-[160px]">
                                            <div className="text-green-600 font-bold text-lg">
                                                {room.price}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                Là đại lý: {room.agentPrice}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
                {/* ================= STICKY BOOKING SUMMARY ================= */}
                <div className="mt-8 sticky bottom-0 z-20">
                    <div className="bg-white border rounded-xl px-6 py-4 shadow-md flex items-center justify-between">

                        {/* LEFT */}
                        <div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <span className="text-blue-600">🏨</span>
                                Chưa chọn phòng
                            </div>

                            <div className="text-sm mt-1">
                                Tổng tiền Net:
                                <span className="ml-2 font-semibold text-green-600">
                    0 đ
                </span>
                            </div>
                        </div>

                        {/* RIGHT */}
                        <button
                            disabled
                            className="px-6 py-3 rounded-lg font-semibold bg-slate-200 text-slate-400 cursor-not-allowed"
                        >
                            ĐẶT NGAY (Giữ phòng 5’)
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        </div>
    );
}
