import React, { useState, useEffect } from 'react';
import { X, Save, TrendingUp, ShieldCheck, Wallet, Loader2, Info, Star, AlertCircle, Trophy, Crown, Medal, Gem, Award, Zap } from 'lucide-react';
import { rankService } from '@/services/rank.service.js';

const EditRankingDetailModal = ({ isOpen, onClose, rankId, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [formData, setFormData] = useState(null);

    // Danh sách các Icon khả dụng
    const iconOptions = [
        { id: 'star', component: Star },
        { id: 'trophy', component: Trophy },
        { id: 'crown', component: Crown },
        { id: 'medal', component: Medal },
        { id: 'gem', component: Gem },
        { id: 'award', component: Award },
        { id: 'zap', component: Zap },
    ];

    useEffect(() => {
        if (rankId && isOpen) loadDetail();
    }, [rankId, isOpen]);

    const loadDetail = async () => {
        setFetching(true);
        try {
            const res = await rankService.getRankDetail(rankId);
            setFormData(res.result);
        } catch (error) {
            alert("Không thể tải thông tin chi tiết!");
            onClose();
        } finally { setFetching(false); }
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        let finalValue = value;

        if (type === 'number') {
            // 1. Nếu xóa hết (chuỗi rỗng), cho phép để trống để nhập số mới
            if (value === '') {
                setFormData(prev => ({ ...prev, [name]: '' }));
                return;
            }

            // 2. Ép kiểu số
            const num = name.includes('Revenue') || name === 'creditLimit'
                ? parseFloat(value) : parseInt(value);

            // 3. Chặn số âm, nhưng không ép về 0 ngay lập tức nếu đang nhập
            finalValue = isNaN(num) ? 0 : Math.max(0, num);
        }

        // Logic nhập mã màu Hex trực tiếp
        if (name === 'colorText') {
            let colorVal = value.startsWith('#') ? value : `#${value}`;
            setFormData(prev => ({ ...prev, color: colorVal.toUpperCase() }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const selectIcon = (iconId) => {
        setFormData(prev => ({ ...prev, icon: iconId }));
    };

    const validateForm = () => {
        if (!formData.rankName.trim()) { alert("Tên hạng không được để trống!"); return false; }
        if (formData.priority < 1) { alert("Độ ưu tiên tối thiểu là 1!"); return false; }
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (!hexRegex.test(formData.color)) { alert("Mã màu không hợp lệ!"); return false; }
        return true;
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        try {
            const updatePayload = {
                rankName: formData.rankName,
                description: formData.description,
                icon: formData.icon,
                color: formData.color,
                priority: formData.priority,
                isActive: formData.isActive,
                minTotalBooking: formData.minTotalBooking,
                minTotalRevenue: formData.minTotalRevenue,
                logic: formData.logic,
                maintainMinBooking: formData.maintainMinBooking,
                maintainMinRevenue: formData.maintainMinRevenue,
                maintainLogic: formData.maintainLogic,
            };

            await rankService.updateRank(rankId, updatePayload);
            alert("Cập nhật thay đổi thành công!");
            onSuccess();
            onClose();
        } catch (error) {
            alert("Lỗi: " + (error.response?.data?.message || "Không thể cập nhật"));
        } finally { setLoading(false); }
    };

    if (!isOpen || !formData) return null;

    // Lấy component icon hiện tại
    const SelectedIconTag = iconOptions.find(i => i.id === formData.icon)?.component || Star;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <form onSubmit={handleUpdate} className="bg-white w-full max-w-4xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl text-white shadow-lg transition-all duration-500" style={{ backgroundColor: formData.color }}>
                            <SelectedIconTag size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Chỉnh sửa: {formData.rankName}</h3>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
                </div>

                <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
                    {fetching ? (
                        <div className="py-20 flex flex-col items-center gap-4">
                            <Loader2 className="animate-spin text-blue-600" size={40}/>
                            <p className="text-slate-400 font-medium">Đang lấy dữ liệu từ hệ thống...</p>
                        </div>
                    ) : (
                        <>
                            {/* 1. Thông tin định danh & Biểu tượng */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-blue-600 uppercase flex items-center gap-2">
                                    <Info size={16} /> 1. Thông tin định danh & Biểu tượng
                                </h4>
                                <div className="grid grid-cols-12 gap-6">
                                    <div className="col-span-8 space-y-4">
                                        <div className="space-y-1">
                                            <label
                                                className="block text-[10px] font-bold text-slate-400 uppercase ml-1">Mã
                                                hạng (Cố định)</label>
                                            <input
                                                readOnly
                                                disabled
                                                className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-slate-500 cursor-not-allowed shadow-inner"
                                                value={formData.rankCode || ''}
                                            />
                                        </div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase ml-1">Tên
                                            hạng & Mô tả</label>
                                        <input required name="rankName" type="text"
                                               className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                                               value={formData.rankName} onChange={handleChange}/>
                                        <textarea name="description"
                                                  className="w-full p-3 bg-slate-50 border rounded-xl h-20 outline-none"
                                                  value={formData.description} onChange={handleChange}/>

                                        {/* Chọn Icon */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold text-slate-400 uppercase ml-1">Thay
                                                đổi biểu tượng</label>
                                            <div className="flex gap-3 p-3 bg-slate-50 border rounded-2xl">
                                                {iconOptions.map((item) => {
                                                    const IconComp = item.component;
                                                    const isSelected = formData.icon === item.id;
                                                    return (
                                                        <button key={item.id} type="button"
                                                                onClick={() => selectIcon(item.id)}
                                                                className={`p-3 rounded-xl transition-all ${isSelected ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}>
                                                            <IconComp size={20}/>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Màu sắc & Ưu tiên */}
                                    <div className="col-span-4 space-y-4">
                                        <label className="block text-xs font-bold text-slate-400 uppercase ml-1">Màu sắc
                                            & Ưu tiên</label>
                                        <div className="p-3 bg-slate-50 border rounded-xl space-y-3">
                                            <div className="flex items-center gap-3">
                                            <div className="relative w-12 h-12 shrink-0">
                                                    <input name="color" type="color" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" value={formData.color} onChange={handleChange} />
                                                    <div className="w-full h-full rounded-lg border-2 border-white shadow-sm" style={{ backgroundColor: formData.color }} />
                                                </div>
                                                <input name="colorText" type="text" className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-center uppercase" value={formData.color} onChange={handleChange} />
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <input name="priority" type="number" min="1" className="w-full p-3 bg-slate-50 border rounded-xl outline-none font-bold pr-12" value={formData.priority} onChange={handleChange} />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">Cấp</span>
                                        </div>

                                        <label className="flex items-center gap-3 p-3 cursor-pointer bg-slate-50 rounded-xl border border-slate-100">
                                            <input type="checkbox" className="w-5 h-5 accent-blue-600" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
                                            <span className="text-sm font-bold text-slate-600">Hoạt động</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Điều kiện thăng hạng & duy trì */}
                            <div className="grid grid-cols-2 gap-8">
                                <div className="p-6 bg-emerald-50/40 rounded-3xl border border-emerald-100 space-y-4">
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <h4 className="font-bold text-emerald-800 flex items-center gap-2"><TrendingUp size={18}/> Thăng hạng</h4>
                                        <select name="logic" className="text-xs font-bold p-1 rounded-lg border-emerald-200 outline-none" value={formData.logic} onChange={handleChange}>
                                            <option value="AND">VÀ (AND)</option>
                                            <option value="OR">HOẶC (OR)</option>
                                        </select>
                                    </div>
                                    <input name="minTotalRevenue" type="number" className="w-full p-3 rounded-xl border-emerald-100 outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold" value={formData.minTotalRevenue} onChange={handleChange} />
                                    <input name="minTotalBooking" type="number" className="w-full p-3 rounded-xl border-emerald-100 outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold" value={formData.minTotalBooking} onChange={handleChange} />
                                </div>

                                <div className="p-6 bg-amber-50/40 rounded-3xl border border-amber-100 space-y-4">
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <h4 className="font-bold text-amber-800 flex items-center gap-2"><ShieldCheck size={18}/> Duy trì</h4>
                                        <select name="maintainLogic" className="text-xs font-bold p-1 rounded-lg border-amber-200 outline-none" value={formData.maintainLogic} onChange={handleChange}>
                                            <option value="AND">VÀ (AND)</option>
                                            <option value="OR">HOẶC (OR)</option>
                                        </select>
                                    </div>
                                    <input name="maintainMinRevenue" type="number" className="w-full p-3 rounded-xl border-amber-100 outline-none focus:ring-2 focus:ring-amber-500/20 font-bold" value={formData.maintainMinRevenue} onChange={handleChange} />
                                    <input name="maintainMinBooking" type="number" className="w-full p-3 rounded-xl border-amber-100 outline-none focus:ring-2 focus:ring-amber-500/20 font-bold" value={formData.maintainMinBooking} onChange={handleChange} />
                                </div>
                            </div>

                            {/* 3. Thấu chi */}
                            <div className="p-6 bg-slate-900 rounded-[32px] text-white shadow-xl flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-600 rounded-2xl"><Wallet size={24}/></div>
                                    <h4 className="font-bold">Hạn mức thấu chi (Tín dụng)</h4>
                                </div>
                                <div className="relative">
                                    <input readOnly
                                           disabled name="creditLimit" type="number" className="w-56 p-4 bg-white/10 border border-white/20 rounded-2xl text-xl font-bold outline-none pl-12 focus:bg-white/20" value={formData.creditLimit}  />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 font-bold text-xl">₫</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t flex justify-end gap-3 bg-slate-50">
                    <button type="button" onClick={onClose} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800 transition-colors">Hủy</button>
                    <button type="submit" disabled={loading} className="bg-blue-600 text-white px-10 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">
                        {loading ? <Loader2 className="animate-spin" size={20}/> : <><Save size={20}/> Lưu thay đổi</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditRankingDetailModal;