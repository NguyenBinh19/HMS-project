import React, { useState } from 'react';
import { X, Send, AlertCircle, CheckCircle2, Loader2, User, Mail, Phone, MessageSquare, Tag } from 'lucide-react';

const SupportModal = ({ isOpen, onClose }) => {
    const initialFormState = {
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [status, setStatus] = useState({ loading: false, error: '', success: false });

    // Reset Form
    const handleReset = () => {
        setFormData(initialFormState);
        setStatus({ loading: false, error: '', success: false });
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (status.error) setStatus(prev => ({ ...prev, error: '' }));
    };

    const validateForm = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{10,11}$/;

        if (!formData.fullName || !formData.email || !formData.subject || !formData.message) {
            return "Vui lòng nhập đầy đủ các trường bắt buộc (*)";
        }
        if (!emailRegex.test(formData.email)) {
            return "Định dạng Email không hợp lệ (MSG-ERR-04)";
        }
        if (formData.phone && !phoneRegex.test(formData.phone)) {
            return "Số điện thoại phải từ 10-11 chữ số";
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errorMsg = validateForm();
        if (errorMsg) {
            setStatus({ ...status, error: errorMsg });
            return;
        }

        setStatus({ ...status, loading: true });

        try {
            /* Mô phỏng tích hợp Email Service:
               - Đọc email nhận từ config
               - Tạo content (Email Subject format: [Support Form] + Subject)
            */
            console.log(`Gửi tới cấu hình Admin Email...`);
            console.log(`Subject: [Support Form] ${formData.subject}`);

            // Giả lập gọi API gửi mail
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    // Lỗi dịch vụ email
                    Math.random() > 0.1 ? resolve() : reject();
                }, 1500);
            });

            // Gửi thành công
            setStatus({ loading: false, error: '', success: true });
        } catch (err) {
            setStatus({ loading: false, error: 'Dịch vụ tạm thời gián đoạn. Vui lòng thử lại sau!', success: false });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={handleClose}></div>

            <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">

                <button onClick={handleClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-100 rounded-full z-10">
                    <X size={20}/>
                </button>

                <div className="p-8 md:p-12">
                    {status.success ? (
                        <div className="text-center py-6">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Gửi hỗ trợ thành công</h2>
                            <p className="text-slate-500 mb-8 text-sm">Nội dung đã được gửi tới bộ phận chăm sóc khách hàng.</p>
                            <button onClick={handleClose} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm">Hoàn tất</button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-8">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Trung tâm hỗ trợ</h2>
                                <p className="text-slate-500 text-sm">Vui lòng để lại thông tin, chúng tôi sẽ phản hồi sớm nhất.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {status.error && (
                                    <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-100 italic">
                                        <AlertCircle size={16}/> {status.error}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                                        <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Họ và tên *" className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl outline-none text-sm border border-transparent focus:border-blue-500 transition-all"/>
                                    </div>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                                        <input name="email" value={formData.email} onChange={handleChange} placeholder="Email liên hệ *" className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl outline-none text-sm border border-transparent focus:border-blue-500 transition-all"/>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                                        <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Số điện thoại" className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl outline-none text-sm border border-transparent focus:border-blue-500 transition-all"/>
                                    </div>
                                    <div className="relative">
                                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                                        <input name="subject" value={formData.subject} onChange={handleChange} placeholder="Tiêu đề yêu cầu *" className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl outline-none text-sm border border-transparent focus:border-blue-500 transition-all"/>
                                    </div>
                                </div>

                                <div className="relative">
                                    <MessageSquare className="absolute left-4 top-4 text-slate-400" size={16}/>
                                    <textarea name="message" value={formData.message} onChange={handleChange} rows="4" placeholder="Nội dung tin nhắn *..." className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl outline-none text-sm border border-transparent focus:border-blue-500 transition-all resize-none"></textarea>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    {/* Nút Reset - Theo luồng UC005.1 */}
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs hover:bg-slate-200 transition-all uppercase tracking-wider"
                                    >
                                        Xóa
                                    </button>
                                    <button
                                        disabled={status.loading}
                                        type="submit"
                                        className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 uppercase tracking-wider"
                                    >
                                        {status.loading ? <Loader2 className="animate-spin" size={16}/> : <><Send size={16} /> Gửi hỗ trợ</>}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupportModal;