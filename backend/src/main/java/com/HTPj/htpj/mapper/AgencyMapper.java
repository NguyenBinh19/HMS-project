package com.HTPj.htpj.mapper;

import com.HTPj.htpj.dto.response.agency.AgencyDetailResponse;
import com.HTPj.htpj.dto.response.agency.AgencyResponse;
import com.HTPj.htpj.dto.response.kyc.VerificationInfoResponse;
import com.HTPj.htpj.entity.Agency;
import com.HTPj.htpj.entity.PartnerLegalInformation;
import com.HTPj.htpj.entity.PartnerVerification;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AgencyMapper {

    AgencyResponse toAgencyResponse(Agency agency);

    default AgencyDetailResponse toAgencyDetailResponse(Agency agency, PartnerVerification verification) {

        PartnerLegalInformation legal = verification.getLegalInformation();

        VerificationInfoResponse verificationInfoResponse = VerificationInfoResponse.builder()
                .verificationId(verification.getId())
                .legalInformationId(legal.getId())
                .legalName(legal.getLegalName())
                .taxCode(legal.getTaxCode())
                .businessLicenseNumber(legal.getBusinessLicenseNumber())
                .representativeName(legal.getRepresentativeName())
                .representativeCICNumber(legal.getRepresentativeCICNumber())
                .build();

        return AgencyDetailResponse.builder()
                .agencyId(agency.getAgencyId())
                .agencyName(agency.getAgencyName())
                .email(agency.getEmail())
                .phone(agency.getPhone())
                .address(agency.getAddress())
                .creditLimit(agency.getCreditLimit())
                .currentCredit(agency.getCurrentCredit())
                .status(agency.getStatus())
                .verification(verificationInfoResponse)
                .build();
    }
}