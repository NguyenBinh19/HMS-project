import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { List, Map, Star, MapPin, ChevronLeft, ChevronRight, Search, Eye } from "lucide-react";
import HotelSearchForm from "@/components/agency/booking/SearchForm.jsx";
import FilterSidebar from "@/components/agency/booking/FilterGroup.jsx";
import homepage from "@/assets/images/homepage.jpg";
import { bookingService } from "@/services/booking.service.js";

export default function HotelSearchContainer() {
    const [searchParams] = useSearchParams();
    const keyword = searchParams.get("keyword") || "";

    // State lưu data gốc từ API
    const [hotels, setHotels] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // State lưu trữ dữ liệu bộ lọc (nhận từ FilterSidebar)
    const [filters, setFilters] = useState({ stars: [], amenities: [] });

    // State cho Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // 1. Gọi API lấy toàn bộ dữ liệu
    useEffect(() => {
        const fetchHotels = async () => {
            if (!keyword) return;

            try {
                setIsLoading(true);
                setCurrentPage(1); // Reset trang khi tìm từ khóa mới
                setFilters({ stars: [], amenities: [] }); // Reset filter khi tìm từ khóa mới

                const response = await bookingService.searchHotel({ keyword });

                if (response.code === 1000 && response.result) {
                    setHotels(response.result);
                } else {
                    setHotels([]);
                }
            } catch (error) {
                console.error("Lỗi khi tải danh sách khách sạn:", error);
                setHotels([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHotels();
    }, [keyword]);

    // 2. Lọc Dữ Liệu (Chạy tự động mỗi khi `hotels` hoặc `filters` thay đổi)
    const filteredHotels = useMemo(() => {
        return hotels.filter(hotel => {
            // Lọc Hạng Sao: Nếu không chọn sao nào -> pass. Nếu có chọn -> hotel.starRating phải nằm trong mảng đã chọn.
            const matchStar = filters.stars.length === 0 || filters.stars.includes(hotel.starRating);

            // Lọc Tiện ích: Phải chứa TẤT CẢ các tiện ích người dùng đã tích chọn (.every)
            const matchAmenities = filters.amenities.length === 0 || filters.amenities.every(a =>
                hotel.amenities && hotel.amenities.includes(a)
            );

            return matchStar && matchAmenities;
        });
    }, [hotels, filters]);

    // 3. Phân trang trên mảng ĐÃ LỌC (`filteredHotels`)
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentHotels = filteredHotels.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredHotels.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Hàm nhận dữ liệu từ FilterSidebar
    const handleApplyFilter = (newFilters) => {
        setFilters(newFilters);
        setCurrentPage(1); // Lọc xong thì phải đưa về trang 1
    };

    return (
        <div className="w-full bg-[#F3F7FA] min-h-screen font-sans pb-20">
            {/* Banner Section */}
            <section className="relative h-[420px] flex items-center justify-center px-4">
                <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${homepage})` }}>
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
                </div>
                <div className="relative z-10 w-full max-w-5xl text-center">
                    <h1 className="text-white text-4xl md:text-5xl font-black mb-6 tracking-tight uppercase leading-tight">
                        Nền tảng Đặt phòng B2B An toàn <br/> & Thông minh nhất Việt Nam
                    </h1>
                    <p className="text-slate-200 text-lg mb-10 font-medium opacity-90 italic">
                        Giải pháp giữ tiền trung gian (Escrow) bảo vệ dòng tiền 100% - Tích hợp AI tìm kiếm phòng siêu tốc
                    </p>
                    <div className="bg-white p-3 rounded-2xl shadow-2xl">
                        <HotelSearchForm variant="compact" />
                    </div>
                </div>
            </section>

            <div className="max-w-[1300px] mx-auto py-8 px-6">
                {/* Search Info Header */}
                <div className="bg-white rounded-[24px] border border-slate-100 p-6 mb-8 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h2 className="text-[#003580] font-black text-xl flex items-center gap-2 uppercase tracking-tighter">
                                <Search size={22} strokeWidth={3} className="text-blue-600" /> Kết quả tìm kiếm
                            </h2>
                            <div className="flex items-center gap-4 text-slate-400 text-[12px] font-bold mt-2 italic">
                                <span className="flex items-center gap-1"><MapPin size={14} className="text-blue-500"/> {keyword}</span>
                                <span>📅 24/01 - 26/01</span>
                                <span>👥 2 Người lớn</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[12px] font-black flex items-center gap-2 shadow-lg shadow-blue-100">
                                <List size={16} /> DANH SÁCH
                            </button>
                            <button className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[12px] font-black flex items-center gap-2 hover:bg-slate-200 transition-all">
                                <Map size={16} /> BẢN ĐỒ
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-50">
                        {/* Cập nhật số lượng khách sạn hiển thị dựa trên mảng ĐÃ LỌC */}
                        <span className="text-[11px] font-black text-slate-400 uppercase italic">
                            Hiển thị: <span className="text-slate-800">{filteredHotels.length} khách sạn phù hợp</span>
                        </span>
                        <div className="h-4 w-[1px] bg-slate-200 mx-2"></div>
                        <span className="text-[11px] font-black text-slate-400 uppercase italic mr-2">Sắp xếp theo:</span>
                        <button className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-[11px] font-bold shadow-md">Giá thấp → cao</button>
                        <button className="px-4 py-1.5 bg-white text-slate-500 rounded-lg text-[11px] font-bold border border-slate-200 hover:border-blue-400 transition-all">Đánh giá cao nhất</button>
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* Component Bộ Lọc */}
                    <aside className="w-[280px] shrink-0">
                        <FilterSidebar onApplyFilter={handleApplyFilter} />
                    </aside>

                    {/* Danh sách Khách sạn */}
                    <div className="flex-1 space-y-4">
                        {isLoading ? (
                            <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm font-bold text-slate-500">
                                Đang tìm kiếm khách sạn phù hợp nhất...
                            </div>
                        ) : filteredHotels.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm font-bold text-slate-500">
                                Không tìm thấy khách sạn nào khớp với tiêu chí của bạn.
                            </div>
                        ) : (
                            currentHotels.map((hotel) => (
                                <HotelCard key={hotel.hotelId} hotel={hotel} />
                            ))
                        )}

                        {/* Pagination Component */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-12">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={18}/>
                                </button>

                                {[...Array(totalPages)].map((_, index) => {
                                    const pageNum = index + 1;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => paginate(pageNum)}
                                            className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-[13px] transition-all ${
                                                currentPage === pageNum
                                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                                                    : "border border-slate-200 bg-white text-slate-600 hover:border-blue-500"
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight size={18}/>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Component thẻ khách sạn
const HotelCard = ({ hotel }) => {
    const navigate = useNavigate();
    const coverImg = hotel.images && hotel.images.length > 0
        ? hotel.images[0]
        : "https://images.unsplash.com/photo-1551882547-ff43c63ebeaf?q=80&w=800";

    const starCount = hotel.starRating || 0;
    const formattedRating = (hotel.avgRating != null && hotel.avgRating > 0)
        ? hotel.avgRating.toFixed(1)
        : "Chưa có";
    const handleViewDetail = () => {
        // Điều hướng sang trang chi tiết với ID của khách sạn
        navigate(`/hotels/${hotel.hotelId}`);
    };

    return (
        <div className="bg-white border border-slate-100 rounded-[28px] p-4 flex gap-6 hover:shadow-xl transition-all group overflow-hidden relative">
            <div className="w-[260px] h-[180px] rounded-[20px] overflow-hidden shrink-0 relative">
                <img src={coverImg} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={hotel.hotelName} />
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <span className="bg-red-500 text-white text-[9px] font-black px-2 py-1 rounded-md italic uppercase">Flash Sale -15%</span>
                    <span className="bg-[#00A32E] text-white text-[9px] font-black px-2 py-1 rounded-md italic uppercase tracking-tighter shadow-sm">⚡ Instant Booking</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-between py-1">
                <div className="flex justify-between items-start">
                    <div className="max-w-[65%]">
                        <h3 className="text-[#003580] font-black text-[19px] leading-tight uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                            {hotel.hotelName}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-2">
                            <div className="flex text-yellow-400">
                                {[...Array(starCount)].map((_, i) => <Star key={i} size={13} fill="currentColor" />)}
                            </div>
                            <span className="text-[#003580] text-[11px] font-black uppercase ml-1 italic">
                                {formattedRating !== "Chưa có" ? `${formattedRating}/5` : "Chưa có đánh giá"} ({hotel.totalReviews || 0} Reviews)
                            </span>
                        </div>
                        <p className="text-slate-400 text-[11px] font-bold mt-4 flex items-center gap-1 italic truncate">
                            <MapPin size={12} className="text-blue-500 shrink-0" /> {hotel.address}, {hotel.city}
                        </p>
                    </div>
                </div>

                <div className="flex justify-between items-end mt-4">
                    <div className="flex gap-2 flex-wrap max-w-[70%]">
                        {hotel.amenities && hotel.amenities.slice(0, 4).map(t => (
                            <span key={t} className="px-3 py-1 bg-slate-50 text-slate-500 text-[9px] font-black rounded-lg uppercase border border-slate-100">
                                {t}
                            </span>
                        ))}
                    </div>
                    <button
                        onClick={handleViewDetail}
                        className="bg-blue-600 text-white px-7 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2 shrink-0">
                        <Eye size={14} strokeWidth={3} /> Xem phòng
                    </button>
                </div>
            </div>
        </div>
    );
};