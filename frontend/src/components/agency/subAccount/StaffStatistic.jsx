import React from 'react';

const StatCard = ({ title, value, color }) => (
    <div className={`bg-white p-6 rounded-2xl border-l-4 ${color} shadow-sm`}>
        <h3 className="text-[13px] font-medium text-slate-400 mb-2 uppercase tracking-wide">{title}</h3>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
);

const StaffStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Tổng nhân viên" value="05" color="border-blue-500" />
        <StatCard title="Đang hoạt động" value="04" color="border-emerald-500" />
        <StatCard title="Tổng hạn mức ngày cấp" value="100.000.000 đ" color="border-blue-600" />
    </div>
);

export default StaffStats;