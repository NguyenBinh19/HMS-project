import React, { useState, useEffect } from 'react';
import KYCPreparation from '@/components/kyc/KYCPreparation.jsx';
import KYCUploadForm from '@/components/kyc/KYCUploadForm.jsx';
import KYCSuccessView from '@/components/kyc/KYCSuccessView.jsx';
import StepProgressBar from '@/components/common/KYC/StepProgressBar.jsx';
import {kycService} from "@/services/kyc.service.js";
import { useLocation } from 'react-router-dom';

const KYCPage = () => {
    const location = useLocation();
    const [currentStep, setCurrentStep] = useState(1);
    const [userId, setUserId] = useState("b00b85a6-6865-4f6a-a14f-fc7d6ff4d972"); // fix tam

    // Nếu có state từ màn hình Trạng thái truyền sang,
    // cho người dùng nhảy thẳng vào Step 2 (Form) luôn, bỏ qua Step 1 (Preparation)
    useEffect(() => {
        if (location.state?.initialData) {
            setCurrentStep(2);
        }
    }, [location]);
    // const handleStart = () => setCurrentStep(2);

    const handleSubmission = async (payload) => {
        try {
            const { data, files } = payload;
            const response = await kycService.uploadKyc(userId, data, files);
            console.log("KYC Upload Success:", response);
            setCurrentStep(3);
        } catch (error) {
            alert(error.message || "Có lỗi xảy ra khi nộp hồ sơ");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans">
            <div className="max-w-4xl mx-auto">
                <StepProgressBar currentStep={currentStep} />

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    {currentStep === 1 && <KYCPreparation onStart={() => setCurrentStep(2)} />}

                    {currentStep === 2 && (
                        <KYCUploadForm
                            // Nếu quay lại từ luồng sửa, ta về lại Step 1 hoặc trang cũ tùy bạn
                            onBack={() => setCurrentStep(1)}
                            onSubmit={handleSubmission}
                            // Truyền data cũ xuống nếu có
                            initialData={location.state?.initialData}
                        />
                    )}

                    {currentStep === 3 && <KYCSuccessView />}
                </div>
            </div>
        </div>
    );
};

export default KYCPage;