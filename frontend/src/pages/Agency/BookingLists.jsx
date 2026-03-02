import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Calendar,
    ChevronDown,
    MessageCircle,
    Download,
    Star,
    RefreshCcw,
    FileText,
    Clock
} from 'lucide-react';

const OrderListScreen = () => {
    const navigate = useNavigate();
    // 1. Mock Data tạm thời
    const [orders] = useState([
        {
            id: "#BK-2026-8899",
            date: "24/01/2026 09:30",
            hotelName: "Mường Thanh Luxury Da Nang",
            customer: "Nguyen Van A (+3 người)",
            stayPeriod: "20/05 - 22/05 (2 đêm)",
            roomType: "2x Deluxe King",
            price: "4.000.000 ₫",
            status: "PAID & CONFIRMED",
            tab: "Sắp khởi hành",
            image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=150&fit=crop"
        },
        {
            id: "#BK-2026-8900",
            date: "23/01/2026 14:22",
            hotelName: "Grand Hotel Saigon",
            customer: "Le Thi B (+2 người)",
            stayPeriod: "25/05 - 27/05 (2 đêm)",
            roomType: "1x Executive Suite",
            price: "5.200.000 ₫",
            status: "PAID & CONFIRMED",
            tab: "Sắp khởi hành",
            image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=200&h=150&fit=crop"
        },
        {
            id: "#BK-2026-8904",
            date: "19/01/2026 12:20",
            hotelName: "Sapa Legend Resort",
            customer: "Nguyen Van F (+5 người)",
            stayPeriod: "15/01 - 17/01 (2 đêm)",
            roomType: "6x Mountain View Room",
            price: "7.500.000 ₫",
            status: "HOÀN THÀNH",
            tab: "Hoàn thành",
            image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=200&h=150&fit=crop"
        },
        {
            id: "#BK-2026-8906",
            date: "17/01/2026 15:45",
            hotelName: "Dalat Palace Heritage",
            customer: "Tran Thi H (+3 người)",
            stayPeriod: "05/01 - 07/01 (2 đêm)",
            roomType: "2x Family Room",
            price: "4.800.000 ₫",
            status: "ĐÃ HỦY",
            tab: "Đã hủy",
            image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=200&h=150&fit=crop"
        }
    ]);

    const [activeTab, setActiveTab] = useState("Sắp khởi hành");

    // Các tabs trạng thái
    const tabs = [
        { name: "Sắp khởi hành", count: 5 },
        { name: "Đang lưu trú", count: 2 },
        { name: "Hoàn thành", count: "10+" },
        { name: "Đã hủy", count: 1 }
    ];

    return (
        <div className="bg-slate-50 min-h-screen p-6 font-sans text-slate-700">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Danh sách Đơn hàng</h1>
                <p className="text-sm text-slate-500">Theo dõi và quản lý toàn bộ đơn hàng đã đặt thành công</p>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center mb-6">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm theo Mã đơn (#BK...), Tên khách, hoặc Tên khách sạn..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>

                <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-50">
                    <span className="text-sm">Ngày đặt</span>
                    <ChevronDown size={16} />
                </div>

                <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2">
                    <input type="text" value="2024-01-01" className="text-sm w-20 outline-none bg-transparent" readOnly />
                    <Calendar size={16} className="text-slate-400" />
                </div>

                <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2">
                    <input type="text" value="2024-12-31" className="text-sm w-20 outline-none bg-transparent" readOnly />
                    <Calendar size={16} className="text-slate-400" />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-8 border-b border-slate-200 mb-6 px-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`pb-3 text-sm font-semibold transition-all relative ${
                            activeTab === tab.name ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {tab.name}
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${
                            activeTab === tab.name ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                        }`}>
              {tab.count}
            </span>
                        {activeTab === tab.name && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>
                        )}
                    </button>
                ))}
            </div>

            {/* Order List */}
            <div className="space-y-4">
                {orders.filter(o => activeTab === "Sắp khởi hành" ? o.tab === "Sắp khởi hành" : o.tab === activeTab).map((order) => (
                    <div key={order.id} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div
                            onClick={() =>
                                navigate(`/booking-list/detail/${encodeURIComponent(order.id)}`)
                            }
                            className="flex justify-between items-start mb-4 cursor-pointer group"
                        >
                            <div>
                                {/* Thêm hover cho ID để người dùng biết là click được */}
                                <span
                                    className="text-blue-600 font-bold text-sm group-hover:text-blue-700 group-hover:underline underline-offset-4 decoration-2 transition-all">
                {order.id}
            </span>
                                <p className="text-[11px] text-slate-400 mt-0.5">{order.date}</p>
                            </div>
                            <div className={`text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1.5 ${
                                order.status === 'PAID & CONFIRMED' ? 'bg-emerald-50 text-emerald-600' :
                                    order.status === 'HOÀN THÀNH' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                                {order.status === 'PAID & CONFIRMED' && <CheckIcon/>}
                                {order.status === 'HOÀN THÀNH' && <CheckIcon/>}
                                {order.status === 'ĐÃ HỦY' && <span>✘</span>}
                                {order.status}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <img src={order.image} alt="hotel" className="w-24 h-24 rounded-lg object-cover"/>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-800 mb-1">{order.hotelName}</h3>
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-500 flex items-center gap-2">
                                        <span className="w-4 flex justify-center"><UserIcon/></span> {order.customer}
                                    </p>
                                    <p className="text-xs text-slate-500 flex items-center gap-2">
                                        <span className="w-4 flex justify-center"><Calendar size={14} /></span> {order.stayPeriod}
                                    </p>
                                    <p className="text-xs text-slate-500 flex items-center gap-2">
                                        <span className="w-4 flex justify-center"><BedIcon /></span> {order.roomType}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right flex flex-col justify-between items-end">
                                <span className="text-emerald-600 font-bold text-lg">{order.price}</span>

                                <div className="flex gap-2">
                                    {order.tab === "Sắp khởi hành" && (
                                        <>
                                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors">
                                                <Download size={14} /> Tải Voucher
                                            </button>
                                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors">
                                                <MessageCircle size={14} /> Chat với KS
                                            </button>
                                        </>
                                    )}
                                    {order.tab === "Hoàn thành" && (
                                        <>
                                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200">
                                                <Star size={14} /> Đánh giá
                                            </button>
                                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200">
                                                <RefreshCcw size={14} /> Đặt lại
                                            </button>
                                        </>
                                    )}
                                    {order.tab === "Đã hủy" && (
                                        <button className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold hover:bg-rose-100">
                                            Xem lý do
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Sub-icons
const CheckIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const UserIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

const BedIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4v16"></path>
        <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
        <path d="M2 17h20"></path>
        <path d="M6 8v9"></path>
    </svg>
);

export default OrderListScreen;