import React, { useState, useEffect } from 'react';
import KYCTable from '@/components/admin/kycQueue/KYCTable.jsx';
import KYCReviewModal from '@/components/admin/kycQueue/KYCReviewModal.jsx';
import { getKYCRequests } from '@/services/kyc.service.js';

const KYCQueuePage = () => {
    const [data, setData] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        getKYCRequests().then(res => setData(res));
    }, []);

    const handleOpenReview = (item) => {
        setSelectedRequest(item);
        setIsModalOpen(true);
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen font-sans">
            <h1 className="text-2xl font-bold text-[#1e293b] mb-1">Hàng đợi KYC</h1>
            <p className="text-slate-500 text-[14px] mb-8">Xử lý yêu cầu đăng ký tài khoản mới cho Đại lý và Khách sạn</p>

            {/* Tabs Header */}
            <div className="bg-white rounded-t-xl border-x border-t border-slate-200 px-6 pt-5 flex items-center justify-between">
                <h3 className="font-bold text-slate-700 text-[15px]">Danh sách chờ duyệt</h3>
                <div className="flex gap-8 border-b border-transparent">
                    <div className="pb-3 border-b-2 border-blue-600 text-blue-600 flex items-center gap-2 cursor-pointer">
                        <span className="text-[13px] font-bold">Chờ duyệt</span>
                        <span className="bg-blue-100 px-2 py-0.5 rounded-full text-[10px] font-bold">15</span>
                    </div>
                    <div className="pb-3 text-slate-400 flex items-center gap-2 cursor-pointer hover:text-slate-600 transition-colors">
                        <span className="text-[13px] font-bold">Yêu cầu bổ sung</span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[10px] font-bold">3</span>
                    </div>
                    <div className="pb-3 text-slate-400 flex items-center gap-2 cursor-pointer hover:text-slate-600 transition-colors">
                        <span className="text-[13px] font-bold">Đã duyệt</span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-600">42</span>
                    </div>
                </div>
            </div>

            {/* Table */}
            <KYCTable data={data} onReview={handleOpenReview} />

            {/* Modal Detail */}
            {isModalOpen && (
                <KYCReviewModal
                    data={selectedRequest}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

export default KYCQueuePage;