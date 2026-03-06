import React from 'react';
import { Hotel, User } from "lucide-react";

const KYCTable = ({ data, onReview, loading }) => {
    if (loading) return <div className="bg-white p-10 text-center border">Đang tải dữ liệu...</div>;

    return (
        <div className="bg-white rounded-b-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-100">
                    <th className="px-6 py-4 font-semibold">Ngày nộp</th>
                    <th className="px-6 py-4 font-semibold">Đối tượng</th>
                    <th className="px-6 py-4 font-semibold">Tên đơn vị</th>
                    <th className="px-6 py-4 font-semibold">Mã số thuế</th>
                    <th className="px-6 py-4 font-semibold">Người xử lý</th>
                    <th className="px-6 py-4 font-semibold text-right">Hành động</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {data.length === 0 ? (
                    <tr><td colSpan="6" className="p-10 text-center text-slate-400 text-sm">Không có hồ sơ nào</td></tr>
                ) : data.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 text-[13px] text-slate-500">
                            {new Date(row.submittedAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase ${row.partnerType === 'HOTEL' ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"}`}>
                                {row.partnerType === 'HOTEL' ? <Hotel size={12} /> : <User size={12} />} {row.partnerType}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-[13px] font-bold text-slate-800">{row.legalName}</td>
                        <td className="px-6 py-4 text-[13px] text-slate-500 font-mono">{row.taxCode}</td>
                        <td className="px-6 py-4 text-[13px] text-slate-500">{row.reviewedBy || "Chưa có"}</td>
                        <td className="px-6 py-4 text-right">
                            <button
                                onClick={() => onReview(row)}
                                className="bg-[#007bff] hover:bg-blue-700 text-white px-5 py-1.5 rounded-lg text-[13px] font-semibold transition-all shadow-sm"
                            >
                                Review
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default KYCTable;