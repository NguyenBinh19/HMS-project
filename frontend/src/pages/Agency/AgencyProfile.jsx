import React, { useState } from 'react';
import {
    ShieldCheck,
    Building2,
    Upload,
    Info,
    Phone,
    Mail,
    MapPin,
    Globe,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

const AgencyProfile = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Mock data theo UC-043
    const [profile, setProfile] = useState({
        // Legal Info (Locked)
        taxId: "0102030405",
        legalName: "CÔNG TY TNHH DU LỊCH VÀ LỮ HÀNH TOÀN CẦU",
        directorName: "Nguyễn Văn A",

        // Operational Info (Editable)
        brandName: "Global Travel Agency",
        logo: "https://via.placeholder.com/150",
        hotline: "1900 1234",
        generalEmail: "contact@globaltravel.com",
        address: "123 Đường ABC, Quận 1, TP. Hồ Chí Minh"
    });

    const handleSave = () => {
        setLoading(true);
        // Giả lập gọi API
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        }, 1000);
    };

    return (
        <div className="bg-[#F8FAFC] min-h-screen p-6 md:p-10 font-sans">
            <div className="max-w-4xl mx-auto">

                {/* Header Section */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900">Hồ sơ đại lý</h1>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-[#006AFF] hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2"
                    >
                        {loading ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                </div>

                {success && (
                    <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <CheckCircle2 size={20} />
                        <span className="text-sm font-bold">Cập nhật hồ sơ thành công! (MSG-SYS-37)</span>
                    </div>
                )}

                <div className="space-y-8">

                    {/* SECTION 1: LEGAL INFO (LOCKED) */}
                    <section className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4">
              <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                <AlertCircle size={12} /> Chỉ đọc
              </span>
                        </div>

                        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Building2 className="text-slate-400" size={20} /> Thông tin pháp lý
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ReadOnlyInput
                                label="Mã số thuế"
                                value={profile.taxId}
                            />
                            <ReadOnlyInput
                                label="Tên pháp nhân (Legal Name)"
                                value={profile.legalName}
                                showTooltip
                            />
                            <ReadOnlyInput
                                label="Người đại diện"
                                value={profile.directorName}
                            />
                        </div>
                    </section>

                    {/* SECTION 2: OPERATIONAL INFO (EDITABLE) */}
                    <section className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Globe className="text-[#006AFF]" size={20} /> Thông tin vận hành & Thương hiệu
                        </h2>

                        <div className="space-y-8">
                            {/* Logo Upload */}
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                                <div className="relative group">
                                    <img
                                        src={profile.logo}
                                        alt="Agency Logo"
                                        className="w-24 h-24 rounded-2xl object-cover border-2 border-white shadow-md"
                                    />
                                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 cursor-pointer transition-all">
                                        <Upload className="text-white" size={20} />
                                        <input type="file" className="hidden" />
                                    </label>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm mb-1">Logo thương hiệu</h4>
                                    <p className="text-xs text-slate-400 mb-3 max-w-xs">
                                        Logo này sẽ hiển thị trên Voucher PDF gửi cho khách hàng. Định dạng: PNG, JPG (Max 5MB).
                                    </p>
                                    <button className="text-[#006AFF] text-xs font-bold hover:underline flex items-center gap-1">
                                        <Upload size={14} /> Tải logo mới
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <EditableInput
                                    label="Tên thương hiệu (Brand Name)"
                                    value={profile.brandName}
                                    onChange={(v) => setProfile({...profile, brandName: v})}
                                    placeholder="Ví dụ: Global Travel"
                                />
                                <EditableInput
                                    label="Hotline hỗ trợ"
                                    value={profile.hotline}
                                    onChange={(v) => setProfile({...profile, hotline: v})}
                                    icon={<Phone size={16}/>}
                                />
                                <EditableInput
                                    label="Email chung"
                                    value={profile.generalEmail}
                                    onChange={(v) => setProfile({...profile, generalEmail: v})}
                                    icon={<Mail size={16}/>}
                                />
                                <EditableInput
                                    label="Địa chỉ văn phòng"
                                    value={profile.address}
                                    onChange={(v) => setProfile({...profile, address: v})}
                                    icon={<MapPin size={16}/>}
                                    fullWidth
                                />
                            </div>
                        </div>
                    </section>

                    {/* Audit Note */}
                    <p className="text-center text-[11px] text-slate-400 font-medium italic">
                        Lưu ý: Mọi thay đổi về thông tin liên hệ sẽ được hệ thống lưu lại nhật ký thay đổi (Audit Log).
                    </p>
                </div>
            </div>
        </div>
    );
};

// Component con cho các trường chỉ đọc (Locked)
const ReadOnlyInput = ({ label, value, showTooltip }) => (
    <div className="group relative">
        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">{label}</label>
        <div className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-500 font-semibold text-sm cursor-not-allowed flex justify-between items-center">
            {value}
            <Info size={14} className="text-slate-300" />
        </div>
        {showTooltip && (
            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-64 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl z-10 animate-in fade-in slide-in-from-bottom-1">
                Liên hệ Admin hoặc nhấn "Yêu cầu xác minh lại" để thay đổi thông tin pháp nhân.
            </div>
        )}
    </div>
);

// Component con cho các trường chỉnh sửa
const EditableInput = ({ label, value, onChange, icon, placeholder, fullWidth }) => (
    <div className={fullWidth ? "md:col-span-2" : ""}>
        <label className="block text-xs font-bold text-slate-700 mb-2">{label}</label>
        <div className="relative">
            {icon && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    {icon}
                </div>
            )}
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full ${icon ? 'pl-11' : 'pl-4'} pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all text-sm font-medium text-slate-800`}
            />
        </div>
    </div>
);

export default AgencyProfile;