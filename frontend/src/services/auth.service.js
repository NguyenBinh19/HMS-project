import api from "./axios.config.js"; 

// ============================
// 🔒 AUTH SERVICE
// ============================

// 1. Đăng nhập thường
const login = async (email, password) => {
  try {
    const response = await api.post(`/auth/token`, {
      email,
      password,
    });

    if (response.data && response.data.result.token) { 
      const { token, user } = response.data.result; 
      localStorage.setItem("accessToken", token); 
      // localStorage.setItem("user", JSON.stringify(user));
      return response.data; 
    }
    
    // Trường hợp API trả về 200 nhưng không có data (Logic dự phòng)
    return response.data;
  } catch (error) {
    // ⚠️ SỬA LỖI QUAN TRỌNG: 
    // Phải ném error gốc ra để component Login bắt được error.response.status (401, 403)
    console.error("Auth Service Login Error:", error);
    throw error; 
  }
};

const register = async (username, email, password, confirmPassword) => {
  try {
    const response = await api.post(`/users/register`, {
      username,
      email,
      password
    });
    return response.data;
  } catch (error) {
    // Cũng nên throw error gốc để hứng lỗi Validate (400) hoặc Conflict (409)
    throw error;
  }
};

// 3. Đăng xuất
const logout = (token) => {
  if (token) {
    api.post(`/auth/logout`, {}).catch(err => console.error(err));
  }
  
  localStorage.removeItem("user");
  localStorage.removeItem("accessToken"); 
  localStorage.removeItem("token"); 
};

// 4. Lấy user từ LocalStorage
const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) return JSON.parse(userStr);
  return null;
};

// 5. Lấy token
const getAccessToken = () => {
  return localStorage.getItem("accessToken") || localStorage.getItem("token");
};

// 6. Quên mật khẩu
const forgotPassword = async (email) => {
  try {
    const response = await api.post(`/auth/forgot-password`, { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 7. Reset mật khẩu
const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.post(`/auth/reset-password`, { token, newPassword });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 8. Xác thực Email
const verifyEmail = async (token) => {
  try {
    const response = await api.get(`/auth/verify-email`, { 
        params: { token } 
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const fetchUserProfile = async () => {
  try {
    const response = await api.get('/auth/me'); 
    const userData = response.data.data;

    if (!userData.roles && userData.authorities) {
      userData.roles = userData.authorities.map(auth => ({
        roleName: auth.authority.replace("ROLE_", "") // Bỏ tiền tố ROLE_
      }));
    }

    return userData;
  } catch (error) {
    console.error("Fetch profile error:", error);
    throw error;
  }
};

const unlinkSocialAccount = async (provider) => {
  try {
    // Gọi method DELETE: /api/v1/auth/social/unlink?provider=google
    const response = await api.delete(`/auth/social/unlink`, {
      params: { provider }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const createPassword = async (password) => {
  try {
    const response = await api.post(`/auth/create-password`, { password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const authService = {
  login,
  register,
  logout,
  getCurrentUser,
  getAccessToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  fetchUserProfile,
  unlinkSocialAccount,
  createPassword,
};