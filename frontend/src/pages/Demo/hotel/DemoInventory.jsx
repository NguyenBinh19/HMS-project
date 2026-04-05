import { useState } from "react";
import { Ban, ChevronLeft, ChevronRight } from "lucide-react";
import { DEMO_INVENTORY_GRID, DEMO_ROOM_TYPES } from "../mockData";

const formatCurrency = (n) =>
    new Intl.NumberFormat("vi-VN").format(n);

const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return {
        dayName: days[d.getDay()],
        dayNum: d.getDate(),
        month: d.getMonth() + 1,
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
    };
};

const DemoInventory = () => {
    const [offset, setOffset] = useState(0);
    const visibleDays = DEMO_INVENTORY_GRID.slice(offset, offset + 7);
    const roomTypes = DEMO_ROOM_TYPES.filter((r) => r.isActive);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        Lịch quản lý tồn kho
                    </h1>
                    <p className="text-sm text-slate-400 font-medium">
                        Quản lý giá và số lượng phòng khả dụng theo ngày
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        disabled={offset === 0}
                        onClick={() => setOffset(Math.max(0, offset - 7))}
                        className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-colors"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <span className="text-sm font-bold text-slate-600 px-3">
                        {visibleDays[0]?.date} - {visibleDays[visibleDays.length - 1]?.date}
                    </span>
                    <button
                        disabled={offset + 7 >= DEMO_INVENTORY_GRID.length}
                        onClick={() =>
                            setOffset(
                                Math.min(
                                    DEMO_INVENTORY_GRID.length - 7,
                                    offset + 7
                                )
                            )
                        }
                        className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-colors"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="text-left px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-widest w-[160px] sticky left-0 bg-white">
                                Loại phòng
                                </th>
                                {visibleDays.map((day) => {
                                    const d = formatDate(day.date);
                                    return (
                                        <th
                                            key={day.date}
                                            className={`text-center px-2 py-3 min-w-[100px] ${
                                                d.isWeekend
                                                    ? "bg-amber-50/50"
                                                    : ""
                                            }`}
                                        >
                                            <div className="text-[10px] font-black text-slate-400 uppercase">
                                                {d.dayName}
                                            </div>
                                            <div className="text-sm font-black text-slate-700">
                                                {d.dayNum}/{d.month}
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {roomTypes.map((rt) => (
                                <tr
                                    key={rt.id}
                                    className="border-b border-slate-50 hover:bg-slate-50/30"
                                >
                                    <td className="px-4 py-4 sticky left-0 bg-white">
                                        <p className="text-sm font-bold text-slate-800">
                                            {rt.title}
                                        </p>
                                        <p className="text-[10px] text-slate-400">
                                            {rt.totalRooms} phòng
                                        </p>
                                    </td>
                                    {visibleDays.map((day) => {
                                        const cell = day.roomTypes.find(
                                            (r) => r.roomTypeId === rt.id
                                        );
                                        if (!cell) return <td key={day.date} />;
                                        const d = formatDate(day.date);
                                        return (
                                            <td
                                                key={day.date}
                                                className={`text-center px-2 py-3 ${
                                                    d.isWeekend
                                                        ? "bg-amber-50/50"
                                                        : ""
                                                } ${
                                                    cell.stopSell
                                                        ? "bg-red-50"
                                                        : ""
                                                }`}
                                            >
                                                {cell.stopSell ? (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <Ban
                                                            size={16}
                                                            className="text-red-500"
                                                        />
                                                        <span className="text-[10px] font-black text-red-500 uppercase">
                                                            Stop-sell
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-1">
                                                        <div className="text-sm font-black text-blue-600">
                                                            {formatCurrency(
                                                                cell.rate
                                                            )}
                                                        </div>
                                                        <div
                                                            className={`text-[10px] font-bold ${
                                                                cell.available <=
                                                                3
                                                                    ? "text-red-500"
                                                                    : "text-slate-400"
                                                            }`}
                                                        >
                                                            {cell.available}{" "}
                                                            phòng
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex gap-6 text-xs font-bold text-slate-400">
                <span className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-amber-50 rounded border border-amber-200" />{" "}
                    Cuối tuần (giá cao hơn)
                </span>
                <span className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-50 rounded border border-red-200" />{" "}
                    Stop-sell
                </span>
                <span className="flex items-center gap-2">
                    <span className="text-red-500">3 phòng</span> Sắp hết
                    phòng
                </span>
            </div>
        </div>
    );
};

export default DemoInventory;
