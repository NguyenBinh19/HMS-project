package com.HTPj.htpj.controller;

import com.HTPj.htpj.dto.request.ApiResponse;
import com.HTPj.htpj.dto.request.agency.UpdateAgencyRequest;
import com.HTPj.htpj.dto.response.agency.AgencyDetailResponse;
import com.HTPj.htpj.dto.response.agency.AgencyResponse;
import com.HTPj.htpj.service.AgencyService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/agencies")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AgencyController {
    private final AgencyService agencyService;

    @GetMapping
    public ApiResponse<List<AgencyResponse>> getAllAgencies() {
        return ApiResponse.<List<AgencyResponse>>builder()
                .result(agencyService.getAllAgencies())
                .build();
    }

    @GetMapping("/{agencyId}")
    public ApiResponse<AgencyDetailResponse> getAgencyDetail(
            @PathVariable Long agencyId
    ) {
        return ApiResponse.<AgencyDetailResponse>builder()
                .result(agencyService.getAgencyDetail(agencyId))
                .build();
    }

    @PutMapping("/update/{agencyId}")
    public ApiResponse<AgencyDetailResponse> updateAgency(
            @PathVariable Long agencyId,
            @RequestBody UpdateAgencyRequest request
    ) {
        return ApiResponse.<AgencyDetailResponse>builder()
                .result(agencyService.updateAgency(agencyId, request))
                .build();
    }
}
