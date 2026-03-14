import api from "./axios.config.js";

// Update thông tin cơ bản
const upAgencyProfileDetail = async (agencyId, updateData) => {
    try {
        const response = await api.put(`/agencies/update/${agencyId}`, updateData);
        return response.data;
    } catch (error) {
        console.error("Update Agency Error:", error);
        throw error;
    }
};

export const agencyService = {
    upAgencyProfileDetail
};