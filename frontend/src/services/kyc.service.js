export const mockKYCData = [
    {
        id: 1,
        date: "20/05/2026 09:00",
        type: "Khách sạn",
        name: "CÔNG TY TNHH DU LỊCH ABC",
        taxId: "0101234xxx",
        address: "Số 123, Đường Nguyễn Trãi, Quận Thanh Xuân, Hà Nội",
        representative: "Nguyễn Văn A",
        idNumber: "012345678901",
        ocrScore: 98,
        status: "Match",
        handler: "Chưa phân công"
    },
    {
        id: 2,
        date: "19/05/2026 14:30",
        type: "Đại lý",
        name: "CÔNG TY TNHH THƯƠNG MẠI XYZ",
        taxId: "0109876xxx",
        address: "456 CMT8, Quận 3, TP. Hồ Chí Minh",
        representative: "Trần Thị B",
        idNumber: "098765432123",
        ocrScore: 40,
        status: "Low Confidence",
        handler: "Admin01"
    }
];

export const getKYCRequests = async () => {
    // Giả lập gọi API
    return new Promise((resolve) => {
        setTimeout(() => resolve(mockKYCData), 300);
    });
};