import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth.service';

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem('user')) || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Đăng nhập thường (Email/Pass)
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(email, password);

      if (data && data.user && data.accessToken) { 
        setCurrentUser(data.user);
        localStorage.setItem('accessToken', data.accessToken); 
        return true;
      } else {
        setError('Login failed: Invalid data received');
        return false;
      }
    } catch (err) {
      setError(err.message || 'Login failed'); 
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ✅ [MỚI] 2. Đăng nhập bằng OAuth2 (Google/Facebook)
  // Hàm này được gọi khi RedirectHandler nhận được token từ URL
  const loginWithOAuth2 = async (token) => {
    setLoading(true);
    setError(null);
    try {
      // Lưu token trước để axios interceptor có thể dùng nó gọi API
      localStorage.setItem('accessToken', token);

      // Gọi API lấy thông tin user
      const user = await authService.fetchUserProfile();
      
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        return true;
      } else {
        setError("Không thể lấy thông tin người dùng.");
        authService.logout(); // Xóa token nếu lỗi
        return false;
      }
    } catch (err) {
      console.error("OAuth2 Login Error:", err);
      setError("Đăng nhập Google/Facebook thất bại.");
      authService.logout();
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 3. Đăng xuất
  const logout = () => {
    const currentToken = authService.getAccessToken();
    authService.logout(currentToken);
    setCurrentUser(null);
  };

  // 4. Cập nhật User State (không cần login lại)
  const updateUser = (userData) => {
    setCurrentUser((prev) => {
      const updated = { ...prev, ...userData };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  // 5. Kiểm tra Role
  const hasRole = (role) => {
    if (!currentUser || !currentUser.roles) return false;
    // Kiểm tra nếu roles là mảng object (Backend trả về Set<Role>) hay mảng string
    // Nếu role là object {roleName: "CUSTOMER"}
    if (currentUser.roles.length > 0 && typeof currentUser.roles[0] === 'object') {
       return currentUser.roles.some(r => r.roleName === role);
    }
    // Nếu role là string "CUSTOMER"
    return currentUser.roles.includes(role);
  };

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
    }
  }, [currentUser]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        loginWithOAuth2, 
        logout,
        updateUser, 
        loading,
        error,
        hasRole 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};