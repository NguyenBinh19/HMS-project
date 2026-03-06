import api from "./axios.config.js";

// 1. Tạo mới chương trình khuyến mãi (CreatePromotionRequest)
const createPromotion = async (request) => {
    try {
        const response = await api.post(`/promotions`, request);
        return response.data;
    } catch (error) {
        console.error("Create Promotion Error:", error.response?.data || error);
        throw error;
    }
};

// 2. Cập nhật khuyến mãi theo ID
const updatePromotion = async (id, request) => {
    try {
        const response = await api.put(`/promotions/${id}`, request);
        return response.data;
    } catch (error) {
        console.error("Update Promotion Error:", error.response?.data || error);
        throw error;
    }
};

// 3. Xóa khuyến mãi
const deletePromotion = async (id) => {
    try {
        const response = await api.delete(`/promotions/${id}`);
        return response.data;
    } catch (error) {
        console.error("Delete Promotion Error:", error.response?.data || error);
        throw error;
    }
};

// 4. Lấy chi tiết một khuyến mãi theo ID
const getPromotionDetail = async (id) => {
    try {
        const response = await api.get(`/promotions/${id}`);
        return response.data;
    } catch (error) {
        console.error("Get Promotion Detail Error:", error.response?.data || error);
        throw error;
    }
};

// 5. Lấy danh sách khuyến mãi theo Hotel ID
const getPromotionsByHotel = async (hotelId) => {
    try {
        const response = await api.get(`/promotions/hotel/${hotelId}`);
        return response.data;
    } catch (error) {
        console.error("Get Promotions By Hotel Error:", error.response?.data || error);
        throw error;
    }
};

export const promotionService = {
    createPromotion,
    updatePromotion,
    deletePromotion,
    getPromotionDetail,
    getPromotionsByHotel,
};