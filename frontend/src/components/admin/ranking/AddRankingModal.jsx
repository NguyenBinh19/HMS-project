import React, { useState } from 'react';
import { X, Save, TrendingUp, ShieldCheck, Wallet, Loader2, Info, Star, AlertCircle, Trophy, Crown, Medal, Gem, Award, Zap } from 'lucide-react';
import { rankService } from '@/services/rank.service.js';

const AddRankingModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);

    // Danh sách các Icon khả dụng để chọn
    const iconOptions = [
        { id: 'star', component: Star },
        { id: 'trophy', component: Trophy },
        { id: 'crown', component: Crown },
        { id: 'medal', component: Medal },
        { id: 'gem', component: Gem },
        { id: 'award', component: Award },
        { id: 'zap', component: Zap },
    ];

    const [formData, setFormData] = useState({
        rankName: '',
        description: '',
        icon: 'star',
        color: '#3b82f6',
        priority: 1,
        isActive: true,
        minTotalBooking: 0,
        minTotalRevenue: 0,
        logic: 'AND',
        maintainMinBooking: 0,
        maintainMinRevenue: 0,
        maintainLogic: 'AND',
        creditLimit: 0
    });

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        let finalValue = value;

        if (type === 'number') {
            // 1. Nếu người dùng xóa hết (chuỗi rỗng), cho phép để trống để họ nhập số mới
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

        if (name === 'colorText') {
            let colorVal = value.startsWith('#') ? value : `#${value}`;
            setFormData(prev => ({ ...prev, color: colorVal.toUpperCase() }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    // Hàm riêng để đổi Icon
    const selectIcon = (iconId) => {
        setFormData(prev => ({ ...prev, icon: iconId }));
    };

    const validateForm = () => {
        if (!formData.rankName.trim()) { alert("Tên hạng không được để trống!"); return false; }
        if (formData.priority < 1) { alert("Độ ưu tiên tối thiểu là 1!"); return false; }
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (!hexRegex.test(formData.color)) { alert("Mã màu không hợp lệ (VD: #FFFFFF)!"); return false; }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        try {
            await rankService.createRank(formData);
            alert("Tạo hạng mới thành công!");
            onSuccess();
            onClose();
        } catch (error) {
            alert("Lỗi: " + (error.response?.data?.message || "Không thể tạo hạng"));
        } finally { setLoading(false); }
    };

    if (!isOpen) return null;

    // Lấy component icon hiện tại để hiển thị ở Header
    const SelectedIconTag = iconOptions.find(i => i.id === formData.icon)?.component || Star;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-white w-full max-w-4xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[95vh]">
                <div className="flex items-center justify-between p-6 border-b bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-xl text-white transition-all duration-300">
                            <SelectedIconTag size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Thêm hạng thành viên</h3>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
                </div>

                <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
                    {/* 1. Thông tin định danh & Chọn Icon */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-blue-600 uppercase flex items-center gap-2">
                            <Info size={16} /> 1. Thông tin định danh & Biểu tượng
                        </h4>
                        <div className="grid grid-cols-12 gap-6">
                            <div className="col-span-8 space-y-4">
                                <label className="block text-xs font-bold text-slate-400 uppercase ml-1">Tên hạng & Mô tả</label>
                                <input required name="rankName" type="text" className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold" placeholder="VD: Thành viên Kim Cương..." onChange={handleChange} />
                                <textarea name="description" className="w-full p-3 bg-slate-50 border rounded-xl h-20 outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Mô tả quyền lợi ngắn gọn..." onChange={handleChange} />

                                {/* KHU VỰC CHỌN ICON MỚI */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase ml-1">Chọn biểu tượng đại diện</label>
                                    <div className="flex gap-3 p-3 bg-slate-50 border rounded-2xl">
                                        {iconOptions.map((item) => {
                                            const IconComp = item.component;
                                            const isSelected = formData.icon === item.id;
                                            return (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => selectIcon(item.id)}
                                                    className={`p-3 rounded-xl transition-all ${
                                                        isSelected
                                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110'
                                                            : 'bg-white text-slate-400 hover:text-blue-500 border border-slate-100'
                                                    }`}
                                                >
                                                    <IconComp size={20} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Màu sắc & Ưu tiên */}
                            <div className="col-span-4 space-y-4">
                                <label className="block text-xs font-bold text-slate-400 uppercase ml-1">Màu sắc & Ưu tiên</label>
                                <div className="p-3 bg-slate-50 border rounded-xl space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-12 h-12 shrink-0">
                                            <input
                                                name="color"
                                                type="color"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                value={formData.color}
                                                onChange={handleChange}
                                            />
                                            <div
                                                className="w-full h-full rounded-lg border-2 border-white shadow-sm transition-transform active:scale-90"
                                                style={{ backgroundColor: formData.color }}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                name="colorText"
                                                type="text"
                                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono font-bold outline-none focus:border-blue-500 text-center uppercase"
                                                value={formData.color}
                                                onChange={handleChange}
                                                placeholder="#FFFFFF"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="relative">
                                    <input name="priority" type="number" min="1" className="w-full p-3 bg-slate-50 border rounded-xl outline-none font-bold pr-12" placeholder="Độ ưu tiên" onChange={handleChange} value={formData.priority} />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">Cấp</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Điều kiện thăng hạng & duy trì */}
                    <div className="grid grid-cols-2 gap-8">
                        {/* Thăng hạng */}
                        <div className="p-6 bg-emerald-50/40 rounded-3xl border border-emerald-100 space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h4 className="font-bold text-emerald-800 flex items-center gap-2"><TrendingUp size={18}/> Thăng hạng</h4>
                                <select name="logic" className="text-xs font-bold p-1 rounded-lg border-emerald-200 outline-none" onChange={handleChange}>
                                    <option value="AND">VÀ (AND)</option>
                                    <option value="OR">HOẶC (OR)</option>
                                </select>
                            </div>
                            <input name="minTotalRevenue" type="number" min="0" className="w-full p-3 rounded-xl border-emerald-100 outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="Doanh thu thăng hạng (đ)" onChange={handleChange} />
                            <input name="minTotalBooking" type="number" min="0" className="w-full p-3 rounded-xl border-emerald-100 outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="Số đơn thăng hạng" onChange={handleChange} />
                        </div>

                        {/* Duy trì */}
                        <div className="p-6 bg-amber-50/40 rounded-3xl border border-amber-100 space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h4 className="font-bold text-amber-800 flex items-center gap-2"><ShieldCheck size={18}/> Duy trì</h4>
                                <select name="maintainLogic" className="text-xs font-bold p-1 rounded-lg border-amber-200 outline-none" onChange={handleChange}>
                                    <option value="AND">VÀ (AND)</option>
                                    <option value="OR">HOẶC (OR)</option>
                                </select>
                            </div>
                            <input name="maintainMinRevenue" type="number" min="0" className="w-full p-3 rounded-xl border-amber-100 outline-none focus:ring-2 focus:ring-amber-500/20" placeholder="Doanh thu duy trì (đ)" onChange={handleChange} />
                            <input name="maintainMinBooking" type="number" min="0" className="w-full p-3 rounded-xl border-amber-100 outline-none focus:ring-2 focus:ring-amber-500/20" placeholder="Số đơn duy trì" onChange={handleChange} />
                        </div>
                    </div>

                    {/* Thấu chi */}
                    <div className="p-6 bg-slate-900 rounded-3xl text-white shadow-xl relative overflow-hidden group">
                        <div className="flex justify-between items-center relative z-10">
                            <h4 className="font-bold flex items-center gap-2"><Wallet size={20} /> Hạn mức thấu chi (Tín dụng)</h4>
                        </div>
                        <div className="mt-4 relative z-10">
                            <input name="creditLimit" type="number" min="0" className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-xl font-bold outline-none pl-12 focus:bg-white/20 transition-all" placeholder="0" onChange={handleChange} />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 font-bold text-xl">₫</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t flex justify-end gap-3 bg-slate-50">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 font-bold text-slate-500 hover:text-slate-800 transition-colors">Hủy</button>
                    <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 active:scale-95 transition-all">
                        {loading ? <Loader2 className="animate-spin" size={20}/> : <><Save size={20}/> Lưu hạng mới</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddRankingModal;