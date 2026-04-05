import { useState, useMemo } from "react";
import { DollarSign, TrendingUp, BarChart3, Bed } from "lucide-react";
import { DEMO_REVENUE_DATA } from "../mockData";

const formatCurrency = (n) =>
    new Intl.NumberFormat("vi-VN").format(n);

const RANGES = [
    { key: "7d", label: "7 ngày" },
    { key: "14d", label: "14 ngày" },
    { key: "30d", label: "30 ngày" },
];

const DemoRevenueReport = () => {
    const [range, setRange] = useState("30d");

    const data = useMemo(() => {
        const days = range === "7d" ? 7 : range === "14d" ? 14 : 30;
        return DEMO_REVENUE_DATA.daily.slice(-days);
    }, [range]);

    const totals = useMemo(() => {
        const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
        const totalBookings = data.reduce((s, d) => s + d.bookings, 0);
        const avgOccupancy =
            Math.round(
                data.reduce((s, d) => s + d.occupancy, 0) / data.length
            );
        const avgAdr =
            Math.round(data.reduce((s, d) => s + d.adr, 0) / data.length);
        return { totalRevenue, totalBookings, avgOccupancy, avgAdr };
    }, [data]);

    const maxRevenue = Math.max(...data.map((d) => d.revenue));

    const kpis = [
        {
            label: "Tổng doanh thu",
            value: formatCurrency(totals.totalRevenue) + " VND",
            icon: DollarSign,
            gradient: "from-blue-600 to-indigo-600",
            shadow: "shadow-blue-200/50",
        },
        {
            label: "Tổng đặt phòng",
            value: totals.totalBookings,
            icon: Bed,
            gradient: "from-emerald-500 to-teal-500",
            shadow: "shadow-emerald-200/50",
        },
        {
            label: "Công suất TB",
            value: totals.avgOccupancy + "%",
            icon: BarChart3,
            gradient: "from-amber-500 to-orange-500",
            shadow: "shadow-amber-200/50",
        },
        {
            label: "ADR trung bình",
            value: formatCurrency(totals.avgAdr) + " VND",
            icon: TrendingUp,
            gradient: "from-violet-500 to-purple-600",
            shadow: "shadow-violet-200/50",
        },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        Báo cáo doanh thu
                    </h1>
                    <p className="text-sm text-slate-400 font-medium">
                        Thống kê doanh thu và hiệu suất kinh doanh
                    </p>
                </div>
                <div className="flex gap-1 bg-white rounded-xl p-1 border border-slate-100 shadow-sm">
                    {RANGES.map((r) => (
                        <button
                            key={r.key}
                            onClick={() => setRange(r.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                range === r.key
                                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                                    : "text-slate-500 hover:bg-slate-50"
                            }`}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
                {kpis.map(({ label, value, icon: Icon, gradient, shadow }) => (
                    <div
                        key={label}
                        className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div
                                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg ${shadow}`}
                            >
                                <Icon size={18} className="text-white" />
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                {label}
                            </span>
                        </div>
                        <p className="text-xl font-black text-slate-900">
                            {value}
                        </p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-base font-black text-slate-800 mb-6">
                    Biểu đồ doanh thu theo ngày
                </h2>
                <div className="flex items-end gap-[3px] h-52">
                    {data.map((d) => {
                        const pct = (d.revenue / maxRevenue) * 100;
                        return (
                            <div
                                key={d.date}
                                className="flex-1 group relative"
                            >
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                    {d.date}: {formatCurrency(d.revenue)} VND
                                </div>
                                <div
                                    className={`w-full rounded-t-md transition-all ${
                                        d.occupancy >= 80
                                            ? "bg-gradient-to-t from-blue-600 to-indigo-500"
                                            : d.occupancy >= 50
                                            ? "bg-gradient-to-t from-blue-400 to-blue-500"
                                            : "bg-gradient-to-t from-blue-200 to-blue-300"
                                    } group-hover:opacity-80`}
                                    style={{ height: `${pct}%` }}
                                />
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-between mt-2 text-[9px] font-bold text-slate-300">
                    <span>{data[0]?.date}</span>
                    <span>{data[data.length - 1]?.date}</span>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h2 className="text-base font-black text-slate-800">
                        Chi tiết theo ngày
                    </h2>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                    <table className="w-full">
                        <thead className="sticky top-0 bg-white">
                            <tr className="border-b border-slate-100 text-xs font-black text-slate-400 uppercase tracking-widest">
                                <th className="text-left px-6 py-3">Ngày</th>
                                <th className="text-right px-6 py-3">
                                    Doanh thu
                                </th>
                                <th className="text-right px-6 py-3">
                                    Đặt phòng
                                </th>
                                <th className="text-right px-6 py-3">
                                    Công suất
                                </th>
                                <th className="text-right px-6 py-3">ADR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...data].reverse().map((d) => (
                                <tr
                                    key={d.date}
                                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                                >
                                    <td className="px-6 py-3 text-sm font-bold text-slate-700">
                                        {d.date}
                                    </td>
                                    <td className="px-6 py-3 text-sm font-black text-blue-600 text-right">
                                        {formatCurrency(d.revenue)} VND
                                    </td>
                                    <td className="px-6 py-3 text-sm font-bold text-slate-600 text-right">
                                        {d.bookings}
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <span
                                            className={`text-sm font-black ${
                                                d.occupancy >= 80
                                                    ? "text-green-600"
                                                    : d.occupancy >= 50
                                                    ? "text-amber-600"
                                                    : "text-slate-500"
                                            }`}
                                        >
                                            {d.occupancy}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-sm font-bold text-slate-600 text-right">
                                        {formatCurrency(d.adr)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DemoRevenueReport;
