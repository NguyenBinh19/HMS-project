import api from "./axios.config.js";

// 1. Tạo hạng mới
const createRank = async (payload) => {
    try {
        const response = await api.post(`/ranks`, payload);
        return response.data;
    } catch (error) {
        console.error("Create Rank Error:", error);
        throw error;
    }
};

// 2. Cập nhật thông tin hạng
const updateRank = async (id, payload) => {
    try {
        const response = await api.put(`/ranks/${id}`, payload);
        return response.data;
    } catch (error) {
        console.error("Update Rank Error:", error);
        throw error;
    }
};

// 3. Lấy chi tiết một hạng
const getRankDetail = async (id) => {
    try {
        const response = await api.get(`/ranks/${id}`);
        return response.data;
    } catch (error) {
        console.error("Get Rank Detail Error:", error);
        throw error;
    }
};

// 4. Lấy danh sách tất cả hạng
const getAllRanks = async () => {
    try {
        const response = await api.get(`/ranks`);
        return response.data;
    } catch (error) {
        console.error("Get All Ranks Error:", error);
        throw error;
    }
};

// 5. Xóa hạng
const deleteRank = async (id) => {
    try {
        const response = await api.delete(`/ranks/${id}`);
        return response.data;
    } catch (error) {
        console.error("Delete Rank Error:", error);
        throw error;
    }
};

export const rankService = {
    createRank,
    updateRank,
    getRankDetail,
    getAllRanks,
    deleteRank,
};