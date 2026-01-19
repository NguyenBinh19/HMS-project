import axios from "axios";

const API_URL =
    import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:8080/hms";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// =========================================================================
// 1. REQUEST INTERCEPTOR: Gắn token nếu có
// =========================================================================
api.interceptors.request.use(
    (config) => {
        const token =
            localStorage.getItem("accessToken") ||
            localStorage.getItem("token");

        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// =========================================================================
// 2. RESPONSE INTERCEPTOR: Xử lý lỗi tập trung
// =========================================================================
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const { response, config } = error;

        if (!response) {
            return Promise.reject(error);
        }

        const requestUrl = config?.url || "";

        // Kiểm tra có token hay không (phân biệt guest vs user)
        const hasToken =
            localStorage.getItem("accessToken") ||
            localStorage.getItem("token");

        // =====================================================
        // CASE 1: 401 - Unauthorized
        // =====================================================
        if (response.status === 401) {
            // ❌ Login / refresh token thì trả lỗi về component
            if (
                requestUrl.includes("/auth/login") ||
                requestUrl.includes("/auth/token")
            ) {
                return Promise.reject(error);
            }

            // ✅ GUEST → KHÔNG redirect
            if (!hasToken) {
                return Promise.reject(error);
            }

            // 🔒 USER ĐÃ LOGIN → token hết hạn
            localStorage.clear();
            window.location.href = "/login";
            return Promise.reject(error);
        }

        // =====================================================
        // CASE 2: 403 - Forbidden (Account locked)
        // =====================================================
        if (response.status === 403) {
            // ❌ Guest thì bỏ qua
            if (!hasToken) {
                return Promise.reject(error);
            }

            const errorMessage =
                response.data?.message || response.data?.error || "";

            const isAccountLocked = [
                "khóa",
                "lock",
                "ban",
                "disabled",
                "inactive",
            ].some((keyword) =>
                errorMessage.toLowerCase().includes(keyword)
            );

            if (isAccountLocked) {
                window.dispatchEvent(
                    new CustomEvent("auth:account-locked", {
                        detail:
                            errorMessage ||
                            "Tài khoản của bạn đã bị khóa.",
                    })
                );
            }
        }

        return Promise.reject(error);
    }
);

export default api;
