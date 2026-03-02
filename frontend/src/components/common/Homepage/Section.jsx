import {
    MapPin, Calendar, Search,
    Building2, UserCheck, ShieldCheck, Bot, Wallet
} from "lucide-react";
import homepage from "@/assets/images/homepage.jpg";

const HomePage = () => {
    return (
        <div className="flex flex-col">

            {/* ================= HERO SECTION ================= */}
            <section className="relative h-[600px] flex flex-col items-center justify-center text-center px-4">

                {/* Background Image & Overlay */}
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${homepage})` }}
                >
                    {/* Lớp phủ màu đen mờ */}
                    <div className="absolute inset-0 bg-black/50"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">

                    {/* Headline */}
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4 drop-shadow-md">
                        Nền tảng Đặt phòng B2B An toàn & <br className="hidden md:block" />
                        Thông minh nhất Việt Nam
                    </h1>

                    {/* Sub-headline */}
                    <p className="text-blue-100 text-lg md:text-xl font-light mb-10 max-w-3xl drop-shadow-sm">
                        Giải pháp giữ tiền trung gian (Escrow) bảo vệ dòng tiền <br className="hidden md:block"/>
                        100% - Tích hợp AI tìm kiếm phòng siêu tốc
                    </p>

                    {/* Role Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-12 w-full justify-center">
                        <button className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-[#00A651] hover:bg-[#008f45] text-white font-bold text-base shadow-lg transition-transform active:scale-95">
                            <UserCheck size={20} />
                            Tôi là Đại lý (Agency)
                        </button>

                        <button className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-[#F36F21] hover:bg-[#d85e17] text-white font-bold text-base shadow-lg transition-transform active:scale-95">
                            <Building2 size={20} />
                            Tôi là Khách sạn (Hotel)
                        </button>
                    </div>

                    {/* Search Bar Widget */}
                    <div className="bg-white p-2 md:p-3 rounded-xl shadow-2xl w-full max-w-4xl flex flex-col md:flex-row gap-2">

                        {/* Input Địa điểm */}
                        <div className="flex-1 flex items-center bg-slate-50 rounded-lg px-4 py-3 border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                            <MapPin className="text-slate-400 mr-3" size={20} />
                            <input
                                type="text"
                                placeholder="Nhập địa điểm..."
                                className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400 font-medium"
                            />
                        </div>

                        {/* Input Ngày tháng */}
                        <div className="md:w-1/3 flex items-center bg-slate-50 rounded-lg px-4 py-3 border border-slate-200 focus-within:border-blue-500 transition-all">
                            <input
                                type="text"
                                placeholder="dd/mm/yy"
                                className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400 font-medium"
                            />
                            <Calendar className="text-slate-400 ml-2" size={20} />
                        </div>

                        {/* Search Button */}
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md">
                            <Search size={20} />
                            Tìm kiếm
                        </button>
                    </div>

                </div>
            </section>

            {/* ================= FEATURES SECTION ================= */}
            <section className="py-16 md:py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            Tại sao chọn chúng tôi?
                        </h2>
                        <p className="text-slate-500 text-lg">
                            Những tính năng cốt lõi giúp bạn an tâm giao dịch
                        </p>
                    </div>

                    {/* Feature Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        {/* Card 1 (Blue) */}
                        <div className="bg-slate-50 rounded-3xl p-8 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300 border border-slate-100 shadow-sm hover:shadow-md">
                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-6 text-blue-600">
                                <ShieldCheck size={32} strokeWidth={2} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3">Hỗ trợ 24/7</h3>
                            <p className="text-slate-500 leading-relaxed text-sm px-2">
                                Đội ngũ chuyên viên am hiểu thị trường, sẵn sàng xử lý mọi yêu cầu đặc biệt và sự cố phát sinh bất kể ngày đêm.
                            </p>
                        </div>

                        {/* Card 2 (Purple) */}
                        <div className="bg-slate-50 rounded-3xl p-8 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300 border border-slate-100 shadow-sm hover:shadow-md">
                            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-6 text-purple-600">
                                <Bot size={32} strokeWidth={2} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3">Bảo vệ quyền lợi đối tác</h3>
                            <p className="text-slate-500 leading-relaxed text-sm px-2">
                                Chủ động đàm phán với nhà cung cấp để tối ưu chính sách hoàn hủy cho đại lý trong các tình huống bất khả kháng.
                            </p>
                        </div>

                        {/* Card 3 (Green) */}
                        <div className="bg-slate-50 rounded-3xl p-8 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300 border border-slate-100 shadow-sm hover:shadow-md">
                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6 text-green-600">
                                <Wallet size={32} strokeWidth={2} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3">Đào tạo & Cập nhật</h3>
                            <p className="text-slate-500 leading-relaxed text-sm px-2">
                                Thường xuyên tổ chức webinar và workshop cập nhật xu hướng du lịch, giúp đại lý làm chủ công nghệ.
                            </p>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;