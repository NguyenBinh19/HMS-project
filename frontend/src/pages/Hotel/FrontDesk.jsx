import React, { useEffect, useState } from 'react';
import StatCard from '@/components/hotel/frontDesk/StatisticCard.jsx';
import FilterHeader from '@/components/hotel/frontDesk/FilterHeader.jsx';
import BookingTable from '@/components/hotel/frontDesk/BookingTable.jsx';
import { bookingService } from '@/services/booking.service';
import { Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

const FrontDeskDashboard = () => {
    const [activeTab, setActiveTab] = useState('arrival');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const today = new Date().toISOString().split('T')[0];
    const [currentDate, setCurrentDate] = useState(today);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            let response;
            const isToday = currentDate === today;

            if (activeTab === 'arrival') {
                response = isToday
                    ? await bookingService.getCheckInToday()
                    : await bookingService.getCheckInByDate(currentDate);
            }
            else if (activeTab === 'departure') {
                response = isToday
                    ? await bookingService.getTodayDepartures()
                    : await bookingService.getDeparturesByDate(currentDate);
            }
            else {
                setBookings([]);
                return;
            }

            if (response && response.result) {
                // Lọc bỏ các dòng trùng bookingCode, chỉ giữ lại dòng đầu tiên
                const uniqueBookings = Array.from(
                    new Map(response.result.map(item => [item['bookingCode'], item])).values()
                );
                setBookings(uniqueBookings);
            }
        } catch (error) {
            console.error("Lỗi tải danh sách:", error);
            toast.error("Không thể tải danh sách đơn hàng");
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    // Hàm xử lý Checkout
    const handleCheckout = async (bookingCode) => {
        if (!window.confirm(`Xác nhận thực hiện checkout cho đơn ${bookingCode}?`)) return;

        try {
            setLoading(true);
            const res = await bookingService.performCheckout(bookingCode);
            if (res.code === 1000) {
                toast.success("Checkout thành công!");
                fetchBookings(); // Tải lại danh sách sau khi checkout
            }
        } catch (error) {
            console.error("Checkout error:", error);
            toast.error(error.response?.data?.message || "Lỗi thực hiện checkout");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [currentDate, activeTab]);

    const filteredBookings = bookings.filter(b =>
        b.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.bookingCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 bg-[#f8fafc] min-h-screen font-sans">
            <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 mb-8">Vận hành Lễ tân</h1>

            <div className="relative max-w-md mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm tên khách, mã đơn..."
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Khách đến" count={activeTab === 'arrival' ? bookings.length : 0} sub="Lịch check-in" type="arrival" active={activeTab === 'arrival'} onClick={() => setActiveTab('arrival')} />
                <StatCard
                    title="Khách đi"
                    count={activeTab === 'departure' ? bookings.length : 0}
                    sub="Lịch check-out"
                    type="departure"
                    active={activeTab === 'departure'}
                    onClick={() => setActiveTab('departure')}
                />
                <StatCard title="Đang lưu trú" count={0} sub="Phòng bận" type="stay" active={activeTab === 'stay'} onClick={() => setActiveTab('stay')} />
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                <FilterHeader
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    currentDate={currentDate}
                    setCurrentDate={setCurrentDate}
                    today={today}
                />

                {loading ? (
                    <div className="py-32 flex flex-col items-center justify-center gap-4">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Đang tải...</p>
                    </div>
                ) : (
                    <BookingTable
                        bookings={filteredBookings}
                        activeTab={activeTab}
                        onCheckout={handleCheckout}
                    />
                )}
            </div>
        </div>
    );
};

export default FrontDeskDashboard;