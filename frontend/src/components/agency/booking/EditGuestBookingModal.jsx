import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, MessageSquare, Save, Info } from 'lucide-react';

const EditGuestModal = ({ booking, isOpen, onClose, onSaveSuccess }) => {
    // Khởi tạo state nội bộ cho form
    const [formData, setFormData] = useState({
        guestName: '',
        guestPhone: '',
        guestEmail: '',
        notes: ''
    });

    // Quan trọng: Khi modal mở, lấy dữ liệu hiện tại từ 'booking' đang hiển thị trên màn hình
    useEffect(() => {
        if (isOpen && booking) {
            setFormData({
                guestName: booking.guestName || '',
                guestPhone: booking.guestPhone || '',
                guestEmail: booking.guestEmail || '',
                notes: booking.notes || ''
            });
        }
    }, [isOpen, booking]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // UC028.E2: Kiểm tra ký tự Latin (BR-BKM-01)
        const latinRegex = /^[A-Za-z0-9\s]*$/;
        if (!latinRegex.test(formData.guestName)) {
            alert("MSG-ERR-34: Vui lòng sử dụng ký tự Latin không dấu khớp với Hộ chiếu.");
            return;
        }

        try {
            // Giả lập gọi API update
            // await bookingService.updateGuestInfo(booking.bookingCode, formData);

            onSaveSuccess(formData); // Cập nhật lại màn hình cha
            alert("MSG-SYS-23: Cập nhật thông tin khách hàng thành công!");
            onClose();
        } catch (error) {
            alert("Có lỗi xảy ra, vui lòng thử lại.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden">
                <div className="px-6 py-4 border-b flex justify-between items-center">
                    <h2 className="font-bold text-slate-800 text-base">Chỉnh sửa thông tin khách lưu trú</h2>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full"><X size={20}/></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-blue-50 p-3 rounded-lg flex gap-2 border-l-4 border-blue-500">
                        <Info size={18} className="text-blue-600 shrink-0" />
                        <p className="text-[11px] text-blue-800">Lưu ý: Hành động này chỉ thay đổi thông tin định danh, không thay đổi giá hoặc loại phòng.</p>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Họ tên khách chính</label>
                        <input
                            name="guestName"
                            value={formData.guestName}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Số điện thoại</label>
                            <input
                                name="guestPhone"
                                value={formData.guestPhone}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg text-sm outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email</label>
                            <input
                                name="guestEmail"
                                value={formData.guestEmail}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg text-sm outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Yêu cầu đặc biệt</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-3 py-2 border rounded-lg text-sm outline-none resize-none"
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2 text-xs font-bold text-slate-500 bg-slate-100 rounded-md">Hủy</button>
                        <button type="submit" className="flex-1 py-2 text-xs font-bold text-white bg-blue-600 rounded-md flex items-center justify-center gap-2">
                            <Save size={14}/> Lưu thay đổi
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditGuestModal;