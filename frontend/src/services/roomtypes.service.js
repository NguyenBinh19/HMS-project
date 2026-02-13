import api from "./publicApi.config.js";

// 1. Tạo loại phòng
const createRoomType = async (payload) => {
    try {
        const response = await api.post(`/room-types`, payload, {
            headers: {
                Authorization: undefined,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Create Room Type Error:", error);
        throw error;
    }
};

// 2. Lấy danh sách loại phòng theo hotelId
const getRoomTypesByHotelId = async (hotelId) => {
    try {
        const response = await api.get(`/room-types`, {
            params: { hotelId },
        });
        return response.data;
    } catch (error) {
        console.error("Get Room Types Error:", error);
        throw error;
    }
};

// 3. Lấy chi tiết loại phòng
const getRoomTypeDetail = async (roomTypeId) => {
    try {
        const response = await api.get(`/room-types/${roomTypeId}`);
        return response.data;
    } catch (error) {
        console.error("Get Room Type Detail Error:", error);
        throw error;
    }
};

// 4. Xoá (inactive) loại phòng
const deleteRoomType = async (roomTypeId) => {
    try {
        const response = await api.delete(`/room-types/${roomTypeId}`);
        return response.data;
    } catch (error) {
        console.error("Delete Room Type Error:", error);
        throw error;
    }
};

// 5. Update thông tin loại phòng
const updateRoomType = async (roomTypeId, payload) => {
    try {
        const response = await api.put(`/room-types/${roomTypeId}`, payload);
        return response.data;
    } catch (error) {
        console.error("Update Room Type Error:", error);
        throw error;
    }
}

// 6. Lấy chi tiết thông tin loại phòng theo khách sạn
const getRoomTypesDetailByHotelId = async (hotelId) => {
    try {
        const response = await api.get(`/room-types/details`, {
            params: { hotelId },
        });
        return response.data;
    } catch (error) {
        console.error("Get Room Types Detail Error:", error);
        throw error;
    }
};

export const roomTypeService = {
    createRoomType,
    getRoomTypesByHotelId,
    getRoomTypeDetail,
    deleteRoomType,
    updateRoomType,
    getRoomTypesDetailByHotelId
};
