import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search, Filter, Download, Eye,
    Building2, Hotel, Users, MapPin,
    TrendingUp, Clock, AlertCircle, LayoutGrid
} from "lucide-react";

const PartnerList = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");

    // Bổ sung State để quản lý Tab (UC-075 Trigger & Step 3)
    const [activeTab, setActiveTab] = useState("All");

    // DỮ LIỆU MẪU (HARDCODED)
    const partners = [
        { id: 1, partnerCode: "PAR-9901", name: "Việt Nam Travel Group", type: "Agency", city: "Hà Nội", status: "Active", balance: 25000000, contact: "Nguyễn Văn A" },
        { id: 2, partnerCode: "PAR-8820", name: "Grand Mercure Danang", type: "Hotel", city: "Đà Nẵng", status: "Pending", balance: 0, contact: "Trần Thị B" },
        { id: 3, partnerCode: "PAR-7741", name: "Lữ Hành Saigontourist", type: "Agency", city: "TP. HCM", status: "Suspended", balance: -12000000, contact: "Lê Văn C", reason: "Nợ quá hạn 30 ngày" },
        { id: 4, partnerCode: "PAR-6612", name: "InterContinental Westlake", type: "Hotel", city: "Hà Nội", status: "Active", balance: 45000000, contact: "Phạm Minh D" },
        { id: 5, partnerCode: "PAR-5530", name: "Anex Tour Việt Nam", type: "Agency", city: "Khánh Hòa", status: "Inactive", balance: 500000, contact: "Hoàng Gia E" },
    ];

    // Logic lọc dữ liệu dựa trên Tab và Search (UC-075 Step 2 & 3)
    const filteredPartners = partners.filter(p => {
        const matchesTab = activeTab === "All" || p.type === activeTab;
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.partnerCode.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case "Active": return "bg-emerald-50 text-emerald-600 border-emerald-100";
            case "Pending": return "bg-orange-50 text-orange-600 border-orange-100";
            case "Suspended": return "bg-red-50 text-red-600 border-red-100";
            default: return "bg-slate-50 text-slate-500 border-slate-100";
        }
    };

    return (
        <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans">
            <div className="max-w-[1440px] mx-auto space-y-8">

                {/* HEADER & STATISTICS */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Quản lý đối tác</h1>
                        <p className="text-slate-500 font-medium text-sm">Tra cứu và quản lý hệ thống Travel Agencies & Hotels</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 min-w-[180px]">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Users size={20}/></div>
                            <div><p className="text-[10px] font-bold text-slate-400 uppercase">Tổng đối tác</p><p className="text-lg font-black text-slate-800">1,250</p></div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 min-w-[180px]">
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><TrendingUp size={20}/></div>
                            <div><p className="text-[10px] font-bold text-slate-400 uppercase">Hoạt động</p><p className="text-lg font-black text-emerald-600">1,100</p></div>
                        </div>
                    </div>
                </div>

                {/* PARTNER MANAGEMENT TABS --- */}
                <div className="flex items-center justify-between border-b border-slate-200">
                    <div className="flex gap-8">
                        {[
                            { id: "All", label: "Tất cả đối tác", icon: <LayoutGrid size={18}/> },
                            { id: "Agency", label: "Travel Agencies", icon: <Building2 size={18}/> },
                            { id: "Hotel", label: "Hotels", icon: <Hotel size={18}/> }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 pb-4 px-2 text-sm font-black transition-all relative ${
                                    activeTab === tab.id
                                        ? "text-blue-600"
                                        : "text-slate-400 hover:text-slate-600"
                                }`}
                            >
                                {tab.icon}
                                {tab.label.toUpperCase()}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full shadow-[0_-2px_10px_rgba(37,99,235,0.3)]" />
                                )}
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-xs uppercase transition-all mb-3">
                        <Download size={16} /> Xuất danh sách
                    </button>
                </div>

                {/* SEARCH BAR (Step 2) */}
                <div className="bg-white p-2 rounded-3xl shadow-sm border border-slate-200 flex items-center pr-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder={`Tìm trong ${activeTab === 'All' ? 'hệ thống' : activeTab}...`}
                            className="w-full pl-16 pr-4 py-5 bg-transparent border-none focus:ring-0 outline-none font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="h-10 w-[1px] bg-slate-200 mx-4" />
                    <button className="flex items-center gap-2 bg-slate-50 px-5 py-3 rounded-2xl font-black text-slate-500 hover:bg-slate-100 transition-all text-xs uppercase tracking-widest">
                        <Filter size={16}/> Lọc nâng cao
                    </button>
                </div>

                {/* DATA TABLE (Step 4) */}
                <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Đối tác</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Phân loại</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Thành phố</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Liên hệ</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trạng thái</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Số dư ví</th>
                            <th className="p-6"></th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                        {filteredPartners.length > 0 ? (
                            filteredPartners.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50/80 transition-all group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg uppercase">
                                                {p.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800 text-base leading-tight mb-1">{p.name}</p>
                                                <p className="text-[11px] font-bold text-slate-400 tracking-wider">ID: {p.partnerCode}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`flex items-center gap-2 font-black text-xs uppercase ${p.type === 'Hotel' ? 'text-blue-500' : 'text-orange-500'}`}>
                                            {p.type === 'Hotel' ? <Hotel size={14}/> : <Building2 size={14}/>}
                                            {p.type}
                                        </span>
                                    </td>
                                    <td className="p-6 text-sm font-bold text-slate-500">{p.city}</td>
                                    <td className="p-6 text-sm font-bold text-slate-700">{p.contact}</td>
                                    <td className="p-6">
                                        <div className="relative group/tooltip inline-block">
                                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border tracking-widest ${getStatusStyle(p.status)}`}>
                                                {p.status}
                                            </span>
                                            {p.reason && (
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block w-48 bg-slate-900 text-white text-[10px] p-2 rounded-lg shadow-xl z-10 font-medium">
                                                    <AlertCircle size={12} className="inline mr-1 text-red-400"/>
                                                    {p.reason}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className={`p-6 text-right font-black text-sm ${p.balance < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                                        {new Intl.NumberFormat('vi-VN').format(p.balance)} VND
                                    </td>
                                    <td className="p-6 text-right">
                                        <button
                                            onClick={() => navigate(`/admin/partners/${p.id}`)}
                                            className="p-3 bg-slate-50 group-hover:bg-blue-600 group-hover:text-white text-slate-400 rounded-2xl transition-all active:scale-90 shadow-sm"
                                        >
                                            <Eye size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            /* Search No Results */
                            <tr>
                                <td colSpan="7" className="p-20 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                            <Search size={32}/>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-black text-slate-800 uppercase tracking-widest">Không tìm thấy đối tác</p>
                                            <p className="text-sm text-slate-400 font-medium">Hãy thử kiểm tra lại từ khóa hoặc xóa bộ lọc.</p>
                                        </div>
                                        <button
                                            onClick={() => {setSearchTerm(""); setActiveTab("All");}}
                                            className="mt-2 text-blue-600 font-black text-xs uppercase border-b-2 border-blue-600 pb-1"
                                        >
                                            Xóa tất cả bộ lọc
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PartnerList;