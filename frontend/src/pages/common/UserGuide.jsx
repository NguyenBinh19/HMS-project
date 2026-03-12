import React, { useState } from 'react';
import {
    BookOpen,
    UserPlus,
    CheckCircle,
    CreditCard,
    Search,
    HelpCircle,
    ChevronDown,
    PlayCircle,
    ArrowRight,
    MousePointer2,
    Settings,
    FileText
} from 'lucide-react';
import Header from "@/components/common/Homepage/Header.jsx";
import Footer from "@/components/common/Homepage/Footer.jsx";

const UserGuidePage = () => {
    const [activeTab, setActiveTab] = useState('agency'); // 'agency' or 'hotel'
    const [openFaq, setOpenFaq] = useState(null);

    const stepsAgency = [
        {
            title: "Đăng ký & Xác minh",
            desc: "Đại lý cung cấp GPKD và thông tin người đại diện. Hệ thống sẽ thẩm định hồ sơ trong 24-48h.",
            icon: <UserPlus size={24} className="text-blue-600" />,
            details: ["Chuẩn bị ảnh chụp GPKD", "Xác thực email doanh nghiệp", "Đợi admin duyệt trạng thái Active"]
        },
        {
            title: "Nhận hạn mức Credit Limit",
            desc: "Sau khi duyệt, Đại lý được cấp một hạn mức nợ (ví dụ: 50.000.000đ) để bắt đầu đặt phòng.",
            icon: <CreditCard size={24} className="text-emerald-600" />,
            details: ["Kiểm tra số dư tại Dashboard", "Tìm hiểu về ngày chốt công nợ (mùng 2 hàng tháng)", "Quy tắc 15 ngày ân hạn"]
        },
        {
            title: "Tìm kiếm & Đặt phòng",
            desc: "Sử dụng bộ lọc thông minh để tìm khách sạn theo giá Net dành riêng cho B2B.",
            icon: <Search size={24} className="text-purple-600" />,
            details: ["Lọc theo hạng sao, vị trí", "Chọn chính sách hoàn hủy phù hợp", "Xác nhận bằng Credit Limit"]
        },
        {
            title: "Quản lý Đơn hàng & Thanh toán",
            desc: "Theo dõi trạng thái Voucher và thanh toán dư nợ để khôi phục hạn mức.",
            icon: <FileText size={24} className="text-amber-600" />,
            details: ["Tải Voucher điện tử", "Thanh toán qua QR Code tích hợp", "Ghi nhận hóa đơn tự động"]
        }
    ];

    const faqs = [
        { q: "Làm thế nào để tăng hạn mức tín dụng?", a: "Đại lý cần duy trì lịch sử thanh toán tốt trong 3 tháng liên tiếp và gửi yêu cầu nâng hạn mức qua email pháp chế." },
        { q: "Tôi phải làm gì nếu thanh toán nhầm đơn hàng?", a: "Vui lòng liên hệ Hotline hỗ trợ 24/7 và cung cấp mã giao dịch để chúng tôi tiến hành hoàn tiền hoặc đối trừ công nợ." },
        { q: "Hệ thống có hỗ trợ xuất hóa đơn VAT không?", a: "Có, hệ thống tự động xuất e-Invoice sau khi đơn hàng hoàn thành (Check-out)." }
    ];

    return (
        <div className="bg-[#fcfdfe] min-h-screen font-sans">
            <Header />

            <main className="pt-32 pb-20">
                {/* HERO SEARCH */}
                <section className="max-w-7xl mx-auto px-6 mb-20">
                    <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
                        <div className="relative z-10">
                            <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
                                Trung tâm <span className="text-blue-500">Hỗ trợ & Hướng dẫn</span>
                            </h1>
                            <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10">
                                Tìm kiếm tài liệu hướng dẫn nhanh hoặc xem quy trình vận hành chi tiết dành cho Đối tác của HMS-B2B.
                            </p>
                            <div className="max-w-xl mx-auto relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm hướng dẫn (VD: cách thanh toán, duyệt phòng...)"
                                    className="w-full py-5 pl-12 pr-6 rounded-2xl bg-white/10 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[120px] rounded-full"></div>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-6">
                    {/* ROLE SWITCHER */}
                    <div className="flex justify-center mb-16">
                        <div className="bg-slate-100 p-2 rounded-2xl inline-flex">
                            <button
                                onClick={() => setActiveTab('agency')}
                                className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'agency' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                            >
                                Dành cho Đại lý (Agency)
                            </button>
                            <button
                                onClick={() => setActiveTab('hotel')}
                                className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'hotel' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                            >
                                Dành cho Khách sạn (Hotel)
                            </button>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-12">
                        {/* MAIN CONTENT: STEPS */}
                        <div className="lg:col-span-8 space-y-8">
                            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <BookOpen className="text-blue-600" />
                                Quy trình vận hành chuẩn
                            </h3>

                            <div className="space-y-6">
                                {stepsAgency.map((step, index) => (
                                    <div key={index} className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <div className="w-16 h-16 shrink-0 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                {step.icon}
                                            </div>
                                            <div className="flex-grow">
                                                <h4 className="text-xl font-black text-slate-900 mb-2">{index + 1}. {step.title}</h4>
                                                <p className="text-slate-500 mb-6 leading-relaxed">{step.desc}</p>
                                                <ul className="grid md:grid-cols-2 gap-3">
                                                    {step.details.map((detail, i) => (
                                                        <li key={i} className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                                            <CheckCircle size={16} className="text-emerald-500" />
                                                            {detail}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* SIDEBAR: VIDEO & FAQ */}
                        <aside className="lg:col-span-4 space-y-8">
                            {/* VIDEO TUTORIAL */}
                            <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                                <div className="relative z-10">
                                    <h4 className="text-xl font-black mb-4 leading-tight">Video hướng dẫn đặt phòng trong 2 phút</h4>
                                    <button className="flex items-center gap-3 font-bold bg-white text-blue-600 px-6 py-3 rounded-xl hover:scale-105 transition-transform">
                                        <PlayCircle size={20} /> Xem ngay
                                    </button>
                                </div>
                                <div className="absolute -bottom-6 -right-6 opacity-20 group-hover:scale-110 transition-transform">
                                    <PlayCircle size={150} />
                                </div>
                            </div>

                            {/* FAQ SECTION */}
                            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                                <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                                    <HelpCircle className="text-blue-600" /> Câu hỏi thường gặp
                                </h4>
                                <div className="space-y-4">
                                    {faqs.map((faq, index) => (
                                        <div key={index} className="border-b border-slate-100 pb-4 last:border-0">
                                            <button
                                                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                                className="w-full flex justify-between items-center text-left gap-4 group"
                                            >
                                                <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{faq.q}</span>
                                                <ChevronDown size={16} className={`text-slate-400 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                                            </button>
                                            {openFaq === index && (
                                                <p className="text-xs text-slate-500 mt-3 leading-relaxed animate-in fade-in slide-in-from-top-2">
                                                    {faq.a}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* CONTACT BOX */}
                            <div className="p-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-center">
                                <p className="text-slate-500 text-sm font-medium mb-4">Vẫn gặp khó khăn?</p>
                                <button className="text-blue-600 font-black text-sm flex items-center gap-2 mx-auto hover:gap-4 transition-all">
                                    Chat với CSKH <ArrowRight size={16} />
                                </button>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default UserGuidePage;