import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, TrendingUp, ShoppingCart, Award, ShieldCheck } from 'lucide-react';

const EditRankingDetailModal = ({ isOpen, onClose, rankId }) => {
    const [activeTab, setActiveTab] = useState('threshold');
    const [isEditing, setIsEditing] = useState(false);

    // Giả lập Fetch Data theo rankId khi mở modal
    useEffect(() => {
        if (rankId && isOpen) {
            console.log("Fetching detail for rank:", rankId);
            // setFormData(apiResponse);
        }
    }, [rankId, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Thông tin chi tiết hạng</h3>
                        <p className="text-xs text-blue-600 font-bold">ID: RANK-{rankId}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={24} /></button>
                </div>

                <div className="flex px-6 border-b border-slate-100 bg-slate-50/30">
                    {[
                        { id: 'threshold', label: 'Định danh & Ngưỡng', icon: <TrendingUp size={14}/> },
                        { id: 'benefits', label: 'Quyền lợi', icon: <Award size={14}/> },
                        { id: 'retention', label: 'Điều kiện giữ hạng', icon: <ShieldCheck size={14}/> }
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
                                    activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                                }`}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-8 max-h-[60vh] overflow-y-auto">
                    {activeTab === 'threshold' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2">Tên hạng hiện tại</label>
                                    <input type="text" className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700" defaultValue="Bronze" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2">Mã màu hiển thị</label>
                                    <div className="flex gap-2 items-center">
                                        <div className="w-10 h-10 bg-blue-400 rounded-lg shrink-0"></div>
                                        <input type="text" className="flex-1 p-3 bg-white border border-slate-200 rounded-xl text-sm font-mono" defaultValue="#60a5fa" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                                <p className="text-sm font-bold text-blue-800 mb-4 flex items-center gap-2"><TrendingUp size={16}/> Cấu hình ngưỡng thăng hạng</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">Doanh thu tối thiểu</span>
                                        <p className="text-lg font-black text-slate-800">100.000.000 đ</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">Đơn hàng tối thiểu</span>
                                        <p className="text-lg font-black text-slate-800">5 đơn/tháng</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Các Tab benefits và retention có thể render tương tự */}
                </div>

                <div className="p-6 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <button className="flex items-center gap-2 text-rose-500 hover:bg-rose-100 px-4 py-2.5 rounded-xl transition-all font-bold text-sm border border-transparent hover:border-rose-200">
                        <Trash2 size={18} /> Xóa hạng này
                    </button>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-6 py-2.5 font-bold text-slate-500 hover:bg-slate-100 rounded-xl text-sm transition-all">Đóng</button>
                        <button className="flex items-center gap-2 bg-slate-900 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-slate-800 shadow-lg transition-all text-sm">
                            <Save size={18} /> Cập nhật thay đổi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditRankingDetailModal;