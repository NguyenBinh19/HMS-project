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
import SearchHotelEngine from "@/pages/Agency/HotelSearchEngine.jsx"
import ListSearchResult from "@/pages/Agency/ListSearchResult.jsx";
import CouponManager from "@/pages/Hotel/CouponManager.jsx";
import AgencyMain from "@/pages/Agency/AgencyDashboard.jsx";
import MyBookingList from "@/pages/Agency/BookingLists.jsx"
import BookingDetailPost from "@/pages/Agency/BookingDetailPost.jsx";
import AddonServiceManager from "@/pages/Hotel/AddonServices.jsx";
import KYCIntroduction from "@/pages/Auth/KYCIntroduction.jsx"
import AdminLayout from "@/pages/Admin/AdminDashboard.jsx";
import KYCQueuePage from "@/pages/Admin/KYCQueue.jsx";
import VerificationStatusPage from "@/pages/Auth/VerificationStatus.jsx";
import ViewAboutUs from "@/pages/common/ViewAboutUs.jsx";
import ViewContact from "@/pages/common/ViewContact.jsx";
import ViewAllBooking from "@/pages/Admin/ViewAllBooking.jsx";
import StaffDashboard from "@/pages/Agency/StaffDashboard.jsx";
import HotelStaffDashboard from "@/pages/Hotel/HotelStaffDashboard.jsx";
import AgencyProfile from "@/pages/Agency/AgencyProfile.jsx";
import HotelProfile from "@/pages/Hotel/HotelProfile.jsx"
import FeedbackHistory from "@/pages/Agency/FeedbackHistory.jsx";
import HotelFeedbackManagement from "@/pages/Hotel/HotelFeedbackManage.jsx";
import FrontDesk from "@/pages/Hotel/FrontDesk.jsx";
import AdminBookingDetail from "@/pages/Admin/AdminBookingDetail.jsx";
import PartnerList from "@/pages/Admin/PartnerList.jsx";
import PartnerDetail from "@/pages/Admin/PartnerDetail.jsx";
import PrivatePolicy from "@/pages/common/PrivatePolicy.jsx";
import TermsOfServicePage from "@/pages/common/TermsService.jsx";
import UserGuidePage from "@/pages/common/UserGuide.jsx";
import AgencyDashboardPage from "@/pages/Agency/AgencyDashboardPage.jsx";
import HotelDashboardPage from "@/pages/Hotel/HotelDashboardPage.jsx";
import AdminDashboardPage from "@/pages/Admin/AdminDashboardPage.jsx";
const AppRoutes = () => {
    return (
        <>
            <SessionExpiredHandler />

            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />

                {/*màn giới thiệu*/}
                <Route path="/homepage" element={<MainLayout />} />
                <Route path="/about-us" element={<ViewAboutUs />} />
                <Route path="/contact" element={<ViewContact />} />
                <Route path="/private-policy" element={<PrivatePolicy />} />
                <Route path="/term-service" element={<TermsOfServicePage />} />
                <Route path="/user-guide" element={<UserGuidePage />} />

                <Route path="/kyc-intro" element={<KYCIntroduction />} />
                <Route path="/kyc/status" element={<VerificationStatusPage />} />

                {/*Luồng Agency Booking*/}
                <Route path="booking-success" element={<BookingSuccessPage />} />
                <Route path="/" element={<AgencyMain />}>
                    <Route path="search-hotel">
                        <Route index element={<SearchHotelEngine />} />
                        <Route path="list" element={<ListSearchResult />} />
                        <Route path="hotels/:id" element={<HotelDetailPage />} />
                    </Route>
                    <Route path="booking-checkout" element={<BookingCheckoutPage />} />
                    <Route path="booking-list">
                        <Route index element={<MyBookingList />} />
                        <Route path="detail/:id" element={<BookingDetailPost />} />
                    </Route>
                    <Route path="staff" element={<StaffDashboard />} />
                    <Route path="agency-profile" element={<AgencyProfile />} />
                    <Route path="feedback-history" element={<FeedbackHistory />} />
                    <Route path="agency-dashboard" element={<AgencyDashboardPage />} />
                    {/*<Route path="booking-success" element={<BookingSuccessPage />} />*/}
                </Route>

                {/*Luồng Hotel Admin*/}
                <Route path="/hotel" element={<HotelMain />}>
                    <Route path="dashboard" element={<HotelDashboardPage />} />
                    <Route path="room-types" element={<RoomTypes />} />
                    <Route index element={<Navigate to="room-types" replace />} />
                    <Route path="dynamic-pricing" element={<DynamicPricing />} />
                    <Route index element={<Navigate to="dynamic-pricing" replace />} />
                    <Route path="coupons" element={<CouponManager />} />
                    <Route index element={<Navigate to="coupons" replace />} />
                    <Route path="staff" element={<HotelStaffDashboard/>} />
                    <Route path="profile" element={<HotelProfile/>} />
                    <Route path="addon-services" element={<AddonServiceManager />} />
                    <Route path="reviews" element={<HotelFeedbackManagement />} />
                    <Route path="front-desk" element={<FrontDesk/>} />
                </Route>

                {/*Luồng Admin System*/}
                <Route path="/admin" element={<AdminLayout />}>
                    <Route path="dashboard" element={<AdminDashboardPage />} />
                    <Route path="kyc-queue" element={<KYCQueuePage />} />
                    <Route path="view-booking" element={<ViewAllBooking />} />
                    <Route path="view-booking/:bookingCode" element={<AdminBookingDetail />} />
                    <Route path="partners" element={<PartnerList />} />
                    <Route path="partners/agency/:id" element={<PartnerDetail />} />
                    <Route path="partners/hotel/:id" element={<PartnerDetail />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
};

export default AppRoutes;