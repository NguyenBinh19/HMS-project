import React, { useState } from 'react';
import { Calendar, Trash2, Edit2, Plus } from 'lucide-react';

const SpecialEvents = () => {
    // Mapping DB: room_pricing_rules
    const [events, setEvents] = useState([
        {
            rule_id: 1,
            rule_name: 'Lễ 30/04',
            start_date: '2026-04-30',
            end_date: '2026-05-01',
            adjustment_type: 'PERCENT',
            adjustment_value: 50,
            constraints: 'Yêu cầu ở tối thiểu 2 đêm'
        },
        {
            rule_id: 2,
            rule_name: 'Giỗ tổ Hùng Vương',
            start_date: '2026-04-14',
            end_date: '2026-04-14',
            adjustment_type: 'PERCENT',
            adjustment_value: 30,
            constraints: ''
        }
    ]);

    return (
        <div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Sự kiện Ngày Lễ & Đặc biệt</h2>
            <p className="text-sm text-gray-500 mb-6">Cấu hình giá cho các ngày lễ và sự kiện đặc biệt</p>

            {/* FORM ADD NEW */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4">Thêm Sự kiện Mới</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên sự kiện</label>
                        <input type="text" placeholder="ví dụ: Tết Nguyên Đán" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Khoảng thời gian</label>
                        <div className="flex items-center gap-2">
                            <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none" />
                            <span className="text-gray-500">đến</span>
                            <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none" />
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Điều chỉnh giá</label>
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="adjustment" className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-gray-700">Giá cố định</span>
                            <div className="relative ml-2">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₫</span>
                                <input type="number" disabled placeholder="2,000,000" className="pl-6 border border-gray-300 rounded-lg px-3 py-1.5 w-40 bg-gray-50" />
                            </div>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="adjustment" defaultChecked className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-gray-700 font-medium">Điều chỉnh</span>
                            <div className="flex items-center ml-2">
                                <input type="number" placeholder="50" className="border border-gray-300 rounded-l-lg px-3 py-1.5 w-24 outline-none" />
                                <span className="border border-gray-300 border-l-0 bg-gray-50 rounded-r-lg px-3 py-1.5 text-gray-500">%</span>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ràng buộc</label>
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            Yêu cầu ở tối thiểu 2 đêm
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            Không hoàn hủy
                        </label>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg flex items-center gap-2 transition-colors">
                        <Plus size={18} />
                        Thêm Sự kiện
                    </button>
                </div>
            </div>

            {/* LIST OF EVENTS */}
            <div>
                <h3 className="font-bold text-gray-800 mb-3">Danh sách Sự kiện Hiện tại</h3>
                <div className="space-y-3">
                    {events.map(ev => (
                        <div key={ev.rule_id} className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:shadow-sm transition-shadow">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="font-bold text-gray-800">{ev.rule_name}</span>
                                </div>
                                <div className="text-sm text-gray-500 flex items-center gap-2 mb-2">
                                    <Calendar size={14} />
                                    {ev.start_date} - {ev.end_date}
                                </div>
                                <div className="flex items-center gap-3">
                            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded">
                                +{ev.adjustment_value}{ev.adjustment_type === 'PERCENT' ? '%' : 'đ'}
                            </span>
                                    {ev.constraints && (
                                        <span className="text-xs text-gray-500">{ev.constraints}</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                                    <Edit2 size={16} />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SpecialEvents;