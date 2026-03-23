package com.HTPj.htpj.controller;

import com.HTPj.htpj.dto.request.ApiResponse;
import com.HTPj.htpj.dto.request.financial.RevenueReportRequest;
import com.HTPj.htpj.dto.response.financial.RevenueReportResponse;
import com.HTPj.htpj.service.RevenueReportService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/revenue")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RevenueReportController {

    RevenueReportService revenueReportService;

    /**
     * UC-069: Generate Revenue Report
     * Query params: hotelId, startDate, endDate, granularity, agencyId (optional), source (optional)
     */
    @GetMapping("/report/{hotelId}")
    ApiResponse<RevenueReportResponse> getRevenueReport(
            @PathVariable Integer hotelId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "DAILY") String granularity,
            @RequestParam(required = false) Long agencyId,
            @RequestParam(required = false) String source
    ) {
        RevenueReportRequest request = new RevenueReportRequest();
        request.setHotelId(hotelId);
        request.setStartDate(startDate);
        request.setEndDate(endDate);
        request.setGranularity(granularity);
        request.setAgencyId(agencyId);
        request.setSource(source);

        return ApiResponse.<RevenueReportResponse>builder()
                .result(revenueReportService.generateReport(request))
                .build();
    }
}
