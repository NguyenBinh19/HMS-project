package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.kyc.KycUploadRequest;
import com.HTPj.htpj.dto.response.kyc.KycUploadResponse;
import com.HTPj.htpj.entity.Agency;
import com.HTPj.htpj.entity.AgencyLegalInformation;
import com.HTPj.htpj.entity.AgencyVerification;
import com.HTPj.htpj.entity.KycDocument;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.repository.AgencyLegalInformationRepository;
import com.HTPj.htpj.repository.AgencyRepository;
import com.HTPj.htpj.repository.AgencyVerificationRepository;
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
    private final AgencyVerificationRepository verificationRepository;
    private final AgencyLegalInformationRepository legalInformationRepository;
    private final KycDocumentRepository kycDocumentRepository;
    private final S3Service s3Service;

    @Override
    public KycUploadResponse uploadKyc(Long agencyId, KycUploadRequest request, MultipartFile[] files) {
        Agency agency = agencyRepository.findById(agencyId)
                .orElseThrow(() -> new AppException(ErrorCode.AGENCY_NOT_FOUND));


        Optional<AgencyVerification> latest =
                verificationRepository
                        .findTopByAgency_AgencyIdOrderByVersionDesc(agencyId);
        int newVersion = latest.map(v -> v.getVersion() + 1).orElse(1);

        LocalDateTime now = LocalDateTime.now();

        AgencyVerification verification = AgencyVerification.builder()
                .agency(agency)
                .status("Pending")
                .version(newVersion)
                .submittedAt(now)
                .createdAt(now)
                .updatedAt(now)
                .build();

        verificationRepository.save(verification);

        AgencyLegalInformation legalInfo = AgencyLegalInformation.builder()
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

            String documentType = documentTypes.get(i);  // lấy theo index

            String key = "kyc/"
                    + agencyId + "/v"
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