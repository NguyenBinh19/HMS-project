// src/data/mockData.js

export const MOCK_AGENCY_DATA = {
    // Thông tin cơ bản & Pháp lý
    agencyName: "Hòa Bình Travel - Chi nhánh Hà Nội",
    legalName: "CÔNG TY TNHH DU LỊCH VÀ DỊCH VỤ HÒA BÌNH",
    taxCode: "0101234567",
    representativeName: "Nguyễn Ngọc Anh",
    businessLicenseNumber: "GP-2024-HBT",
    address: "Tòa nhà FPT, Khu Công nghệ cao Hòa Lạc, Hà Nội",

    // Liên hệ
    email: "contact@hoabinhtravel.demo",
    hotline: "1900 1234",
    contactPhone: "0988 123 456",

    // Hạng thành viên
    rank: {
        name: 'GOLD PARTNER',
        color: '#fbbf24',
        description: 'Bạn đang hưởng chiết khấu 15% cho mọi đơn hàng.',
        progress: 75
    },

    // Tài chính (Đồng bộ con số 100tr và 15.5tr)
    finance: {
        walletBalance: 25000000,
        creditLimit: 100000000,
        currentDebt: 15500000,
        dueDate: '15/05/2026'
    },

    // Thống kê đơn hàng
    stats: {
        newBookings: 12,
        checkins: 8,
        staff: 5
    }
};

export const MOCK_CHART_DATA = [
    { day: "01/04", revenue: 12000000 },
    { day: "02/04", revenue: 8500000 },
    { day: "03/04", revenue: 15000000 },
    { day: "04/04", revenue: 21000000 },
    { day: "05/04", revenue: 18000000 },
    { day: "06/04", revenue: 25000000 },
    { day: "Today", revenue: 32000000 },
];