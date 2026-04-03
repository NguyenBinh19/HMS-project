import { Outlet } from "react-router-dom";
import DemoSidebar from "@/pages/Demo/Agency/DemoAgencySidebar.jsx";
import Header from "@/components/common/Homepage/Header";
import Footer from "@/components/common/Homepage/Footer";

const DemoAgencyLayout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">

            {/* Header - Vẫn dùng Header chung nhưng bên trong Header bạn nên
                check if(isDemoMode) để hiển thị UI phù hợp */}
            <div className="sticky top-0 z-50 bg-white shadow-sm w-full">
                <Header />
            </div>

            {/* Body */}
            <div className="flex flex-1 relative">

                {/* Sidebar phiên bản Demo */}
                <div className="w-[260px] flex-shrink-0 bg-white border-r border-slate-200">
                    <DemoSidebar />
                </div>

                {/* Nội dung trang Demo */}
                <main className="flex-1 bg-slate-50">

                    <div className="p-4 md:p-8">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0">
                <Footer />
            </div>

        </div>
    );
};

export default DemoAgencyLayout;