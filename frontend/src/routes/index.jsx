import { Routes, Route, Navigate} from "react-router-dom";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";
import VerifyEmail from "../pages/Auth/VerifyEmail";
import SessionExpiredHandler from "../common/SessionExpiredHandler";
import RoomTypes from "../pages/Hotel/RoomTypes"
import MainLayout from "../components/common/Homepage/MainLayout.jsx";
import HotelMain from "../pages/Hotel/HotelDashboard.jsx"
import DynamicPricing from "../pages/Hotel/DynamicPricing.jsx"
import HotelDetailPage from "@/pages/Hotel/HotelDetail.jsx";
import BookingCheckoutPage from "@/pages/Agency/BookingCheckout.jsx";
import BookingSuccessPage from "@/pages/Agency/BookingSuccess.jsx"
const AppRoutes = () => {
    return (
        <>
            <SessionExpiredHandler />

            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/homepage" element={<MainLayout />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/manage-room-types" element={<RoomTypes />} />
                <Route path="/hotels/:id" element={<HotelDetailPage />} />
                <Route path="/booking-checkout" element={<BookingCheckoutPage />} />
                <Route path="/booking-success" element={<BookingSuccessPage />} />
                {/*<Route path="/manage-room-types" element={<RoomTypes />} />*/}
                <Route path="/hotel" element={<HotelMain />}>
                    <Route path="room-types" element={<RoomTypes />} />
                    <Route index element={<Navigate to="room-types" replace />} />
                    <Route path="dynamic-pricing" element={<DynamicPricing />} />
                    <Route index element={<Navigate to="dynamic-pricing" replace />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
};

export default AppRoutes;