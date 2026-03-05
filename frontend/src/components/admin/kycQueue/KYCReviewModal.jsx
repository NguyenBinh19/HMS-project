import React from 'react';
import { X, AlertTriangle, Check, RotateCcw, Clock, Lock, Search, Maximize2 } from "lucide-react";

const KYCReviewModal = ({ data, onClose }) => {
    if (!data) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
            <div className="bg-white w-full max-w-7xl rounded-xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">

                {/* Header */}
                <div className="px-6 py-4 border-b flex justify-between items-center bg-white">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Duyệt hồ sơ</h2>
                        <p className="text-xs text-slate-500 uppercase tracking-tight">{data.name} • Mã số thuế: {data.taxId}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden flex">
                    {/* Left: Form Data */}
                    <div className="w-[45%] overflow-y-auto p-6 border-r space-y-8">
                        <div>
                            <h4 className="text-[13px] font-bold text-slate-800 mb-4 uppercase">Thông tin doanh nghiệp</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-400 block mb-1">TÊN CTY</label>
                                    <input type="text" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-[13px] font-medium" defaultValue={data.name} />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-400 block mb-1">MÃ SỐ THUẾ</label>
                                    <input type="text" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-[13px]" defaultValue={data.taxId} />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-400 block mb-1">ĐỊA CHỈ</label>
                                    <textarea className="w-full px-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-[13px] min-h-[80px]" defaultValue={data.address} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-[13px] font-bold text-slate-800 mb-4 uppercase">Người đại diện</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-400 block mb-1">HỌ TÊN</label>
                                    <input type="text" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-[13px]" defaultValue={data.representative} />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-400 block mb-1">SỐ CMND/CCCD</label>
                                    <input type="text" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-[13px]" defaultValue={data.idNumber} />
                                </div>
                            </div>
                        </div>

                        {/* AI Warning Section */}
                        <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-xl p-4 space-y-3">
                            <div className="flex items-center gap-2 text-[#b45309] font-bold text-sm">
                                <AlertTriangle size={18} /> Cảnh báo hệ thống AI
                            </div>
                            <ul className="text-xs text-[#d97706] space-y-2 list-none pl-1">
                                <li className="flex items-start gap-2">● Tên công ty không khớp với Tổng cục thuế.</li>
                                <li className="flex items-start gap-2">● Mã số thuế đã tồn tại trên hệ thống (Trùng lặp).</li>
                                <li className="flex items-start gap-2">● Ảnh CCCD mặt sau có độ nét thấp (OCR Score: {data.ocrScore}%).</li>
                            </ul>
                        </div>
                    </div>

                    {/* Right: Document Preview */}
                    <div className="flex-1 bg-slate-50 p-6 flex flex-col overflow-hidden">
                        <div className="mb-4">
                            <h4 className="text-[13px] font-bold text-slate-800">Tài liệu gốc</h4>
                            <p className="text-[11px] text-slate-400">Ảnh chụp giấy tờ pháp lý</p>
                        </div>

                        <div className="flex gap-3 mb-6">
                            {['GPKD', 'CCCD Mặt trước', 'CCCD Mặt sau', 'Ảnh chân dung'].map((item, idx) => (
                                <div key={idx} className={`w-20 h-20 bg-white border-2 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${idx === 0 ? 'border-blue-500 ring-2 ring-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                    <div className="w-6 h-6 bg-slate-100 rounded mb-1 opacity-50"></div>
                                    <span className="text-[9px] text-center font-bold text-slate-500 px-1">{item}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex-1 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden shadow-inner">
                            <div className="p-3 border-b flex justify-between items-center bg-white px-5">
                                <span className="text-[12px] font-bold text-slate-700">Giấy phép kinh doanh</span>
                                <div className="flex gap-4 text-slate-400">
                                    <Search size={16} /><RotateCcw size={16} /><Maximize2 size={16} />
                                </div>
                            </div>
                            <div className="flex-1 p-8 flex items-center justify-center">
                                {/* Placeholder for Document - Vẽ giả các dòng nội dung OCR */}
                                <div className="w-full max-w-sm h-full border-2 border-emerald-100 border-dashed rounded-lg bg-emerald-50/20 p-6 flex flex-col gap-4">
                                    <div className="h-4 w-3/4 bg-emerald-100/50 rounded ring-1 ring-emerald-200"></div>
                                    <div className="h-4 w-1/2 bg-emerald-100/50 rounded ring-1 ring-emerald-200"></div>
                                    <div className="h-10 w-full bg-emerald-100/30 rounded border border-emerald-200"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-5 border-t bg-[#f8fafc] flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-6 text-[12px] font-medium text-slate-500">
                        <span className="flex items-center gap-1.5"><Clock size={15} className="text-slate-400"/> Thời hạn xử lý <b className="text-red-500 font-bold">23:59:38</b></span>
                        <span className="flex items-center gap-1.5"><Lock size={15} className="text-slate-400"/> Đang xem bởi: <b className="text-slate-800">Admin01</b></span>
                    </div>
                    <div className="flex gap-3 font-bold">
                        <button className="px-5 py-2.5 bg-[#fef3c7] text-[#92400e] rounded-lg text-sm flex items-center gap-2 hover:bg-[#fde68a] transition-all"><RotateCcw size={16}/> Yêu cầu bổ sung</button>
                        <button className="px-5 py-2.5 bg-[#ef4444] text-white rounded-lg text-sm flex items-center gap-2 hover:bg-red-600 shadow-md transition-all"><X size={16}/> TỪ CHỐI</button>
                        <button className="px-5 py-2.5 bg-[#10b981] text-white rounded-lg text-sm flex items-center gap-2 hover:bg-emerald-600 shadow-md transition-all"><Check size={16}/> PHÊ DUYỆT</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KYCReviewModal;