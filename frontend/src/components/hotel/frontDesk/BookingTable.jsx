import React from 'react';
import { CreditCard, UserCheck, LogOut, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BookingTable = ({ bookings, activeTab, onCheckout, onCheckin }) => {
    const navigate = useNavigate();
    const formatVND = (val) => new Intl.NumberFormat('vi-VN').format(val) + " ₫";
    const handleAction = (item) => {
        if (activeTab === 'arrival') {
            if (onCheckin) onCheckin(item.bookingCode);
        } else if (activeTab === 'departure') {
            // Gọi hàm checkout
            if (onCheckout) onCheckout(item.bookingCode);
        }
    };
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Khách hàng / Mã đơn</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Khách sạn</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lịch trình</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tổng số phòng</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng tiền</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thanh toán</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                {bookings.length === 0 ? (
                    <tr>
                        <td colSpan="7" className="px-8 py-20 text-center text-slate-300 font-bold uppercase text-xs">Không có dữ liệu</td>
                    </tr>
                ) : (
                    bookings.map((item) => (
                        <tr key={item.bookingCode} className="hover:bg-blue-50/20 transition-colors">
                            <td className="px-8 py-6">
                                <div className="font-black text-slate-900 text-sm">{item.guestName}</div>
                                <div className="text-[10px] font-bold text-blue-600">#{item.bookingCode}</div>
                            </td>
                            <td className="px-8 py-6">
                                <div className="text-xs font-bold text-slate-700">{item.hotelName}</div>
                                <div
                                    className="text-[9px] text-slate-400 font-black uppercase">{item.agencyName || 'Khách lẻ'}</div>
                            </td>
                            <td className="px-8 py-6">
                                <div className="text-xs font-black text-slate-800">{item.checkInDate}</div>
                                <div
                                    className="text-[9px] text-slate-400 font-bold uppercase italic">đến {item.checkOutDate}</div>
                            </td>
                            <td className="px-8 py-6 text-center">
                                    <span
                                        className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-600">
                                        {item.totalRooms}
                                    </span>
                            </td>
                            <td className="px-8 py-6 font-black text-blue-700 text-sm">
                                {formatVND(item.finalAmount)}
                            </td>
                            <td className="px-8 py-6">
                                    <span className={`px-3 py-1.5 rounded-full text-[9px] font-black border uppercase ${
                                        item.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                                    }`}>
                                        {item.paymentStatus}
                                    </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                                <div className="flex justify-end gap-2">
                                    {/* Nút Xem chi tiết luôn hiện */}
                                    <button
                                        onClick={() => navigate(`/hotel/view-booking/${item.bookingCode}`)}
                                        title="Chi tiết đơn"
                                        className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                                    >
                                        <Info size={16}/>
                                    </button>

                                    {/* Nút Check-in / Check-out dựa theo Tab và Trạng thái */}
                                    {item.bookingStatus !== 'COMPLETED' && item.bookingStatus !== 'CANCELLED' && (
                                        <button
                                            onClick={() => handleAction(item)}
                                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg transition-all active:scale-95 ${
                                                activeTab === 'arrival'
                                                    ? 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700'
                                                    : 'bg-emerald-600 text-white shadow-emerald-100 hover:bg-emerald-700'
                                            }`}
                                        >
                                            {activeTab === 'arrival' ? <UserCheck size={14}/> : <LogOut size={14}/>}
                                            {activeTab === 'arrival' ? 'Check-in' : 'Check-out'}
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
    );
};

export default BookingTable;