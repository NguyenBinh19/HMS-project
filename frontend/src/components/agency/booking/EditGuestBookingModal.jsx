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
        setIsLoading(true);
        try {
            const requestPayload = {
                bookingId: booking.bookingId,
                guestName: formData.guestName,
                guestPhone: formData.guestPhone,
                guestEmail: formData.guestEmail,
                notes: formData.notes
            };

            const response = await bookingService.updateUserInfoBooking(requestPayload);

            // Kiểm tra mã code 1000 (Thành công theo chuẩn API của bạn)
            if (response && response.code === 1000) {
                onSaveSuccess(response.result); // Truyền đúng object booking vào cho Component cha
                alert("Cập nhật thông tin khách hàng thành công!");
                onClose();
            } else {
                alert(response?.message || "Có lỗi xảy ra từ Server");
            }
        } catch (error) {
            // Bây giờ error.response sẽ không còn bị undefined nữa
            const msg = error.response?.data?.message || error.message;
            console.error("Chi tiết lỗi tại Modal:", error.response?.data);
            alert("Lỗi: " + msg);
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