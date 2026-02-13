import React, { useState } from 'react';

const DAYS = [
    { id: 1, label: 'Thứ Hai', code: 'T2' },
    { id: 2, label: 'Thứ Ba', code: 'T3' },
    { id: 3, label: 'Thứ Tư', code: 'T4' },
    { id: 4, label: 'Thứ Năm', code: 'T5' },
    { id: 5, label: 'Thứ Sáu', code: 'T6' },
    { id: 6, label: 'Thứ Bảy', code: 'T7' },
    { id: 0, label: 'Chủ Nhật', code: 'CN' },
];

const WeeklyStrategy = ({ basePrice = 1500000 }) => {
    const [weeklyRules, setWeeklyRules] = useState(
        DAYS.map(day => ({
            day_of_week: day.id,
            // cấu hình tạm
            action: day.id === 6 ? 'INCREASE' : day.id === 0 ? 'DECREASE' : 'KEEP',
            adjustment_value: day.id === 6 ? 100000 : day.id === 0 ? 200000 : 0,
            adjustment_type: 'FIXED'
        }))
    );

    const handleChange = (dayId, field, value) => {
        setWeeklyRules(prev => prev.map(item =>
            item.day_of_week === dayId ? { ...item, [field]: value } : item
        ));
    };

    return (
        <div className="w-full">
            {/* Header Section */}
            <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Chiến lược giá theo tuần</h2>
                <p className="text-sm text-gray-500">Thiết lập điều chỉnh giá dựa trên thứ trong tuần so với giá gốc</p>
            </div>

            {/* GRID SYSTEM */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
                {DAYS.map((day) => {
                    const rule = weeklyRules.find(r => r.day_of_week === day.id);
                    const isKeep = rule.action === 'KEEP';

                    return (
                        <div
                            key={day.id}
                            className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow h-full"
                        >
                            {/* Card Header: Thứ & Mã */}
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-800 text-[15px]">{day.label}</span>
                                <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded">
                                    {day.code}
                                </span>
                            </div>

                            {/* Section: Hành động */}
                            <div>
                                <label className="block text-xs text-gray-500 mb-1.5 font-medium">Hành động</label>
                                <div className="relative">
                                    <select
                                        value={rule.action}
                                        onChange={(e) => handleChange(day.id, 'action', e.target.value)}
                                        className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none appearance-none"
                                    >
                                        <option value="KEEP">Giữ nguyên</option>
                                        <option value="INCREASE">Tăng (+)</option>
                                        <option value="DECREASE">Giảm (-)</option>
                                    </select>
                                    {/* Custom Chevron Icon */}
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Giá trị (Input Group) */}
                            <div>
                                <label className="block text-xs text-gray-500 mb-1.5 font-medium">Giá trị</label>
                                <div className="flex rounded-lg shadow-sm">
                                    <input
                                        type="number"
                                        value={rule.adjustment_value}
                                        onChange={(e) => handleChange(day.id, 'adjustment_value', e.target.value)}
                                        disabled={isKeep}
                                        className={`block w-full min-w-0 flex-1 border border-r-0 border-gray-300 rounded-none rounded-l-lg p-2.5 text-sm text-gray-900 outline-none focus:ring-blue-500 focus:border-blue-500 ${isKeep ? 'bg-gray-50 text-gray-400' : 'bg-white'}`}
                                        placeholder="0"
                                    />
                                    <span className="inline-flex items-center px-0 border border-l-0 border-gray-300 rounded-r-lg bg-white relative">
                                        <select
                                            value={rule.adjustment_type}
                                            onChange={(e) => handleChange(day.id, 'adjustment_type', e.target.value)}
                                            disabled={isKeep}
                                            className={`h-full py-0 pl-2 pr-7 border-0 bg-transparent text-gray-500 text-sm rounded-r-lg focus:ring-0 focus:outline-none cursor-pointer appearance-none ${isKeep ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                                        >
                                            <option value="FIXED">đ</option>
                                            <option value="PERCENT">%</option>
                                        </select>
                                        {/* Icon mũi tên nhỏ cho select đơn vị */}
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
                                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Section: Mô phỏng giá */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 min-h-[300px] flex flex-col justify-between relative">
                <h3 className="text-[15px] font-bold text-gray-900 mb-4">Mô phỏng giá cho tuần tới</h3>

                {/* Chart placeholder */}
                <div className="flex-1 w-full bg-gray-50/50 rounded border border-dashed border-gray-200 mb-4 flex items-center justify-center text-gray-400 text-sm">
                    Biểu đồ biến động giá
                </div>

                {/* Footer thông số */}
                <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-gray-600 pt-4 border-t border-gray-100">
                    <div>
                        Giá Gốc: <span className="font-bold text-gray-900 underline decoration-gray-300 underline-offset-4">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(basePrice)}</span>
                    </div>
                    <div>
                        Thứ Bảy: <span className="font-bold text-gray-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(basePrice + 100000)}</span> <span className="text-green-600 font-medium">(+6.7%)</span>
                    </div>
                    <div>
                        Chủ Nhật: <span className="font-bold text-gray-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(basePrice + 200000)}</span> <span className="text-green-600 font-medium">(+13.3%)</span>
                    </div>
                </div>

                {/* Labels ngày tháng dưới cùng biểu đồ */}
                <div className="flex justify-between text-xs text-gray-400 mt-2 px-2">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
            </div>
        </div>
    );
};

export default WeeklyStrategy;