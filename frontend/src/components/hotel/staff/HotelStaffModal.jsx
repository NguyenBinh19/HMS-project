import React from 'react';
import { X } from 'lucide-react';

const StaffFormModal = ({ isOpen, onClose, initialData }) => {
    if (!isOpen) return null;

    const isEdit = !!initialData;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-end z-[100]">
            <div className="bg-white w-full max-w-lg h-full p-8 shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-800">
                        {isEdit ? "Chỉnh sửa thông tin" : "Thêm nhân viên mới"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X /></button>
                </div>

                <div className="space-y-5">
                    <Input label="Họ và Tên" placeholder="Nhập họ và tên" defaultValue={initialData?.name} />
                    <Input label="Email (Bắt buộc)" placeholder="Nhập email" defaultValue={initialData?.email} />
                    <Input label="Số Điện Thoại" placeholder="Nhập số điện thoại" />

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Vai trò</label>
                        <select className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none bg-slate-50">
                            <option>Nhân viên đặt phòng</option>
                            <option>Quản lý</option>
                        </select>
                    </div>

                    {!isEdit && (
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Mật khẩu</label>
                            <input type="password" placeholder="Nhập mật khẩu" className="w-full px-4 py-3 border border-slate-200 rounded-xl mb-3 focus:ring-2 focus:ring-blue-500/20 outline-none" />
                            <button className="text-[#006AFF] bg-blue-50 px-4 py-2 rounded-lg font-bold text-xs hover:bg-blue-100 transition-all">
                                Tạo Mật Khẩu Tự Động
                            </button>
                        </div>
                    )}

                    <div className="pt-6 border-t border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-4 text-lg">Hạn Mức Chi Tiêu Hàng Ngày</h3>
                        <Input label="Hạn Mức Chi Tiêu Hàng Ngày" defaultValue={initialData ? initialData.limit.toLocaleString() : "20,000,000"} />
                        <p className="text-[10px] text-slate-400 mt-2 italic text-right">Đặt lại lúc 00:00</p>

                        <label className="flex items-center gap-3 mt-4 cursor-pointer">
                            <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                            <span className="text-sm text-slate-600 font-medium">Cho phép vượt quá giới hạn (Yêu cầu phê duyệt của quản lý)</span>
                        </label>
                    </div>
                </div>

                <div className="flex gap-4 mt-12 pb-8">
                    <button onClick={onClose} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all">Hủy</button>
                    <button className="flex-1 py-3 bg-[#006AFF] hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all">Lưu thay đổi</button>
                </div>
            </div>
        </div>
    );
};

const Input = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
        <input className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" {...props} />
    </div>
);

export default StaffFormModal;