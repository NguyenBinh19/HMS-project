// DATABASE ẢO - Lưu trên RAM tạm thời để test
let fakeDatabase = [
    { id: "SUMMER2026", code: "SUMMER2026", discount: "10% (Tối đa 500k)", duration: "01/05 - 31/05/2026", usage: { used: 50, total: 100 }, target: { type: "Public", isPublic: true }, isActive: true },
    { id: "WELCOME_B2B", code: "WELCOME_B2B", discount: "15% (Tối đa 1Tr)", duration: "01/04 - 30/06/2026", usage: { used: 12, total: 50 }, target: { type: "Private", isPublic: false }, isActive: true },
    { id: "EARLYBIRD", code: "EARLYBIRD", discount: "200.000đ", duration: "01/05 - 31/07/2026", usage: { used: 78, total: 100 }, target: { type: "Public", isPublic: true }, isActive: false }
];

export const couponApi = {
    // Lấy danh sách
    getCoupons: async (filters = {}) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Tương lai thay bằng: return axios.get('/api/coupons', { params: filters })
                resolve([...fakeDatabase]);
            }, 800);
        });
    },

    // Tạo mã mới
    createCoupon: async (couponData) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Tương lai thay bằng: return axios.post('/api/coupons', couponData)

                const newCoupon = {
                    id: Date.now().toString(), // Tạo ID ngẫu nhiên
                    code: couponData.code || "NEW_CODE",
                    discount: couponData.discountType === 'percent' ? "10% (Tối đa 500k)" : "200.000đ",
                    duration: "01/05 - 31/05/2026",
                    usage: { used: 0, total: 100 }, // Mã mới chưa ai dùng
                    target: { type: couponData.audienceType === 'public' ? "Public" : "Private", isPublic: couponData.audienceType === 'public' },
                    isActive: true
                };

                fakeDatabase.unshift(newCoupon); // Thêm lên đầu danh sách ảo
                resolve({ success: true, data: newCoupon });
            }, 1000);
        });
    },

    // Đổi trạng thái Bật/Tắt
    toggleStatus: async (id, isActive) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Tương lai thay bằng: return axios.patch(`/api/coupons/${id}/status`, { isActive })

                const index = fakeDatabase.findIndex(c => c.id === id);
                if (index !== -1) fakeDatabase[index].isActive = isActive;
                resolve({ success: true });
            }, 500);
        });
    },

    // Xóa mã
    deleteCoupon: async (id) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Tương lai thay bằng: return axios.delete(`/api/coupons/${id}`)

                fakeDatabase = fakeDatabase.filter(c => c.id !== id);
                resolve({ success: true });
            }, 500);
        });
    }
};