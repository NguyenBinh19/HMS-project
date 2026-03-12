package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.response.agency.AgencyDetailResponse;
import com.HTPj.htpj.dto.response.agency.AgencyResponse;
import com.HTPj.htpj.entity.Agency;
import com.HTPj.htpj.entity.PartnerVerification;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.mapper.AgencyMapper;
import com.HTPj.htpj.repository.AgencyRepository;
import com.HTPj.htpj.repository.PartnerVerificationRepository;
import com.HTPj.htpj.service.AgencyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AgencyServiceImpl implements AgencyService {

    private final AgencyRepository agencyRepository;
    private final PartnerVerificationRepository verificationRepository;
    private final AgencyMapper agencyMapper;

    @Override
    public List<AgencyResponse> getAllAgencies() {

        List<Agency> agencies = agencyRepository.findAll();

        return agencies.stream()
                .map(agencyMapper::toAgencyResponse)
                .toList();
    }

    @Override
    public AgencyDetailResponse getAgencyDetail(Long agencyId) {

        Agency agency = agencyRepository.findById(agencyId)
                .orElseThrow(() -> new AppException(ErrorCode.AGENCY_NOT_FOUND));

        PartnerVerification verification =
                verificationRepository
                        .findByAgencyOrderByVersionDesc(agencyId)
                        .stream()
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("Verification not found"));

        return agencyMapper.toAgencyDetailResponse(agency, verification);
    }
}