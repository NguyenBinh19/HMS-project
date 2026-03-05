package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.kyc.KycUploadRequest;
import com.HTPj.htpj.dto.response.kyc.KycUploadResponse;
import com.HTPj.htpj.entity.Agency;
import com.HTPj.htpj.entity.PartnerLegalInformation;
import com.HTPj.htpj.entity.PartnerVerification;
import com.HTPj.htpj.entity.KycDocument;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.repository.PartnerLegalInformationRepository;
import com.HTPj.htpj.repository.AgencyRepository;
import com.HTPj.htpj.repository.PartnerVerificationRepository;
import com.HTPj.htpj.repository.KycDocumentRepository;
import com.HTPj.htpj.service.KycService;
import com.HTPj.htpj.service.S3Service;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class KycServiceImpl implements KycService {

    private final AgencyRepository agencyRepository;
    private final PartnerVerificationRepository verificationRepository;
    private final PartnerLegalInformationRepository legalInformationRepository;
    private final KycDocumentRepository kycDocumentRepository;
    private final S3Service s3Service;

    @Override
    public KycUploadResponse uploadKyc(String userId,KycUploadRequest request, MultipartFile[] files) {
        Optional<PartnerVerification> latest =
                verificationRepository
                        .findTopBySubmittedByOrderByVersionDesc(userId);

        int newVersion = latest.map(v -> v.getVersion() + 1).orElse(1);

        LocalDateTime now = LocalDateTime.now();

        PartnerVerification verification = PartnerVerification.builder()
                .submittedBy(userId)
                .partnerType(request.getPartnerType())
                .status("Pending")
                .version(newVersion)
                .submittedAt(now)
                .createdAt(now)
                .updatedAt(now)
                .build();


        verificationRepository.save(verification);

        PartnerLegalInformation legalInfo = PartnerLegalInformation.builder()
                        .verification(verification)
                        .legalName(request.getLegalName())
                        .taxCode(request.getTaxCode())
                        .businessAddress(request.getBusinessAddress())
                        .representativeName(request.getRepresentativeName())
                        .representativeCICNumber(request.getRepresentativeCICNumber())
                        .businessLicenseNumber(request.getBusinessLicenseNumber())
                        .representativeCICDate(request.getRepresentativeCICDate())
                        .representativeCICPlace(request.getRepresentativeCICPlace())
                        .createdAt(now)
                        .updatedAt(now)
                        .build();


        legalInformationRepository.save(legalInfo);

        List<String> documentTypes = request.getDocumentTypes();

        for (int i = 0; i < files.length; i++) {

            MultipartFile file = files[i];

            if (file.isEmpty()) continue;

            String documentType = documentTypes.get(i);

            String key = "kyc/"
                    + userId + "/v"
                    + newVersion + "/"
                    + System.currentTimeMillis()
                    + "_" + file.getOriginalFilename();

            try {
                s3Service.uploadFile(file, key);
            } catch (IOException e) {
                throw new AppException(ErrorCode.KYC_FILE_UPLOAD_FAILED);
            }

            KycDocument document = KycDocument.builder()
                    .verification(verification)
                    .documentType(documentType)
                    .s3ObjectKey(key)
                    .status("Pending")
                    .isDeleted(false)
                    .createdAt(now)
                    .updatedAt(now)
                    .build();

            kycDocumentRepository.save(document);
        }

        return new KycUploadResponse(
                verification.getId(),
                verification.getStatus()
        );
    }
}