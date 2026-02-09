import { Outlet } from "react-router-dom";
// Hãy sửa lại đường dẫn import đúng với thư mục dự án của bạn
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import Sections from "./Section.jsx";
import HotelSection from "@/components/common/Homepage/HotelSection.jsx";

const MainLayout = () => {
    return (
        <div className="flex flex-col min-h-screen">

            <Header />
            <Sections />
            {/*<main className="flex-grow bg-slate-50">*/}
            {/*    <Outlet />*/}
            {/*</main>*/}
            <HotelSection/>
            <Footer />
        </div>
    );
};

export default MainLayout;