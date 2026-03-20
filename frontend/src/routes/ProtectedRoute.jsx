import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children, roles: requiredRoles }) => {
    const token = localStorage.getItem("accessToken");
    const location = useLocation();
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    let userRolesStrings = [];
    let hotelIdFromToken = null;
    let agencyIdFromToken = null;

    try {
        const decoded = jwtDecode(token);

        // 1. Chuẩn hóa Roles (Xử lý cả mảng String hoặc mảng Object)
        const rawRoles = decoded.roles || decoded.authorities || decoded.scope || [];
        userRolesStrings = Array.isArray(rawRoles)
            ? rawRoles.map(r => (typeof r === 'object' ? r.name : r))
            : rawRoles.split(" ");

        // Nếu Token không có roles, lấy từ storedUser (đề phòng)
        if (userRolesStrings.length === 0 && storedUser.roles) {
            userRolesStrings = storedUser.roles.map(r => (typeof r === 'object' ? r.name : r));
        }

        hotelIdFromToken = decoded.hotelId;
        agencyIdFromToken = decoded.agencyId;
    } catch (error) {
        return <Navigate to="/login" replace />;
    }

    // 2. Ưu tiên ADMIN
    if (userRolesStrings.some(role => role.includes("ADMIN"))) return children;

    // 3. Lấy ID và ép kiểu về String để check (Tránh lỗi 0, null, undefined)
    const currentHotelId = String(storedUser.hotelId || hotelIdFromToken || "");
    const currentAgencyId = String(storedUser.agencyId || agencyIdFromToken || "");

    // 4. THOÁT LOOP: Cho phép ở lại các trang KYC
    const kycPaths = ["/kyc/status", "/kyc-intro", "/kyc-form"];
    if (kycPaths.some(path => location.pathname.startsWith(path))) {
        return children;
    }

    // 5. Kiểm tra Role Route
    if (requiredRoles && requiredRoles.length > 0) {
        const isAllowed = requiredRoles.some(role => userRolesStrings.includes(role));
        if (!isAllowed) return <Navigate to="/" replace />;
    }

    // 6. CHẶN DASHBOARD: Kiểm tra định danh dựa trên Role
    const isHotelRole = userRolesStrings.some(r => r.includes("HOTEL"));
    const isAgencyRole = userRolesStrings.some(r => r.includes("AGENCY"));

    // Nếu là Hotel mà ID trống (chuỗi rỗng sau khi ép kiểu)
    if (isHotelRole && (currentHotelId === "" || currentHotelId === "null")) {
        return <Navigate to="/kyc/status" replace />;
    }

    // Nếu là Agency mà ID trống
    if (isAgencyRole && (currentAgencyId === "" || currentAgencyId === "null")) {
        return <Navigate to="/kyc/status" replace />;
    }

    return children;
};

export default ProtectedRoute;