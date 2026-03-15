package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.agency.UpdateAgencyRequest;
import com.HTPj.htpj.dto.response.agency.AgencyDetailResponse;
import com.HTPj.htpj.dto.response.agency.AgencyResponse;
import com.HTPj.htpj.entity.Agency;
import com.HTPj.htpj.entity.PartnerVerification;
import com.HTPj.htpj.entity.Users;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.mapper.AgencyMapper;
import com.HTPj.htpj.repository.AgencyRepository;
import com.HTPj.htpj.repository.PartnerVerificationRepository;
import com.HTPj.htpj.repository.UserRepository;
import com.HTPj.htpj.service.AgencyService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AgencyServiceImpl implements AgencyService {

    private final AgencyRepository agencyRepository;
    private final PartnerVerificationRepository verificationRepository;
    private final AgencyMapper agencyMapper;
    private final UserRepository userRepository;

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
                        .findVerifiedByAgencyOrderByVersionDesc(agencyId)
                        .stream()
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("Verification not found"));

        return agencyMapper.toAgencyDetailResponse(agency, verification);
    }

    @Override
    public AgencyDetailResponse updateAgency(UpdateAgencyRequest request) {
        Long agencyId = getCurrentAgencyId();

        Agency agency = agencyRepository.findById(agencyId)
                .orElseThrow(() -> new AppException(ErrorCode.AGENCY_NOT_FOUND));

        // check email duplicate
        if (!agency.getEmail().equals(request.getEmail())
                && agencyRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        agency.setAgencyName(request.getAgencyName());
        agency.setEmail(request.getEmail());
        agency.setHotline(request.getHotline());
        agency.setContactPhone(request.getContactPhone());

        agency.setUpdatedAt(LocalDateTime.now());

        agencyRepository.save(agency);

        return getAgencyDetail(agencyId);
    }

    private Long getCurrentAgencyId() {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        Jwt jwt = (Jwt) authentication.getPrincipal();

        String userId = jwt.getClaim("userId");

        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Agency agency = user.getAgency();

        if (agency == null) {
            throw new AppException(ErrorCode.AGENCY_NOT_FOUND);
        }

        return agency.getAgencyId();
    }
}