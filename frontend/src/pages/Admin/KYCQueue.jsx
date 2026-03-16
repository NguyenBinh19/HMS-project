import React, { useState, useEffect } from 'react';
import KYCTable from '@/components/admin/kycQueue/KYCTable.jsx';
import KYCReviewModal from '@/components/admin/kycQueue/KYCReviewModal.jsx';
import { kycService, KYC_STATUS } from '@/services/kyc.service.js';

const KYCQueuePage = () => {
    const [data, setData] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(KYC_STATUS.PENDING);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await kycService.getPartnerVerificationsByStatus(activeTab);
            setData(res.result || res || []);
        } catch (error) {
            console.error("Lỗi lấy danh sách KYC:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const handleOpenReview = async (item) => {
        try {
            const res = await kycService.getVerificationDetail(item.id);
            const detailData = res.result || res;
            setSelectedRequest(detailData);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Detail Error:", error);
            alert("Không thể lấy thông tin chi tiết hồ sơ.");
        }
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen font-sans">
            <h1 className="text-2xl font-bold text-[#1e293b] mb-1">Hàng đợi KYC</h1>
            <p className="text-slate-500 text-[14px] mb-8">Xử lý yêu cầu đăng ký tài khoản mới cho Đại lý và Khách
                sạn</p>

            {/* Tabs Header */}
            <div
                className="bg-white rounded-t-xl border-x border-t border-slate-200 px-6 pt-5 flex items-center justify-between">
                <h3 className="font-bold text-slate-700 text-[15px]">Danh sách hồ sơ</h3>
                <div className="flex gap-8">
                    <TabItem
                        label="Chờ duyệt"
                        active={activeTab === KYC_STATUS.PENDING}
                        onClick={() => setActiveTab(KYC_STATUS.PENDING)}
                    />
                    <TabItem
                        label="Yêu cầu bổ sung"
                        active={activeTab === KYC_STATUS.NEED_MORE_INFORMATION}
                        onClick={() => setActiveTab(KYC_STATUS.NEED_MORE_INFORMATION)}
                    />
                    <TabItem
                        label="Đã duyệt"
                        active={activeTab === KYC_STATUS.VERIFIED}
                        onClick={() => setActiveTab(KYC_STATUS.VERIFIED)}
                        color="text-emerald-600"
                    />
                    <TabItem
                        label="Đã từ chối"
                        active={activeTab === KYC_STATUS.REJECTED}
                        onClick={() => setActiveTab(KYC_STATUS.REJECTED)}
                        color="text-red-600"
                    />
                </div>
        </div>

    {/* Table */
    }
    <KYCTable data={data} onReview={handleOpenReview} loading={loading}/>

    {/* Modal Detail */
    }
    {
        isModalOpen && (
            <KYCReviewModal
                data={selectedRequest}
                onClose={() => setIsModalOpen(false)}
                onRefresh={fetchData}
            />
        )
    }
</div>
)
    ;
};

const TabItem = ({label, active, onClick, color = "text-blue-600"}) => (
    <div
        onClick={onClick}
        className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${active ? `border-blue-600 ${color}` : 'border-transparent text-slate-400 hover:text-slate-600'}`}
    >
        <span className="text-[13px] font-bold">{label}</span>
    </div>
);

export default KYCQueuePage;