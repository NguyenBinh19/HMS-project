import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children, roles }) => {
    const token = localStorage.getItem("accessToken");


    // chưa login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    let userRoles = [];

    try {
        const decoded = jwtDecode(token);

        // xử lý roles
        if (decoded.roles) {
            userRoles = decoded.roles;
        } else if (decoded.authorities) {
            userRoles = decoded.authorities;
        } else if (decoded.scope) {
            userRoles = decoded.scope.split(" ");
        }


    } catch (error) {
        return <Navigate to="/login" replace />;
    }

    // nếu có yêu cầu role
    if (roles && roles.length > 0) {

        const isAllowed = roles.some(role => userRoles.includes(role));


        if (!isAllowed) {
            return <Navigate to="/" replace />;
        }
    }

    

    return children;
};

export default ProtectedRoute;