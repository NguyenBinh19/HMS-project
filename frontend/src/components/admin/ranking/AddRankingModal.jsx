import React, { useState } from 'react';
import { X, Save, TrendingUp, ShoppingCart } from 'lucide-react';

const AddRankingModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        color: '#3b82f6',
        revenue: 0,
        orders: 0,
        logic: 'AND'
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800">Cấu hình hạng mới</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={24} /></button>
                </div>

                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Tên hạng</label>
                            <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Nhập tên hạng..." />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Màu sắc đại diện</label>
                            <div className="flex gap-2"><input type="color" className="w-10 h-10 rounded-lg cursor-pointer" /><input type="text" placeholder="#000000" className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2">Điều kiện thăng hạng</h4>
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-3 text-emerald-600 font-bold flex items-center gap-2"><TrendingUp size={18}/> Doanh thu GMV</div>
                                <select className="p-3 bg-white border border-slate-200 rounded-xl text-sm"><option>Lớn hơn hoặc bằng</option></select>
                                <input type="number" className="p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold" placeholder="0" />
                                <input type="text" value="VNĐ" readOnly className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-sm" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                    <button onClick={onClose} className="px-6 py-2.5 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all">Hủy bỏ</button>
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
                        <Save size={18} /> Lưu hạng mới
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddRankingModal;