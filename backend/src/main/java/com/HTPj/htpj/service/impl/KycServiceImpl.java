package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.kyc.ApproveVerificationRequest;
import com.HTPj.htpj.dto.request.kyc.KycUploadRequest;
import com.HTPj.htpj.dto.response.kyc.KycDocumentResponse;
import com.HTPj.htpj.dto.response.kyc.KycQueueResponse;
import com.HTPj.htpj.dto.response.kyc.KycUploadResponse;
import com.HTPj.htpj.dto.response.kyc.KycVerificationDetailResponse;
import com.HTPj.htpj.entity.*;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.mapper.KycDocumentMapper;
import com.HTPj.htpj.mapper.KycMapper;
import com.HTPj.htpj.repository.*;
import com.HTPj.htpj.service.KycService;
import com.HTPj.htpj.service.S3Service;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.stream.Collectors;
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
    private final KycMapper kycMapper;
    private final HotelRepository hotelRepository;

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

    @Override
    public List<KycQueueResponse> getAllPartnerVerifications() {

        return verificationRepository.findAllWithLegalInformation()
                .stream()
                .map(kycMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<KycQueueResponse> getPartnerVerificationsByStatus(String status) {
        return verificationRepository.findByStatusWithLegalInformation(status)
                .stream()
                .map(kycMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public KycVerificationDetailResponse getVerificationDetail(Integer verificationId) {

        PartnerVerification verification =
                verificationRepository.findDetailById(verificationId)
                        .orElseThrow(() -> new AppException(ErrorCode.KYC_VERIFICATION_NOT_FOUND));

        KycVerificationDetailResponse response = kycMapper.toDetailResponse(verification);

        List<KycDocumentResponse> documents =
                verification.getDocuments()
                        .stream()
                        .filter(doc -> !doc.getIsDeleted())
                        .map(doc -> {
                            KycDocumentResponse r = new KycDocumentResponse();
                            r.setId(doc.getId());
                            r.setDocumentType(doc.getDocumentType());
                            r.setStatus(doc.getStatus());
                            r.setFileUrl(s3Service.getFileUrl(doc.getS3ObjectKey()));
                            return r;
                        })
                        .toList();

        response.setDocuments(documents);

        return response;
    }

    @Override
    public void approveVerification(ApproveVerificationRequest request) {

        PartnerVerification verification = verificationRepository
                .findById(request.getVerificationId())
                .orElseThrow(() -> new AppException(ErrorCode.KYC_VERIFICATION_NOT_FOUND));

        verification.setReviewedBy(request.getReviewedBy());
        verification.setReviewedAt(LocalDateTime.now());
        verification.setStatus(request.getStatus());
        verification.setRejectionReason(request.getRejectionReason());


        if ("VERIFIED".equalsIgnoreCase(request.getStatus())) {

            if (verification.getLegalInformation() == null) {
                throw new AppException(ErrorCode.KYC_VERIFICATION_NOT_FOUND);
            }

            String legalName = verification.getLegalInformation().getLegalName();
            String address = verification.getLegalInformation().getBusinessAddress();
            String partnerType = verification.getPartnerType();

            if ("hotel".equalsIgnoreCase(partnerType)) {
//                Integer newHotelId = hotelRepository.generateHotelId();
                Hotel hotel = new Hotel();
//                hotel.setHotelId(newHotelId);
                hotel.setHotelName(legalName);
                hotel.setAddress(address);
                Hotel savedHotel = hotelRepository.save(hotel);
                verification.setHotel(savedHotel);
            }

            else if ("agency".equalsIgnoreCase(partnerType)) {
//                Long newAgencyId = agencyRepository.generateAgencyId();
                Agency agency = new Agency();
//                agency.setAgencyId(newAgencyId);
                agency.setAgencyName(legalName);
                agency.setAddress(address);
                Agency savedAgency = agencyRepository.save(agency);
                verification.setAgency(savedAgency);
            }
        }

        verificationRepository.save(verification);
    }
}