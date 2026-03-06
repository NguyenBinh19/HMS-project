import React, { useState } from 'react';
import KYCPreparation from '@/components/kyc/KYCPreparation.jsx';
import KYCUploadForm from '@/components/kyc/KYCUploadForm.jsx';
import KYCSuccessView from '@/components/kyc/KYCSuccessView.jsx';
import StepProgressBar from '@/components/common/KYC/StepProgressBar.jsx';
import {kycService} from "@/services/kyc.service.js";

const KYCPage = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [userId, setUserId] = useState("b00b85a6-6865-4f6a-a14f-fc7d6ff4d972"); // Giả định nhập tay hoặc lấy từ context

    const handleStart = () => setCurrentStep(2);

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
                {/*<div className="mb-4 flex justify-end items-center gap-2">*/}
                {/*    <span className="text-xs font-bold text-slate-400">UserId (Tay):</span>*/}
                {/*    <input*/}
                {/*        className="border rounded px-2 py-1 text-xs"*/}
                {/*        value={userId}*/}
                {/*        onChange={(e) => setUserId(e.target.value)}*/}
                {/*    />*/}
                {/*</div>*/}

                <div className="text-center mb-10">
                    <StepProgressBar currentStep={currentStep} />
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    {currentStep === 1 && <KYCPreparation onStart={handleStart} />}
                    {currentStep === 2 && (
                        <KYCUploadForm
                            onBack={() => setCurrentStep(1)}
                            onSubmit={handleSubmission}
                        />
                    )}
                    {currentStep === 3 && <KYCSuccessView />}
                </div>
            </div>
        </div>
    );
};

export default KYCPage;