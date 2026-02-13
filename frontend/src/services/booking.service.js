import api from "./publicApi.config.js";

// 1. Kiểm tra phòng trống (Check Availability)
const checkAvailability = async (payload) => {
    try {
        const response = await api.post(`/booking/room_avai`, payload);
        return response.data;
    } catch (error) {
        console.error("Check Availability Error:", error);
        throw error;
    }
};

// 2. Giữ phòng (Hold Room)
const holdRoom = async (payload) => {
    try {
        const response = await api.post(`/booking/room_holds`, payload);
        return response.data;
    } catch (error) {
        console.error("Hold Room Error:", error);
        throw error;
    }
};

// 3. Gia hạn thời gian giữ phòng (Extend Hold)
const extendHold = async (holdCode) => {
    try {
        // body là object chứa holdCode
        const response = await api.post(`/booking/room_holds/extend`, { holdCode });
        return response.data;
    } catch (error) {
        console.error("Extend Hold Error:", error);
        throw error;
    }
};

// 4. Tạo booking (Create Booking)
const createBooking = async (payload) => {
    try {
        const response = await api.post(`/booking/create`, payload);
        return response.data;
    } catch (error) {
        console.error("Create Booking Error:", error);
        throw error;
    }
};

export const bookingService = {
    checkAvailability,
    holdRoom,
    extendHold,
    createBooking,
};