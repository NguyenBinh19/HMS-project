import React from 'react';
import { Hotel, User } from "lucide-react";

const KYCTable = ({ data, onReview }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-100">
                    <th className="px-6 py-4 font-semibold">Ngày nộp</th>
                    <th className="px-6 py-4 font-semibold">Đối tượng</th>
                    <th className="px-6 py-4 font-semibold">Tên đơn vị</th>
                    <th className="px-6 py-4 font-semibold">Mã số thuế</th>
                    <th className="px-6 py-4 font-semibold text-center">Độ khớp OCR</th>
                    <th className="px-6 py-4 font-semibold">Người xử lý</th>
                    <th className="px-6 py-4 font-semibold text-right">Hành động</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {data.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 text-[13px] text-slate-500">{row.date}</td>
                        <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase ${row.type === 'Khách sạn' ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"}`}>
                                    {row.type === 'Khách sạn' ? <Hotel size={12} /> : <User size={12} />} {row.type}
                                </span>
                        </td>
                        <td className="px-6 py-4 text-[13px] font-bold text-slate-800">{row.name}</td>
                        <td className="px-6 py-4 text-[13px] text-slate-500 font-mono">{row.taxId}</td>
                        <td className="px-6 py-4 text-center">
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold ${row.status === 'Match' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                                    <span className={`w-2 h-2 rounded-full ${row.status === 'Match' ? "bg-green-500" : "bg-red-500"}`}></span>
                                    {row.status === 'Match' ? `${row.ocrScore}% Match` : row.status}
                                </span>
                        </td>
                        <td className="px-6 py-4 text-[13px] text-slate-500">{row.handler}</td>
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