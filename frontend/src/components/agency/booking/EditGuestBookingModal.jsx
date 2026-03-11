import React, { useState, useEffect } from 'react';
import { X, Save, Info } from 'lucide-react';
// Giả định bạn đã export hàm này từ file service của mình
import { bookingService } from '@/services/booking.service.js';

const EditGuestModal = ({ booking, isOpen, onClose, onSaveSuccess }) => {
    const [formData, setFormData] = useState({
        guestName: '',
        guestPhone: '',
        guestEmail: '',
        notes: ''
    });
    const [isLoading, setIsLoading] = useState(false);

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

        // 1. Validation Latin (BR-BKM-01)
        const latinRegex = /^[A-Za-z0-9\s]*$/;
        if (!latinRegex.test(formData.guestName)) {
            alert("MSG-ERR-34: Vui lòng sử dụng ký tự Latin không dấu khớp với Hộ chiếu.");
            return;
        }

        try {
            setIsLoading(true);

            // 2. Chuẩn bị payload khớp chính xác với UpdateGuestRequest (Java)
            const requestPayload = {
                bookingId: booking.id, // Lấy ID từ object booking được truyền vào
                guestName: formData.guestName,
                guestPhone: formData.guestPhone,
                guestEmail: formData.guestEmail,
                notes: formData.notes
            };

            // 3. Gọi hàm update (UC-028)
            const result = await bookingService.updateUserInfoBooking(requestPayload);

            // 4. Xử lý thành công
            // Truyền result (toàn bộ thông tin booking mới) về màn hình cha để cập nhật UI
            onSaveSuccess(result);

            alert("MSG-SYS-23: Cập nhật thông tin khách hàng thành công!");
            onClose();
        } catch (error) {
            // Hiển thị thông báo lỗi từ server hoặc lỗi mặc định
            alert(error.message || "Có lỗi xảy ra trong quá trình cập nhật.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border border-slate-200">
                <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50/50">
                    <h2 className="font-bold text-slate-800 text-base uppercase tracking-tight">Chỉnh sửa khách lưu trú</h2>
                    <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                        <X size={20}/>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-blue-50 p-3 rounded-lg flex gap-3 border-l-4 border-blue-500 shadow-sm">
                        <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-blue-800 font-medium leading-relaxed">
                            Lưu ý: Hành động này chỉ thay đổi thông tin định danh (UC-028), không ảnh hưởng đến giá phòng hoặc chính sách hủy.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Họ tên khách chính</label>
                            <input
                                name="guestName"
                                value={formData.guestName}
                                onChange={handleChange}
                                placeholder="NGUYEN VAN A"
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Số điện thoại</label>
                                <input
                                    name="guestPhone"
                                    value={formData.guestPhone}
                                    onChange={handleChange}
                                    placeholder="09xxx"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Email</label>
                                <input
                                    name="guestEmail"
                                    type="email"
                                    value={formData.guestEmail}
                                    onChange={handleChange}
                                    placeholder="example@gmail.com"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Yêu cầu đặc biệt (Notes)</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Ghi chú về dị ứng, giờ đến, hoặc yêu cầu thêm..."
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none resize-none focus:border-blue-400 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 py-3 text-xs font-black text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl uppercase tracking-wider transition-all"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`flex-1 py-3 text-xs font-black text-white rounded-xl flex items-center justify-center gap-2 uppercase tracking-wider transition-all shadow-lg shadow-blue-100 ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {isLoading ? (
                                <span className="animate-pulse">Đang xử lý...</span>
                            ) : (
                                <><Save size={16}/> Lưu thay đổi</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditGuestModal;