import { Routes, Route, Navigate} from "react-router-dom";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";
import VerifyEmail from "../pages/Auth/VerifyEmail";
import SessionExpiredHandler from "../common/SessionExpiredHandler";
import RoomTypes from "../pages/Hotel/RoomTypes"
import MainLayout from "../components/common/Homepage/MainLayout.jsx";

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
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
};

export default AppRoutes;