import React, { useState } from 'react';
import StatCard from '@/components/hotel/frontDesk/StatisticCard.jsx';
import FilterHeader from '@/components/hotel/frontDesk/FilterHeader.jsx';
import BookingTable from '@/components/hotel/frontDesk/BookingTable.jsx';
import { Search } from 'lucide-react';

const FrontDeskDashboard = ({ userRole = 'Receptionist' }) => {
    const [activeTab, setActiveTab] = useState('arrival'); // arrival, departure, stay
    const [currentDate, setCurrentDate] = useState("2026-01-27");

    return (
        <div className="p-6 bg-[#f8fafc] min-h-screen">
            <h1 className="text-2xl font-black uppercase mb-6">Vận hành Lễ tân</h1>

            {/* UC050.2: Global Search */}
            <div className="relative max-w-md mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Tìm tên khách, mã đơn... (UC050.2)"
                    className="w-full pl-12 pr-4 py-3 bg-white border rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Summary Stats từ Screenshot 2026-03-10 201149 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Khách đến" count={10} sub="Arrived: 2 | Remaining: 8" type="arrival" active={activeTab === 'arrival'} onClick={() => setActiveTab('arrival')} />
                <StatCard title="Khách đi" count={5} sub="Departed: 1 | Remaining: 4" type="departure" active={activeTab === 'departure'} onClick={() => setActiveTab('departure')} />
                <StatCard title="Đang lưu trú" count={45} sub="Rooms occupied" type="stay" active={activeTab === 'stay'} onClick={() => setActiveTab('stay')} />
            </div>

            {/* Filter Tabs & Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <FilterHeader activeTab={activeTab} setActiveTab={setActiveTab} currentDate={currentDate} />
                <BookingTable activeTab={activeTab} userRole={userRole} />
            </div>
        </div>
    );
};

export default FrontDeskDashboard;