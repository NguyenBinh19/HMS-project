import React from 'react';
import { CreditCard, UserCheck, LogOut, MoreVertical, Info } from 'lucide-react';

const BookingTable = ({ activeTab, userRole }) => {
    // Logic hiển thị tiêu đề bảng dựa trên UC050.1 (Departure) và UC050.0 (Arrival)
    return (
        <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase">Thời gian</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase">Thông tin đặt phòng</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase">{activeTab === 'departure' ? 'Phòng' : 'Loại phòng'}</th>
                {/* BR-HOT-02: Ẩn/Hiện giá dựa trên role Manager */}
                {userRole === 'Manager' && <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase">Giá Net</th>}
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase">Thanh toán</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase">Hành động</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
            {/* Render rows tương tự code cũ nhưng tách biệt logic */}
            <tr className="hover:bg-blue-50/20">
                <td className="px-6 py-5 font-black text-sm text-emerald-600">14:00</td>
                <td className="px-6 py-5">
                    <div className="font-black text-sm">#BK-2026-8899</div>
                    <div className="text-sm font-bold text-slate-600">Nguyen Van A</div>
                </td>
                <td className="px-6 py-5 font-bold text-slate-600 text-sm">2x Deluxe Double</td>
                {userRole === 'Manager' && <td className="px-6 py-5 font-black text-blue-700 text-sm">2,400,000 ₫</td>}
                <td className="px-6 py-5">
                    {/* UX Requirement: "PAID" badge dominant */}
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full border border-emerald-100 uppercase">
              <CreditCard size={12} /> PAID BY HMS
            </span>
                </td>
                <td className="px-6 py-5">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[11px] font-black uppercase shadow-lg shadow-blue-100">
                        {activeTab === 'arrival' ? <><UserCheck size={16} /> Check-in</> : <><LogOut size={16} /> Check-out</>}
                    </button>
                </td>
            </tr>
            </tbody>
        </table>
    );
};

export default BookingTable;