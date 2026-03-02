import { useState, useEffect } from "react";
import { X, Loader2, Save, Sparkles } from "lucide-react";
import { roomTypeService } from "@/services/roomtypes.service.js";

// --- 1. AMENITY GROUPS  ---
const AMENITY_GROUPS = {
    "Phòng tắm": ["Bồn tắm", "Máy sấy", "Áo choàng", "Dép đi trong phòng", "Vòi sen đứng"],
    "Công nghệ": ["Smart TV", "Wifi tốc độ cao", "Loa Bluetooth", "Điện thoại nội bộ", "Két sắt điện tử"],
    "View": ["Hướng biển", "Hướng thành phố", "Hướng vườn", "Ban công", "Cửa sổ lớn"]
};

// --- 2. COMPONENT INPUT  ---
const InputField = ({ label, name, value, onChange, type = "text", placeholder, className = "", disabled = false, ...props }) => (
    <div className={`space-y-1.5 ${className}`}>
        <label className="text-sm font-semibold text-slate-700 block">
            {label}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            className={`w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 
                focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all 
                placeholder:text-slate-400 bg-white 
                ${disabled ? "bg-slate-100 text-slate-500 cursor-not-allowed select-none" : "bg-white"}
            `}
            {...props}
        />
    </div>
);

const RoomTypeDetailModal = ({ roomId, onClose, onSuccess }) => {
    // --- STATE ---
    const [form, setForm] = useState({
        roomTitle: "",
        totalRooms: 0,
        maxAdults: 1,
        maxChildren: 0,
        roomArea: 0,
        bedType: "",
        keywords: "",
        description: "",
        amenities: [],
        basePrice: 0,
    });

    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // --- FETCH DATA ---
    useEffect(() => {
        setIsVisible(true);
        document.body.style.overflow = 'hidden';

        if (roomId) {
            const fetchDetail = async () => {
                try {
                    setIsLoadingData(true);
                    const res = await roomTypeService.getRoomTypeDetail(roomId);
                    const data = res.result || res;

                    setForm({
                        roomTitle: data.roomTitle || "",
                        totalRooms: data.totalRooms || 0,
                        maxAdults: data.maxAdults || 1,
                        maxChildren: data.maxChildren || 0,
                        roomArea: data.roomArea || 0,
                        bedType: data.bedType || "",
                        keywords: data.keywords || "",
                        basePrice: data.basePrice || 0,
                        description: data.description || "",
                        amenities: data.amenities || [],
                    });
                } catch (err) {
                    console.error("Load detail error:", err);
                } finally {
                    setIsLoadingData(false);
                }
            };
            fetchDetail();
        }

        return () => { document.body.style.overflow = 'unset'; };
    }, [roomId]);

    // --- HANDLERS ---

    // 1. Handle Change: chặn số âm
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        let newValue = value;

        if (type === "number") {
            if (value === "") {
                newValue = "";
            } else {
                // Chặn số âm
                const numValue = parseFloat(value);
                if (numValue < 0) return; // Không cho nhập số âm
                newValue = numValue;
            }
        }

        setForm(prev => ({ ...prev, [name]: newValue }));
    };

    // 2. Chặn các ký tự đặc biệt trong ô input number ('-', '+', 'e')
    const handleKeyDown = (e) => {
        if (e.key === "-" || e.key === "+" || e.key === "e" || e.key === "E") {
            e.preventDefault();
        }
    };

    const handleAmenityChange = (amenity) => {
        setForm(prev => {
            const currentAmenities = prev.amenities || [];
            if (currentAmenities.includes(amenity)) {
                return { ...prev, amenities: currentAmenities.filter(item => item !== amenity) };
            } else {
                return { ...prev, amenities: [...currentAmenities, amenity] };
            }
        });
    };

    // --- LOGIC UPDATE (VALIDATION TRƯỚC KHI GỬI) ---
    const handleUpdate = async () => {
        // 1. Validate dữ liệu
        if (!form.roomTitle.trim()) {
            alert("Vui lòng nhập tên hạng phòng!");
            return;
        }
        if (Number(form.basePrice) <= 0) {
            alert("Giá phòng phải lớn hơn 0!");
            return;
        }
        if (Number(form.maxAdults) < 1) {
            alert("Sức chứa người lớn tối thiểu là 1!");
            return;
        }

        try {
            setIsSaving(true);

            const payload = {
                roomTitle: form.roomTitle,
                description: form.description,
                basePrice: Number(form.basePrice),
                maxAdults: Number(form.maxAdults),
                maxChildren: Number(form.maxChildren),
                totalRooms: Number(form.totalRooms),
                roomArea: Number(form.roomArea),
                bedType: form.bedType,
                keywords: form.keywords,
                amenities: form.amenities
            };

            await roomTypeService.updateRoomType(roomId, payload);

            onSuccess();
            handleClose();
        } catch (err) {
            console.error("Update failed", err);
            // Có thể hiển thị thông báo lỗi từ backend trả về nếu có
            alert("Cập nhật thất bại. Vui lòng kiểm tra lại thông tin!");
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 200);
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`bg-white w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>

                {/* --- HEADER --- */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800">Chỉnh sửa phòng</h2>
                    <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* --- BODY --- */}
                <div className="p-6 overflow-y-auto custom-scrollbar relative">
                    {isLoadingData ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                            <Loader2 className="animate-spin mb-3 text-blue-600" size={32} />
                            <span>Đang tải dữ liệu...</span>
                        </div>
                    ) : (
                        <div className="space-y-6">

                            {/* SECTION 1: THÔNG TIN CƠ BẢN */}
                            <section>
                                <h3 className="text-sm font-bold text-slate-900 mb-4">Thông tin cơ bản</h3>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                    <InputField
                                        label="Tên hạng phòng"
                                        name="roomTitle"
                                        value={form.roomTitle}
                                        onChange={handleChange}
                                        placeholder="VD: Deluxe Ocean View"
                                        // Nếu bạn muốn cấm sửa tên phòng (coi như code) thì bỏ comment dòng dưới:
                                        // disabled={true}
                                    />

                                    <InputField
                                        label="Tổng số phòng (Allotment)"
                                        name="totalRooms"
                                        type="number"
                                        min="0"
                                        value={form.totalRooms}
                                        onChange={handleChange}
                                        onKeyDown={handleKeyDown}
                                        placeholder="0"
                                    />

                                    <InputField
                                        label="Người lớn (Max)"
                                        name="maxAdults"
                                        type="number"
                                        min="1"
                                        value={form.maxAdults}
                                        onChange={handleChange}
                                        onKeyDown={handleKeyDown}
                                        placeholder="2"
                                    />

                                    <InputField
                                        label="Trẻ em (Max)"
                                        name="maxChildren"
                                        type="number"
                                        min="0"
                                        value={form.maxChildren}
                                        onChange={handleChange}
                                        onKeyDown={handleKeyDown}
                                        placeholder="1"
                                    />

                                    <InputField
                                        label="Diện tích (m²)"
                                        name="roomArea"
                                        type="number"
                                        min="0"
                                        value={form.roomArea}
                                        onChange={handleChange}
                                        onKeyDown={handleKeyDown}
                                        placeholder="30"
                                    />

                                    <InputField
                                        label="Loại giường"
                                        name="bedType"
                                        value={form.bedType}
                                        onChange={handleChange}
                                        placeholder="VD: King Bed"
                                        className="bg-slate-50"
                                    />

                                    <InputField
                                        label="Giá gốc (VNĐ/Đêm)"
                                        name="basePrice"
                                        type="number"
                                        min="0"
                                        value={form.basePrice}
                                        onChange={handleChange}
                                        onKeyDown={handleKeyDown}
                                        className="bg-slate-50 font-medium text-blue-600"
                                    />
                                </div>
                            </section>

                            {/* SECTION 2: MARKETING */}
                            <section>
                                <h3 className="text-sm font-bold text-slate-900 mb-4">Mô tả phòng (Marketing)</h3>
                                <div className="space-y-4">
                                    <InputField
                                        label="Từ khóa chính"
                                        name="keywords"
                                        value={form.keywords}
                                        onChange={handleChange}
                                        placeholder="VD: view biển, bồn tắm nằm..."
                                    />

                                    <div className="flex justify-center py-1">
                                        <button className="flex items-center gap-2 bg-[#6366f1] hover:bg-[#5558e6] text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md shadow-indigo-200 transition-all active:scale-95">
                                            <Sparkles size={16} />
                                            VIẾT MÔ TẢ BẰNG AI
                                        </button>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-slate-700">Mô tả tự động</label>
                                        <textarea
                                            name="description"
                                            rows={4}
                                            value={form.description}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-700 focus:border-blue-500 outline-none resize-none leading-relaxed"
                                            placeholder="Nội dung sẽ được tạo tự động..."
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* SECTION 3: TIỆN ÍCH */}
                            <section>
                                <h3 className="text-sm font-bold text-slate-900 mb-4">Tiện ích</h3>
                                <div className="grid grid-cols-3 gap-6">
                                    {Object.entries(AMENITY_GROUPS).map(([groupName, items]) => (
                                        <div key={groupName} className="bg-slate-50/50 p-4 rounded-lg">
                                            <h4 className="text-sm font-bold text-slate-700 mb-3">{groupName}</h4>
                                            <div className="space-y-2.5">
                                                {items.map((item) => (
                                                    <label key={item} className="flex items-center gap-2.5 cursor-pointer group">
                                                        <div className="relative flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={form.amenities.includes(item)}
                                                                onChange={() => handleAmenityChange(item)}
                                                                className="peer w-4 h-4 border-2 border-slate-300 rounded checked:bg-blue-600 checked:border-blue-600 transition-colors appearance-none cursor-pointer"
                                                            />
                                                            <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="20 6 9 17 4 12"></polyline>
                                                            </svg>
                                                        </div>
                                                        <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{item}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}
                </div>

                {/* --- FOOTER --- */}
                <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-white rounded-b-xl">
                    <button
                        onClick={handleClose}
                        className="px-5 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors text-sm flex items-center gap-1"
                    >
                        <X size={16} /> Hủy bỏ
                    </button>
                    <button
                        onClick={handleUpdate}
                        disabled={isSaving || isLoadingData}
                        className="px-6 py-2 rounded-lg bg-[#0066FF] hover:bg-blue-700 text-white font-semibold transition-colors text-sm flex items-center gap-2 shadow-sm"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        Lưu & Cập nhật
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoomTypeDetailModal;