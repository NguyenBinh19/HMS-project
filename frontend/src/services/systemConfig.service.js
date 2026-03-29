import api from "./axios.config.js";

// Lấy list các cancel-booking config
const getAllCancelConfig = async () => {
    try {
        const response = await api.get(`/system-config/cancel-policy`);
        return response.data;
    } catch (error) {
        console.error("Get All Cancel Config Error:", error);
        throw error;
    }
};

// Update các cancel-booking config
const updateCancelConfig = async (payload) => {
    try {
        const response = await api.put(`/system-config/cancel-penalty`, payload);
        return response.data;
    } catch (error) {
        console.error("Update Cancel Config Error:", error);
        throw error;
    }
};

export const systemConfigService = {
    getAllCancelConfig,
    updateCancelConfig,
}