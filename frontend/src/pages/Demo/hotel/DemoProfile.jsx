import { useState } from "react";
import { Save, MapPin, Phone, Mail, Star, ImagePlus, X } from "lucide-react";
import { DEMO_HOTEL } from "../mockData";

const DemoProfile = () => {
    const [formData, setFormData] = useState({ ...DEMO_HOTEL });
    const [saved, setSaved] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setSaved(false);
    };

    const handleSave = (e) => {
        e.preventDefault();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Hồ sơ khách sạn
                </h1>
                <p className="text-sm text-slate-400 font-medium">
                    Quản lý thông tin cơ bản của khách sạn
                </p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 space-y-6">
                    {/* Star rating */}
                    <div className="flex items-center gap-2 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={20}
                                className={
                                    star <= formData.starRating
                                        ? "text-amber-400 fill-amber-400"
                                        : "text-slate-200"
                                }
                            />
                        ))}
                        <span className="text-xs font-bold text-slate-400 ml-2">
                            {formData.starRating} sao
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">
                                Tên khách sạn
                            </label>
                            <input
                                name="hotelName"
                                value={formData.hotelName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-blue-600 focus:bg-white outline-none font-bold text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">
                                Email
                            </label>
                            <div className="relative">
                                <Mail
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    size={16}
                                />
                                <input
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-blue-600 focus:bg-white outline-none font-bold text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">
                            Dia chi
                        </label>
                        <div className="relative">
                            <MapPin
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                size={16}
                            />
                            <input
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-blue-600 focus:bg-white outline-none font-bold text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">
                                Thành phố
                            </label>
                            <input
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-blue-600 focus:bg-white outline-none font-bold text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">
                                Quốc gia
                            </label>
                            <input
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-blue-600 focus:bg-white outline-none font-bold text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">
                                Điện thoại
                            </label>
                            <div className="relative">
                                <Phone
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    size={16}
                                />
                                <input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-blue-600 focus:bg-white outline-none font-bold text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">
                            Mô tả
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-blue-600 focus:bg-white outline-none font-bold text-sm resize-none"
                        />
                    </div>

                    {/* Amenities */}
                    <div>
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 block">
                            Tiện ích
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {formData.amenities.map((a, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold"
                                >
                                    {a}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Image placeholder */}
                    <div>
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 block">
                            Hình ảnh
                        </label>
                        <div className="grid grid-cols-4 gap-4">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center text-slate-300"
                                >
                                    <ImagePlus size={24} />
                                </div>
                            ))}
                            <div className="aspect-video border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-300 hover:border-blue-400 hover:text-blue-400 cursor-pointer transition-colors">
                                <ImagePlus size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 active:scale-95"
                    >
                        <Save size={16} /> Lưu thay đổi
                    </button>
                    {saved && (
                        <span className="text-sm font-bold text-green-600 animate-in fade-in">
                            Đã lưu thành công! (Demo)
                        </span>
                    )}
                </div>
            </form>
        </div>
    );
};

export default DemoProfile;
