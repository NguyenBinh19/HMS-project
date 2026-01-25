import { useState, useEffect } from "react";
import {
    X, Check, AlertCircle,
    Type, Hash, DollarSign, Users, Home, FileText
} from "lucide-react";
import { roomTypeService } from "@/services/roomtypes.service.js";

const RoomTypeModal = ({ hotelId = 1, onClose, onSuccess }) => {
    const [form, setForm] = useState({
        roomCode: "",
        roomTitle: "",
        description: "",
        basePrice: "",
        maxGuest: "",
        totalRooms: "",
        roomStatus: "ACTIVE",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Hiệu ứng Fade-in khi mở modal
    useEffect(() => {
        setIsVisible(true);
        // Khóa cuộn trang chính khi mở modal
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: "" });
        }
    };

    const blockInvalidNumber = (e) => {
        if (["-", ".", ","].includes(e.key)) e.preventDefault();
    };

    const validate = () => {
        const newErrors = {};
        if (!form.roomCode.trim()) newErrors.roomCode = "Vui lòng nhập mã loại phòng";
        if (!form.roomTitle.trim()) newErrors.roomTitle = "Vui lòng nhập tên loại phòng";
        if (!form.description.trim()) newErrors.description = "Mô tả không được để trống";
        if (!form.basePrice || Number(form.basePrice) <= 0) newErrors.basePrice = "Giá phải lớn hơn 0";
        if (!form.maxGuest || Number(form.maxGuest) <= 0) newErrors.maxGuest = "Số khách phải lớn hơn 0";
        if (!form.totalRooms || Number(form.totalRooms) <= 0) newErrors.totalRooms = "Số phòng phải lớn hơn 0";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Đợi animation đóng xong
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            setLoading(true);
            await roomTypeService.createRoomType({
                ...form,
                hotelId,
                basePrice: Number(form.basePrice),
                maxGuest: Number(form.maxGuest),
                totalRooms: Number(form.totalRooms),
            });

            setSuccess(true);
            onSuccess();

            setTimeout(() => {
                handleClose();
            }, 1500);
        } catch (err) {
            console.error(err);
            // Có thể thêm toast error tại đây
        } finally {
            setLoading(false);
        }
    };

    // Component Input
    const FormInput = ({ label, name, type = "text", icon: Icon, placeholder, ...props }) => (
        <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 block">
                {label} <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Icon size={18} />
                </div>
                <input
                    type={type}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all duration-200
                        ${errors[name]
                        ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                        : "border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                    }`}
                    {...props}
                />
            </div>
            {errors[name] && (
                <p className="text-red-500 text-xs flex items-center gap-1 mt-1 animate-pulse">
                    <AlertCircle size={12} /> {errors[name]}
                </p>
            )}
        </div>
    );

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        >
            <div
                className={`bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] transition-all duration-300 transform ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
            >
                {/* --- HEADER --- */}
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-2xl z-10">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Home className="text-blue-600" size={24} />
                            Thêm Loại Phòng Mới
                        </h2>
                        <p className="text-sm text-slate-500 mt-0.5">Điền thông tin chi tiết để thiết lập loại phòng</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* --- BODY (Scrollable) --- */}
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">

                    {/* Thông báo thành công */}
                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm animate-bounce-in">
                            <div className="bg-green-500 text-white p-1 rounded-full">
                                <Check size={16} strokeWidth={3} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">Thành công!</h4>
                                <p className="text-xs opacity-90">Loại phòng đã được tạo và lưu vào hệ thống.</p>
                            </div>
                        </div>
                    )}

                    {/* Thông tin cơ bản */}
                    <section>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Thông tin chung</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FormInput
                                label="Mã loại phòng"
                                name="roomCode"
                                icon={Hash}
                                placeholder="VD: DLX01"
                            />
                            <FormInput
                                label="Tên hiển thị"
                                name="roomTitle"
                                icon={Type}
                                placeholder="VD: Deluxe King Ocean View"
                            />
                        </div>
                    </section>

                    {/* Định giá & Sức chứa */}
                    <section>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Vận hành</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <FormInput
                                label="Giá cơ bản (VNĐ)"
                                name="basePrice"
                                type="number"
                                icon={DollarSign}
                                placeholder="0"
                                min={1}
                                onKeyDown={blockInvalidNumber}
                            />
                            <FormInput
                                label="Sức chứa (Khách)"
                                name="maxGuest"
                                type="number"
                                icon={Users}
                                placeholder="2"
                                min={1}
                                onKeyDown={blockInvalidNumber}
                            />
                            <FormInput
                                label="Tổng số phòng"
                                name="totalRooms"
                                type="number"
                                icon={Home}
                                placeholder="10"
                                min={1}
                                onKeyDown={blockInvalidNumber}
                            />
                        </div>
                    </section>

                    {/* Chi tiết & Trạng thái */}
                    <section className="grid grid-cols-1 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <FileText size={16} className="text-slate-400"/> Mô tả chi tiết <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                rows={4}
                                onChange={handleChange}
                                placeholder="Mô tả tiện nghi, hướng nhìn, diện tích..."
                                className={`w-full px-4 py-3 rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 resize-none
                                ${errors.description
                                    ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                                    : "border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                                }`}
                            />
                            {errors.description && (
                                <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                                    <AlertCircle size={12} /> {errors.description}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div>
                                <label className="text-sm font-bold text-slate-700 block">Trạng thái </label>
                            </div>
                            <div className="relative inline-block w-32">
                                <select
                                    name="roomStatus"
                                    onChange={handleChange}
                                    value={form.roomStatus}
                                    className="block w-full px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:border-blue-400 transition-colors"
                                >
                                    <option value="ACTIVE">Hoạt động</option>
                                    <option value="INACTIVE">Tạm ẩn</option>
                                </select>
                            </div>
                        </div>
                    </section>
                </div>

                {/* --- FOOTER --- */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3 z-10">
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="px-5 py-2.5 rounded-lg text-slate-600 font-medium hover:bg-white hover:shadow-sm hover:text-slate-800 border border-transparent hover:border-slate-200 transition-all duration-200 active:scale-95"
                    >
                        Huỷ bỏ
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || success}
                        className={`px-6 py-2.5 rounded-lg text-white font-semibold shadow-md shadow-blue-500/20 transition-all duration-200 active:scale-95 flex items-center gap-2
                        ${loading || success ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30'}`}
                    >
                        {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {success ? "Đã Lưu!" : "Lưu Loại Phòng"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoomTypeModal;