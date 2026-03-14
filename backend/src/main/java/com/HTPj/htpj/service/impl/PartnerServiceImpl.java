package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.partner.BanPartnerRequest;
import com.HTPj.htpj.entity.*;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.repository.*;
import com.HTPj.htpj.service.PartnerService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class PartnerServiceImpl implements PartnerService {

    AgencyRepository agencyRepository;
    HotelRepository hotelRepository;
    UserRepository userRepository;
    PartnerBlacklistRepository blacklistRepository;
    PartnerVerificationRepository  partnerVerificationRepository;

    @Override
    public void banPartner(String partnerType, Long partnerId,BanPartnerRequest request,String adminId) {

        PartnerVerification verification;

        if (partnerType.equalsIgnoreCase("AGENCY")) {

            Agency agency = agencyRepository.findById(partnerId)
                    .orElseThrow(() -> new AppException(ErrorCode.AGENCY_NOT_FOUND));

            agency.setStatus("SUSPENDED");
            agencyRepository.save(agency);

            userRepository.suspendUsersByAgency(partnerId);
            verification = partnerVerificationRepository
                    .findVerifiedByAgencyOrderByVersionDesc(partnerId)
                    .stream()
                    .findFirst()
                    .orElseThrow(() -> new AppException(ErrorCode.VERIFICATION_NOT_FOUND));

        }

        else if (partnerType.equalsIgnoreCase("HOTEL")) {

            Integer hotelId = partnerId.intValue();
            Hotel hotel = hotelRepository.findById(hotelId)
                    .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));

            hotel.setStatus("SUSPENDED");
            hotelRepository.save(hotel);

            userRepository.suspendUsersByHotel(hotelId);

            verification = partnerVerificationRepository
                    .findByHotelOrderByVersionDesc(hotelId)
                    .stream()
                    .findFirst()
                    .orElseThrow(() -> new AppException(ErrorCode.VERIFICATION_NOT_FOUND));

        }

        else {
            throw new AppException(ErrorCode.INVALID_PARTNER_TYPE);
        }

        PartnerLegalInformation legal = verification.getLegalInformation();

        PartnerBlacklist blacklist = PartnerBlacklist.builder()
                .partnerId(partnerId)
                .partnerType(partnerType)
                .reason(request.getReason())
                .evidence(request.getEvidence())
                .legalName(legal.getLegalName())
                .taxCode(legal.getTaxCode())
                .businessLicenseNumber(legal.getBusinessLicenseNumber())
                .representativeCicNumber(legal.getRepresentativeCICNumber())
                .bannedBy(adminId)
                .createdAt(LocalDateTime.now())
                .build();

        blacklistRepository.save(blacklist);
    }
}