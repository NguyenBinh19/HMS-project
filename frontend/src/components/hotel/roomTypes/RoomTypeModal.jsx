import { useState, useEffect } from "react";
import {
    X, Check, Plus, Wand2, Loader2,
    Type, Hash, DollarSign, Users, Home, Bed, Ruler, Baby, Tag, Save
} from "lucide-react";
import { roomTypeService } from "@/services/roomtypes.service.js";

// --- COMPONENT INPUT  ---
const InputField = ({ label, name, value, onChange, error, type = "text", placeholder, icon: Icon, required = false, disabled = false, ...props }) => (
    <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            {Icon && (
                <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${disabled ? "text-slate-300" : "text-slate-400"}`}>
                    <Icon size={18} />
                </div>
            )}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                placeholder={placeholder}
                className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-4 py-2 border rounded-lg text-sm transition-all outline-none
                    ${error
                    ? "border-red-300 ring-1 ring-red-100 bg-red-50/10"
                    : disabled
                        ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed select-none"
                        : "bg-white border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }
                `}
                {...props}
            />
        </div>
        {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
);

const SUGGESTED_AMENITIES = [
    "Wifi tốc độ cao", "Smart TV", "Bồn tắm", "Máy sấy",
    "Loa Bluetooth", "Ban công", "Hướng biển", "Hướng phố"
];

const RoomTypeModal = ({ hotelId = 1, onClose, onSuccess }) => {
    // --- STATE ---
    const [form, setForm] = useState({
        roomCode: "",
        roomTitle: "",
        description: "",
        basePrice: "",
        maxAdults: 1,
        maxChildren: 0,
        totalRooms: "",
        roomArea: "",
        bedType: "",
        keywords: "",
        roomStatus: "active",
        amenities: []
    });

    const [tagInput, setTagInput] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    // --- HANDLERS ---
    // 1. Handle Change: Chặn số âm
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        let newValue = value;

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }

        // Logic chặn số âm
        if (type === "number") {
            if (value === "") {
                newValue = "";
            } else {
                const numValue = parseFloat(value);
                if (numValue < 0) return; // Chặn ngay lập tức
                newValue = numValue;
            }
        }

        setForm(prev => ({ ...prev, [name]: newValue }));
    };

    // 2. Chặn ký tự đặc biệt trong input number
    const handleKeyDown = (e) => {
        if (["-", "+", "e", "E"].includes(e.key)) {
            e.preventDefault();
        }
    };

    // --- LOGIC TAGS ---
    const handleAddTag = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            e.preventDefault();
            const val = tagInput.trim();
            if (val && !form.amenities.includes(val)) {
                setForm(prev => ({ ...prev, amenities: [...prev.amenities, val] }));
                setTagInput("");
            }
        }
    };

    const removeTag = (tagToRemove) => {
        setForm(prev => ({
            ...prev,
            amenities: prev.amenities.filter(tag => tag !== tagToRemove)
        }));
    };

    const toggleSuggestedAmenity = (amenity) => {
        setForm(prev => {
            const exists = prev.amenities.includes(amenity);
            if (exists) {
                return { ...prev, amenities: prev.amenities.filter(a => a !== amenity) };
            } else {
                return { ...prev, amenities: [...prev.amenities, amenity] };
            }
        });
    };
    // ------------------

    const validate = () => {
        const newErrors = {};
        if (!form.roomCode.trim()) newErrors.roomCode = "Vui lòng nhập mã phòng";
        if (!form.roomTitle.trim()) newErrors.roomTitle = "Vui lòng nhập tên hạng phòng";

        if (form.basePrice === "" || Number(form.basePrice) <= 0)
            newErrors.basePrice = "Giá phòng phải lớn hơn 0";

        if (form.totalRooms === "" || Number(form.totalRooms) <= 0)
            newErrors.totalRooms = "Số lượng phòng phải lớn hơn 0";

        if (Number(form.maxAdults) < 1)
            newErrors.maxAdults = "Tối thiểu 1 người lớn";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        try {
            setLoading(true);

            const payload = {
                hotelId: hotelId,
                roomCode: form.roomCode,
                roomTitle: form.roomTitle,
                description: form.description,
                basePrice: Number(form.basePrice),
                maxAdults: Number(form.maxAdults),
                maxChildren: Number(form.maxChildren),
                roomArea: Number(form.roomArea) || 0,
                bedType: form.bedType,
                keywords: form.keywords,
                totalRooms: Number(form.totalRooms),
                amenities: form.amenities,
                roomStatus: form.roomStatus || "active"
            };

            await roomTypeService.createRoomType(payload);
            onSuccess();
            handleClose();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`bg-white w-full max-w-4xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>

                {/* HEADER */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800">Thêm hạng phòng mới</h2>
                    <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">

                    {/* 1. THÔNG TIN CƠ BẢN */}
                    <section>
                        <h3 className="text-sm font-bold text-slate-900 mb-4">Thông tin cơ bản</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                            <InputField
                                label="Tên hạng phòng" name="roomTitle"
                                value={form.roomTitle} onChange={handleChange} error={errors.roomTitle}
                                required icon={Type}
                                placeholder="VD: Deluxe King"
                            />

                            <InputField
                                label="Mã phòng (Code)" name="roomCode"
                                value={form.roomCode} onChange={handleChange} error={errors.roomCode}
                                required icon={Hash}
                                placeholder="VD: DLX01 (Không dấu)"
                                // Ở trang Create thì vẫn cho nhập RoomCode, nhưng có thể thêm logic uppercase nếu muốn
                                style={{ textTransform: "uppercase" }}
                            />

                            <InputField
                                label="Số lượng phòng (Vật lý)" name="totalRooms" type="number"
                                min="1"
                                value={form.totalRooms} onChange={handleChange} onKeyDown={handleKeyDown}
                                error={errors.totalRooms}
                                required icon={Home}
                                placeholder="10"
                            />

                            <InputField
                                label="Giá gốc (VNĐ/Đêm)" name="basePrice" type="number"
                                min="0"
                                value={form.basePrice} onChange={handleChange} onKeyDown={handleKeyDown}
                                error={errors.basePrice}
                                required icon={DollarSign}
                                placeholder="2.500.000"
                            />
                        </div>
                    </section>

                    {/* 2. SỨC CHỨA & KÍCH THƯỚC */}
                    <section>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                            <InputField
                                label="Sức chứa người lớn" name="maxAdults" type="number"
                                min="1"
                                value={form.maxAdults} onChange={handleChange} onKeyDown={handleKeyDown}
                                error={errors.maxAdults}
                                icon={Users}
                            />
                            <InputField
                                label="Sức chứa trẻ em" name="maxChildren" type="number"
                                min="0"
                                value={form.maxChildren} onChange={handleChange} onKeyDown={handleKeyDown}
                                icon={Baby}
                            />
                            <InputField
                                label="Kích thước phòng (m²)" name="roomArea" type="number"
                                min="0"
                                value={form.roomArea} onChange={handleChange} onKeyDown={handleKeyDown}
                                icon={Ruler}
                                placeholder="35"
                            />
                            <InputField
                                label="Loại giường" name="bedType"
                                value={form.bedType} onChange={handleChange}
                                icon={Bed}
                                placeholder="King Bed / Twin Bed"
                            />
                        </div>
                    </section>

                    {/* 3. MÔ TẢ & MARKETING */}
                    <section>
                        <h3 className="text-sm font-bold text-slate-900 mb-4 mt-2">Mô tả phòng (Marketing)</h3>
                        <div className="space-y-4">
                            <InputField
                                label="Từ khóa chính (SEO)" name="keywords"
                                value={form.keywords} onChange={handleChange}
                                icon={Tag}
                                placeholder="view biển, ban công..."
                            />

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Mô tả chi tiết</label>
                                <div className="relative">
                                    <textarea
                                        name="description"
                                        rows={4}
                                        value={form.description}
                                        onChange={handleChange}
                                        placeholder="Nhập mô tả chi tiết về phòng..."
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none outline-none"
                                    />
                                    <button className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded shadow-sm transition-colors">
                                        <Wand2 size={12} />
                                        AI WRITER
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 4. TIỆN ÍCH */}
                    <section>
                        <h3 className="text-sm font-bold text-slate-900 mb-3">Tiện ích</h3>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">

                            <div className="flex flex-wrap gap-2 mb-3">
                                {form.amenities.map((tag, index) => (
                                    <span key={index} className="flex items-center gap-1 px-3 py-1 bg-white border border-blue-200 text-blue-700 rounded-full text-xs font-semibold shadow-sm animate-fade-in">
                                        {tag}
                                        <X
                                            size={12}
                                            className="cursor-pointer hover:text-red-500"
                                            onClick={() => removeTag(tag)}
                                        />
                                    </span>
                                ))}
                                {form.amenities.length === 0 && (
                                    <span className="text-slate-400 text-xs italic py-1">Chưa có tiện ích nào được chọn</span>
                                )}
                            </div>

                            <div className="relative mb-4">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleAddTag}
                                    placeholder="Nhập tiện ích khác và nhấn Enter..."
                                    className="w-full pl-3 pr-10 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                                <button
                                    onClick={(e) => handleAddTag({ ...e, key: 'Enter' })}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-600"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>

                            <div className="border-t border-slate-200 pt-3">
                                <p className="text-xs text-slate-500 font-medium mb-2 uppercase tracking-wide">Gợi ý nhanh:</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {SUGGESTED_AMENITIES.map(item => {
                                        const isSelected = form.amenities.includes(item);
                                        return (
                                            <div
                                                key={item}
                                                onClick={() => toggleSuggestedAmenity(item)}
                                                className={`cursor-pointer text-xs px-3 py-2 rounded border transition-all flex items-center gap-2 select-none
                                                    ${isSelected
                                                    ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium'
                                                    : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'
                                                }`}
                                            >
                                                <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center
                                                    ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`
                                                }>
                                                    {isSelected && <Check size={10} className="text-white" />}
                                                </div>
                                                {item}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* FOOTER */}
                <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-white rounded-b-xl">
                    <button
                        onClick={handleClose}
                        className="px-5 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors text-sm flex items-center gap-1"
                    >
                        <X size={16}/> Hủy bỏ
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16}/> : <Save size={16} />}
                        Thêm
                    </button>
                </div>

            </div>
        </div>
    );
};

export default RoomTypeModal;