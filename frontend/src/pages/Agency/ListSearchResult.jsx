import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { List, Map, Star, MapPin, ChevronLeft, ChevronRight, Search, Eye, Layers } from "lucide-react";
import HotelSearchForm from "@/components/agency/booking/SearchForm.jsx";
import FilterSidebar from "@/components/agency/booking/FilterGroup.jsx";
import homepage from "@/assets/images/homepage.jpg";
import { bookingService } from "@/services/booking.service.js";
import HotelCard from "@/components/agency/booking/HotelCardSearch.jsx";
import { CompareProvider, useCompare } from '@/context/CompareContext.jsx';
import CompareModal from "@/components/hotel/compareRoomPrices/CompareFloatingBar.jsx";

const CompareBar = () => {
    const { compareItems, handleCompareNow, clearAll } = useCompare();
    if (compareItems.length === 0) return null;

    return (
        <div className="fixed bottom-6 left-[280px] right-6 z-[80] animate-in slide-in-from-bottom duration-500">
            <div className="max-w-[1100px] mx-auto bg-slate-900/95 text-white px-6 py-4 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-between border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-6 pl-2">
                    <div className="relative">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                            <Layers size={22} className="text-white" />
                        </div>
                        <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-[10px] font-black rounded-full flex items-center justify-center border-2 border-slate-900">
                            {compareItems.length}
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">So sánh khách sạn</p>
                        <p className="text-sm font-bold">{compareItems.length} địa điểm đã chọn</p>
                    </div>
                </div>

                <div className="flex items-center gap-6 pr-2">
                    <button onClick={clearAll} className="text-[11px] font-black uppercase text-slate-400 hover:text-white transition-colors">Xóa hết</button>
                    <button
                        onClick={handleCompareNow}
                        className="bg-blue-600 text-white px-10 py-4 rounded-xl font-black text-[12px] uppercase shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all active:scale-95 flex items-center gap-2"
                    >
                        So sánh ngay <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

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
            // Lọc Hạng Sao
            const matchStar = filters.stars.length === 0 || filters.stars.includes(hotel.starRating);

            // Lọc Tiện ích
            const matchAmenities = filters.amenities.length === 0 || filters.amenities.every(a =>
                hotel.amenities && hotel.amenities.includes(a)
            );

            return matchStar && matchAmenities;
        });
    }, [hotels, filters]);

    // 3. Phân trang trên mảng ĐÃ LỌC
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
        <CompareProvider>
        <div className="w-full bg-slate-50 min-h-screen font-sans pb-40">
            {/* Banner Section */}
            <section className="relative h-[380px] flex items-center justify-center px-4">
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
            <CompareBar />
            <CompareModal />
        </div>
        </CompareProvider>
    );
}


