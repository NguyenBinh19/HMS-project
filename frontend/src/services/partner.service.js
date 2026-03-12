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
const getAgencyPartnerDetail = async (agency_id) => {
    try {
        const response = await api.get(`/agencies/${agency_id}`);
        return response.data;
    } catch (error) {
        console.error("Get Agency Partner Detail Error:", error);
        throw error;
    }
};

// Lấy danh sách tất cả Hotel
const getAllHotelPartner = async () => {
    try {
        const response = await api.get(`/hotels`);
        return response.data;
    } catch (error){
        console.error("Get List Hotel Partner Error:", error);
        throw error;
    }
}

// Lấy thông tin chi tiết Hotel theo hotelId
const getHotelPartnerDetail = async (hotel_id) => {
    try {
        const response = await api.get(`/agencies/${hotel_id}`);
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