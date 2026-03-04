import React, { useState } from 'react';
import KYCPreparation from '@/components/kyc/KYCPreparation.jsx';
import KYCUploadForm from '@/components/kyc/KYCUploadForm.jsx';
import KYCSuccessView from '@/components/kyc/KYCSuccessView.jsx';
import StepProgressBar from '@/components/common/KYC/StepProgressBar.jsx';

const KYCPage = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [kycData, setKycData] = useState(null);

    const handleStart = () => setCurrentStep(2);

    const handleSubmission = (formData) => {
        // Thực hiện POST-1, POST-2, POST-3
        console.log("Đang nộp hồ sơ...", formData);
        setKycData(formData);
        setCurrentStep(3);
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans">
            <div className="max-w-4xl mx-auto">
                {/* Header Title */}
                <div className="text-center mb-10">
                    <StepProgressBar currentStep={currentStep} />
                </div>

                {/* Các màn hình tương ứng với từng Step */}
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