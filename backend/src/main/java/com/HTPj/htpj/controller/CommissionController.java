package com.HTPj.htpj.controller;

import com.HTPj.htpj.dto.request.ApiResponse;
import com.HTPj.htpj.dto.request.commission.CreateCommissionRequest;
import com.HTPj.htpj.dto.request.commission.DeleteCommissionRequest;
import com.HTPj.htpj.dto.response.commision.CommissionDetailResponse;
import com.HTPj.htpj.dto.response.commision.CommissionResponse;
import com.HTPj.htpj.service.CommissionService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/commissions")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CommissionController {

    CommissionService commissionService;

    @PostMapping
    public ApiResponse<String> create(@RequestBody CreateCommissionRequest request) {
        return ApiResponse.<String>builder()
                .result(commissionService.create(request))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> delete(@PathVariable Long id,
                                      @RequestBody DeleteCommissionRequest request) {
        return ApiResponse.<String>builder()
                .result(commissionService.delete(id, request))
                .build();
    }

    @GetMapping
    public ApiResponse<List<CommissionResponse>> getAll() {
        return ApiResponse.<List<CommissionResponse>>builder()
                .result(commissionService.getAll())
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<CommissionDetailResponse> getDetail(@PathVariable Long id) {
        return ApiResponse.<CommissionDetailResponse>builder()
                .result(commissionService.getDetail(id))
                .build();
    }
}
