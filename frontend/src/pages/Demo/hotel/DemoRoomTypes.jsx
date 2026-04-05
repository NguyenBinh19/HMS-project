import { useState } from "react";
import { Plus, Edit2, Trash2, Users, Maximize, BedDouble, X, Save } from "lucide-react";
import { DEMO_ROOM_TYPES } from "../mockData";

const formatCurrency = (n) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const DemoRoomTypes = () => {
    const [roomTypes, setRoomTypes] = useState([...DEMO_ROOM_TYPES]);
    const [editingId, setEditingId] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

    const handleToggleActive = (id) => {
        setRoomTypes((prev) =>
            prev.map((rt) =>
                rt.id === id ? { ...rt, isActive: !rt.isActive } : rt
            )
        );
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        Quản lý phòng
                    </h1>
                    <p className="text-sm text-slate-400 font-medium">
                        Quản lý loại phòng và cấu hình giá cơ bản
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 active:scale-95"
                >
                    <Plus size={16} /> Thêm loại phòng
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {roomTypes.map((rt) => (
                    <div
                        key={rt.id}
                        className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all ${
                            rt.isActive
                                ? "border-slate-100"
                                : "border-red-100 opacity-70"
                        }`}
                    >
                        {/* Image placeholder */}
                        <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center relative">
                            <BedDouble
                                size={48}
                                className="text-slate-200"
                            />
                            <div className="absolute top-4 right-4 flex gap-2">
                                <span
                                    className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                                        rt.isActive
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-600"
                                    }`}
                                >
                                    {rt.isActive ? "ACTIVE" : "INACTIVE"}
                                </span>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900">
                                        {rt.title}
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {rt.description}
                                    </p>
                                </div>
                                <p className="text-lg font-black text-blue-600">
                                    {formatCurrency(rt.basePrice)}
                                </p>
                            </div>

                            <div className="flex items-center gap-6 text-sm text-slate-500 mb-4">
                                <span className="flex items-center gap-1.5">
                                    <Users size={14} /> {rt.adults} người lớn,{" "}
                                    {rt.children} trẻ em
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Maximize size={14} /> {rt.area}m²
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-1.5 mb-4">
                                {rt.amenities.map((a, i) => (
                                    <span
                                        key={i}
                                        className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded text-[10px] font-bold"
                                    >
                                        {a}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <span className="text-sm font-bold text-slate-600">
                                    {rt.availableRooms}/{rt.totalRooms} phòng
                                    khả dụng
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleToggleActive(rt.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                            rt.isActive
                                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                                : "bg-green-50 text-green-600 hover:bg-green-100"
                                        }`}
                                    >
                                        {rt.isActive ? "Ngừng bán" : "Kích hoạt"}
                                    </button>
                                    <button className="p-1.5 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors">
                                        <Edit2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Simple add modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                        onClick={() => setShowAddModal(false)}
                    />
                    <div className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 rounded-full"
                        >
                            <X size={20} />
                        </button>
                        <h3 className="text-xl font-black text-slate-900 mb-6">
                            Thêm loại phòng mới
                        </h3>
                        <div className="space-y-4">
                            <input
                                placeholder="Tên loại phòng"
                                className="w-full px-4 py-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600"
                            />
                            <div className="grid grid-cols-3 gap-3">
                                <input
                                    placeholder="Diện tích (m²)"
                                    type="number"
                                    className="w-full px-4 py-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600"
                                />
                                <input
                                    placeholder="Người lớn"
                                    type="number"
                                    className="w-full px-4 py-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600"
                                />
                                <input
                                    placeholder="Số phòng"
                                    type="number"
                                    className="w-full px-4 py-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600"
                                />
                            </div>
                            <input
                                placeholder="Giá cơ bản (VND)"
                                type="number"
                                className="w-full px-4 py-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600"
                            />
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-black text-sm hover:bg-blue-700 transition-colors"
                            >
                                <Save size={16} /> Lưu (Demo)
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-4 text-center font-bold">
                            Tính năng này không khả dụng trong chế độ Demo
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DemoRoomTypes;
