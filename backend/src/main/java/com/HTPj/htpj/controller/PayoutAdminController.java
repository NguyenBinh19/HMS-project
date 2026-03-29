package com.HTPj.htpj.controller;

import com.HTPj.htpj.dto.request.ApiResponse;
import com.HTPj.htpj.dto.request.financial.MarkAsPaidRequest;
import com.HTPj.htpj.dto.request.financial.PayoutListRequest;
import com.HTPj.htpj.dto.response.financial.PayoutListResponse;
import com.HTPj.htpj.dto.response.financial.PayoutStatementResponse;
import com.HTPj.htpj.service.PayoutStatementService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/admin/payout")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PayoutAdminController {

    PayoutStatementService payoutStatementService;

    /**
     * UC-088: View Payout List (Admin)
     */
    @GetMapping("/list")
    ApiResponse<PayoutListResponse> getPayoutList(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodStart,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodEnd,
            @RequestParam(required = false) Integer hotelId
    ) {
        PayoutListRequest request = new PayoutListRequest();
        request.setStatus(status);
        request.setPeriodStart(periodStart);
        request.setPeriodEnd(periodEnd);
        request.setHotelId(hotelId);

        return ApiResponse.<PayoutListResponse>builder()
                .result(payoutStatementService.getPayoutList(request))
                .build();
    }

    /**
     * UC-088: View statement detail (Admin)
     */
    @GetMapping("/detail/{statementId}")
    ApiResponse<PayoutStatementResponse> getStatementDetail(
            @PathVariable Long statementId
    ) {
        return ApiResponse.<PayoutStatementResponse>builder()
                .result(payoutStatementService.getStatementDetail(statementId))
                .build();
    }

    /**
     * UC-088.1: Export Batch Payment File — marks selected as PROCESSING
     */
    @PostMapping("/export-batch")
    ApiResponse<List<PayoutStatementResponse>> exportBatchPayment(
            @RequestBody List<Long> statementIds
    ) {
        return ApiResponse.<List<PayoutStatementResponse>>builder()
                .result(payoutStatementService.exportBatchPayment(statementIds))
                .build();
    }

    /**
     * UC-088.2: Mark As Paid (Manual Reconciliation)
     */
    @PostMapping("/mark-paid")
    ApiResponse<List<PayoutStatementResponse>> markAsPaid(
            @RequestBody MarkAsPaidRequest request
    ) {
        return ApiResponse.<List<PayoutStatementResponse>>builder()
                .result(payoutStatementService.markAsPaid(request))
                .build();
    }
}
