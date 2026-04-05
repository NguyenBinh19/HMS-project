import api from "./axios.config.js";

// Admin: Get payout list with filters
const getPayoutList = async (params = {}) => {
    const response = await api.get('/admin/payout/list', { params });
    return response.data;
};

// Admin: Get statement detail
const getStatementDetail = async (statementId) => {
    const response = await api.get(`/admin/payout/detail/${statementId}`);
    return response.data;
};

// Admin: Generate payout statements (manual trigger)
const generateStatements = async (periodStart, periodEnd) => {
    const params = {};
    if (periodStart) params.periodStart = periodStart;
    if (periodEnd) params.periodEnd = periodEnd;
    const response = await api.post('/admin/payout/generate', null, { params });
    return response.data;
};

// Admin: Export batch payment file (marks as PROCESSING)
const exportBatchPayment = async (statementIds) => {
    const response = await api.post('/admin/payout/export-batch', statementIds);
    return response.data;
};

// Admin: Mark as paid (manual reconciliation)
const markAsPaid = async (data) => {
    const response = await api.post('/admin/payout/mark-paid', data);
    return response.data;
};

// Hotel: Get all statements for a hotel (Settlement Dashboard)
const getHotelStatements = async (hotelId) => {
    const response = await api.get(`/settlement/hotel/${hotelId}`);
    return response.data;
};

// Hotel: Get statement detail with line items
const getHotelStatementDetail = async (statementId) => {
    const response = await api.get(`/settlement/detail/${statementId}`);
    return response.data;
};

// Hotel: Confirm payout statement
const confirmPayout = async (statementId, bankInfo) => {
    console.log("payload:", {
    statementId,
    ...bankInfo
});
    const response = await api.post('/settlement/confirm', {
        statementId,
        ...bankInfo
    });
    return response.data;
};

// Hotel: Dispute a statement
const disputePayout = async (statementId, reasonCode, description) => {
    const response = await api.post('/settlement/dispute', { statementId, reasonCode, description });
    return response.data;
};

export const payoutService = {
    getPayoutList,
    getStatementDetail,
    generateStatements,
    exportBatchPayment,
    markAsPaid,
    getHotelStatements,
    getHotelStatementDetail,
    confirmPayout,
    disputePayout
};
