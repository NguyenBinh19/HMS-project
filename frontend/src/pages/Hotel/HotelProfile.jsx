import React, { useState } from 'react';
import {
    Save, Eye, Hotel, MapPin, Star, Mail, Phone,
    Map as MapIcon, Waves, Dumbbell, Wifi, Car,
    Utensils, Coffee, Tv, ShieldCheck, Upload,
    X, Grid, Image as ImageIcon, Clock, AlertTriangle
} from 'lucide-react';

const HotelProfileManager = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);

    // Mock dữ liệu khách sạn (Locked fields theo UC-056)
    const hotelLockedInfo = {
        name: "Mường Thanh Luxury Hotel",
        address: "270 Võ Nguyên Giáp, Đà Nẵng",
        stars: 5
    };

    const tabs = [
        { id: 'general', label: 'Thông tin chung' },
        { id: 'amenities', label: 'Tiện nghi' },
        { id: 'photos', label: 'Hình ảnh' },
        { id: 'policies', label: 'Chính sách' },
    ];

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            alert("Profile updated successfully (MSG-SYS-26)");
        }, 1000);
    };

    return (
        <div className="bg-[#F1F5F9] min-h-screen p-4 md:p-8 font-sans text-slate-900">
            <div className="max-w-5xl mx-auto">

                {/* HEADER SECTION (Locked Info) */}
                <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0">
                            <Hotel size={32} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-black text-slate-800">{hotelLockedInfo.name}</h1>
                                <div className="flex text-amber-400">
                                    {[...Array(hotelLockedInfo.stars)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                                </div>
                            </div>
                            <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                                <MapPin size={14} /> {hotelLockedInfo.address}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button className="flex-1 md:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all">
                            <Eye size={18} /> Xem trước
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 md:flex-none px-6 py-2.5 bg-[#006AFF] hover:bg-blue-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all"
                        >
                            <Save size={18} /> {loading ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                    </div>
                </div>

                {/* TAB NAVIGATION */}
                <div className="flex gap-1 mb-6 bg-white p-1.5 rounded-2xl shadow-sm w-fit border border-slate-200 overflow-x-auto max-w-full">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                                activeTab === tab.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* TAB CONTENT RENDERER */}
                <div className="transition-all duration-300">
                    {activeTab === 'general' && <TabGeneral />}
                    {activeTab === 'amenities' && <TabAmenities />}
                    {activeTab === 'photos' && <TabPhotos />}
                    {activeTab === 'policies' && <TabPolicies />}
                </div>

                {/* FOOTER (Alternative Flow UC056.1) */}
                <p className="mt-8 text-center text-xs text-slate-400 font-medium italic">
                    Muốn thay đổi tên hoặc hạng sao? <button className="text-blue-600 font-bold hover:underline">Gửi yêu cầu thay đổi (UC-068)</button>
                </p>
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS ---

const TabGeneral = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Mô tả khách sạn</h3>
            <textarea
                className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all text-sm leading-relaxed"
                placeholder="Nhập đoạn giới thiệu thu hút các đại lý..."
                defaultValue="Mường Thanh Luxury Đà Nẵng tọa lạc tại vị trí đắc địa nhất bên bờ biển Mỹ Khê, mang đến không gian nghỉ dưỡng sang trọng bậc nhất..."
            />
            <p className="text-[10px] text-slate-400 mt-2 italic">* Mô tả không được để trống (UC056.E2)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Thông tin liên hệ</h3>
                <div className="space-y-4">
                    <InputItem label="Email nhận Booking" icon={<Mail size={16}/>} value="reservation@muongthanh.com" />
                    <InputItem label="Hotline khách sạn" icon={<Phone size={16}/>} value="0236 3123 456" />
                </div>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Vị trí bản đồ (UC056.2)</h3>
                <div className="aspect-video bg-blue-50 rounded-2xl flex items-center justify-center border border-dashed border-blue-200 relative overflow-hidden group cursor-move">
                    <MapIcon className="text-blue-200" size={48} />
                    <div className="w-8 h-8 bg-rose-500 rounded-full border-4 border-white shadow-xl relative z-10 animate-bounce" />
                    <p className="absolute bottom-4 text-[10px] text-blue-400 font-bold uppercase tracking-tighter">Kéo thả pin để định vị chính xác</p>
                </div>
            </div>
        </div>
    </div>
);

const TabAmenities = () => {
    const amenitiesList = [
        { id: 1, name: "Hồ bơi vô cực", icon: <Waves />, checked: true },
        { id: 2, name: "Phòng Gym 24/7", icon: <Dumbbell />, checked: true },
        { id: 3, name: "Wifi miễn phí", icon: <Wifi />, checked: true },
        { id: 4, name: "Bãi đỗ xe", icon: <Car />, checked: true },
        { id: 5, name: "Nhà hàng Buffet", icon: <Utensils /> },
        { id: 6, name: "Quầy Bar", icon: <Coffee /> },
        { id: 7, name: "Truyền hình cáp", icon: <Tv />, checked: true },
        { id: 8, name: "An ninh 24/7", icon: <ShieldCheck />, checked: true },
    ];
    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-black text-slate-800 mb-2">Tiện nghi khách sạn</h3>
            <p className="text-sm text-slate-400 mb-8">Tick chọn các dịch vụ có sẵn để đại lý dễ dàng tìm kiếm (BR-HOT-09)</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {amenitiesList.map(item => (
                    <label key={item.id} className="relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-slate-100 cursor-pointer transition-all hover:border-blue-200 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50/50 group">
                        <input type="checkbox" defaultChecked={item.checked} className="absolute top-3 right-3 w-5 h-5 rounded-md text-blue-600 border-slate-200" />
                        <div className="text-slate-400 group-hover:text-blue-600 transition-colors mb-3">
                            {React.cloneElement(item.icon, { size: 32 })}
                        </div>
                        <span className="text-xs font-bold text-slate-600">{item.name}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

const TabPhotos = () => {
    const images = [
        { id: 1, url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400", isCover: true },
        { id: 2, url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400", isCover: false },
        { id: 3, url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=400", isCover: false },
    ];
    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h3 className="text-xl font-black text-slate-800">Hình ảnh & Cover</h3>
                    <p className="text-xs text-slate-400 mt-1 italic">Tải lên ít nhất 5 ảnh chất lượng cao (Max 10MB/file).</p>
                </div>
                <button className="bg-blue-50 text-[#006AFF] px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-blue-100 transition-all">
                    <Upload size={16} /> TẢI ẢNH MỚI
                </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {images.map((img) => (
                    <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden group border border-slate-100 shadow-sm">
                        <img src={img.url} alt="Hotel" className="w-full h-full object-cover" />
                        {img.isCover && (
                            <div className="absolute top-3 left-3 bg-blue-600 text-white text-[9px] font-black px-2 py-1 rounded-md flex items-center gap-1">
                                <Grid size={10} /> ẢNH BÌA
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button className="p-2 bg-white text-slate-800 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><ImageIcon size={16} /></button>
                            <button className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-all"><X size={16} /></button>
                        </div>
                    </div>
                ))}
                <div className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer">
                    <Upload className="text-slate-300" size={32} />
                    <span className="text-[10px] font-black text-slate-400 mt-2 uppercase">Thêm ảnh</span>
                </div>
            </div>
        </div>
    );
};

const TabPolicies = () => (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 max-w-2xl animate-in fade-in slide-in-from-bottom-4">
        <h3 className="text-lg font-black text-slate-800 mb-6">Chính sách thời gian</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TimeSelect label="Giờ nhận phòng" color="text-emerald-600" defaultValue="14:00" />
            <TimeSelect label="Giờ trả phòng" color="text-rose-600" defaultValue="12:00" />
        </div>
        <div className="mt-10 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
            <AlertTriangle className="text-amber-600 shrink-0" size={24} />
            <p className="text-xs text-amber-700 leading-relaxed font-medium">
                Lưu ý: Thay đổi chính sách sẽ ảnh hưởng đến tất cả các đặt phòng mới kể từ thời điểm này.
            </p>
        </div>
    </div>
);

// --- REUSABLE MINI COMPONENTS ---

const InputItem = ({ label, icon, value }) => (
    <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</label>
        <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
            <input type="text" defaultValue={value} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all" />
        </div>
    </div>
);

const TimeSelect = ({ label, color, defaultValue }) => (
    <div className="space-y-3">
        <label className={`flex items-center gap-2 text-xs font-bold ${color} uppercase tracking-widest`}>
            <Clock size={16} /> {label}
        </label>
        <select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-700 outline-none">
            <option selected>{defaultValue}</option>
            <option>11:00</option><option>13:00</option><option>15:00</option>
        </select>
    </div>
);

export default HotelProfileManager;