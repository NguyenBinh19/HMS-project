import api from "./axios.config.js";

// Lấy danh sách tất cả Agency
const getAllAgencyPartner = async () => {
    try {
        const response = await api.get(`/agencies`);
        return response.data;
    } catch (error){
        console.error("Get List Agency Partner Error:", error);
        throw error;
    }
}

// Lấy thông tin chi tiết Agency theo agencyId
const getAgencyPartnerDetail = async (agencyId) => {
    try {
        const response = await api.get(`/agencies/${agencyId}`);
        return response.data;
    } catch (error) {
        console.error("Get Agency Partner Detail Error:", error);
        throw error;
    }
};

// Lấy danh sách tất cả Hotel
const getAllHotelPartner = async () => {
    try {
        const response = await api.get(`/hotels/list`);
        return response.data;
    } catch (error){
        console.error("Get List Hotel Partner Error:", error);
        throw error;
    }
}

// Lấy thông tin chi tiết Hotel theo hotelId
const getHotelPartnerDetail = async (hotelId) => {
    try {
        const response = await api.get(`/hotels/list/${hotelId}`);
        return response.data;
    } catch (error) {
        console.error("Get Hotel Partner Detail Error:", error);
        throw error;
    }
};

export const partnerService = {
    getAllAgencyPartner,
    getAllHotelPartner,
    getHotelPartnerDetail,
    getAgencyPartnerDetail,

};