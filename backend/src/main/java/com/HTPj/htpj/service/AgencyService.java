package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.agency.UpdateAgencyRequest;
import com.HTPj.htpj.dto.response.agency.AgencyDetailResponse;
import com.HTPj.htpj.dto.response.agency.AgencyResponse;

import java.util.List;

public interface AgencyService {
    List<AgencyResponse> getAllAgencies();

    //admin
    AgencyDetailResponse getAgencyDetail(Long agencyId);

    //agency
    AgencyDetailResponse getAgencyDetail();

    AgencyDetailResponse updateAgency( UpdateAgencyRequest request);
}
