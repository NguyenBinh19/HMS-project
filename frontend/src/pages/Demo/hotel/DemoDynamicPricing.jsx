import { useState } from "react";
import { Zap, Calendar, BarChart3, ToggleLeft, ToggleRight } from "lucide-react";
import { DEMO_DYNAMIC_PRICING } from "../mockData";

const TABS = [
    { key: "weekly", label: "Chiến lược theo tuần", icon: Calendar },
    { key: "events", label: "Sự kiện đặc biệt", icon: Zap },
    { key: "occupancy", label: "Quy tắc công suất", icon: BarChart3 },
];

const DemoDynamicPricing = () => {
    const [tab, setTab] = useState("weekly");
    const [autoEnabled, setAutoEnabled] = useState(true);

    const { weeklyRules, events, occupancyRules } = DEMO_DYNAMIC_PRICING;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        Định giá động
                    </h1>
                    <p className="text-sm text-slate-400 font-medium">
                        Tự động điều chỉnh giá phòng theo nhu cầu thị trường
                    </p>
                </div>
                <button
                    onClick={() => setAutoEnabled(!autoEnabled)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                        autoEnabled
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200/50"
                            : "bg-slate-100 text-slate-500"
                    }`}
                >
                    {autoEnabled ? (
                        <ToggleRight size={18} />
                    ) : (
                        <ToggleLeft size={18} />
                    )}
                    Tự động định giá: {autoEnabled ? "BẬT" : "TẮT"}
                </button>
            </div>

            <div className="flex gap-2 bg-white rounded-xl p-1 border border-slate-100 shadow-sm w-fit">
                {TABS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                            tab === key
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                                : "text-slate-500 hover:bg-slate-50"
                        }`}
                    >
                        <Icon size={16} />
                        {label}
                    </button>
                ))}
            </div>

            {tab === "weekly" && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h2 className="text-base font-black text-slate-800">
                            Điều chỉnh giá theo ngày trong tuần
                        </h2>
                    </div>
                    <div className="grid grid-cols-7 divide-x divide-slate-100">
                        {weeklyRules.map((ws) => (
                            <div
                                key={ws.day}
                                className="p-4 text-center hover:bg-slate-50/50 transition-colors"
                            >
                                <p className="text-xs font-black text-slate-400 uppercase mb-3">
                                    {ws.day}
                                </p>
                                <div
                                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-black ${
                                        ws.modifier > 0
                                            ? "bg-green-50 text-green-600"
                                            : ws.modifier < 0
                                            ? "bg-red-50 text-red-600"
                                            : "bg-slate-50 text-slate-500"
                                    }`}
                                >
                                    {ws.modifier > 0 ? "+" : ""}
                                    {ws.modifier}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tab === "events" && (
                <div className="space-y-4">
                    {events.map((ev, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center justify-between hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200/50">
                                    <Zap size={20} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-800">
                                        {ev.name}
                                    </p>
                                    <p className="text-xs text-slate-400 font-medium">
                                        {ev.startDate} - {ev.endDate}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div
                                    className={`px-4 py-2 rounded-xl text-sm font-black ${
                                        ev.modifier > 0
                                            ? "bg-green-50 text-green-600"
                                            : "bg-red-50 text-red-600"
                                    }`}
                                >
                                    {ev.modifier > 0 ? "+" : ""}
                                    {ev.modifier}%
                                </div>
                                <span
                                    className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
                                        ev.isActive
                                            ? "bg-green-100 text-green-700"
                                            : "bg-slate-100 text-slate-400"
                                    }`}
                                >
                                    {ev.isActive ? "Đang hoạt động" : "Không hoạt động"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {tab === "occupancy" && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h2 className="text-base font-black text-slate-800">
                            Điều chỉnh giá theo công suất
                        </h2>
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 text-xs font-black text-slate-400 uppercase tracking-widest">
                                <th className="text-left px-6 py-3">
                                    Mức công suất
                                </th>
                                <th className="text-center px-6 py-3">
                                    Tỷ lệ lấp phòng
                                </th>
                                <th className="text-center px-6 py-3">
                                    Điều chỉnh giá
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {occupancyRules.map((rule, i) => (
                                <tr
                                    key={i}
                                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                                >
                                    <td className="px-6 py-4 text-sm font-bold text-slate-700">
                                        {rule.threshold}%+
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${
                                                        rule.threshold > 80
                                                            ? "bg-red-500"
                                                            : rule.threshold > 50
                                                            ? "bg-amber-500"
                                                            : "bg-blue-500"
                                                    }`}
                                                    style={{
                                                        width: `${rule.threshold}%`,
                                                    }}
                                                />
                                            </div>
                                            <span className="text-xs font-black text-slate-500">
                                                {rule.threshold}%+
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-sm font-black ${
                                                rule.modifier > 0
                                                    ? "bg-green-50 text-green-600"
                                                    : rule.modifier < 0
                                                    ? "bg-red-50 text-red-600"
                                                    : "bg-slate-50 text-slate-500"
                                            }`}
                                        >
                                            {rule.modifier > 0 ? "+" : ""}
                                            {rule.modifier}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DemoDynamicPricing;
