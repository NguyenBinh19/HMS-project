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

// 6. Cập nhật chu kỳ xét hạng (Tháng)
const updateRankCycle = async (months) => {
    try {
        const response = await api.put(`/ranks/config-cycle`, null, {
            params: { months }
        });
        return response.data;
    } catch (error) {
        console.error("Update Rank Cycle Error:", error);
        throw error;
    }
};

// 7. Lấy thông tin chu kỳ xét hạng hiện tại
const getRankCycle = async () => {
    try {
        const response = await api.get(`/ranks/config-cycle`);
        return response.data;
    } catch (error) {
        console.error("Get Rank Cycle Error:", error);
        throw error;
    }
};

export const rankService = {
    createRank,
    updateRank,
    getRankDetail,
    getAllRanks,
    deleteRank,
    updateRankCycle,
    getRankCycle,
};