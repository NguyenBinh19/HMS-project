package com.HTPj.htpj.controller;

import com.HTPj.htpj.dto.request.ApiResponse;
import com.HTPj.htpj.dto.request.kyc.KycUploadRequest;
import com.HTPj.htpj.dto.response.kyc.KycUploadResponse;
import com.HTPj.htpj.service.KycService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/kyc")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class KycController {

    private final KycService kycService;

    @PostMapping(value = "/upload/{agencyId}",consumes = "multipart/form-data")
    public ApiResponse<KycUploadResponse> uploadKyc(
            @PathVariable Long agencyId,
            @RequestPart("data") KycUploadRequest request,
            @RequestPart(value = "files", required = false)
            MultipartFile[] files
    ) {
        return ApiResponse.<KycUploadResponse>builder()
                .result(kycService.uploadKyc(agencyId, request, files))
                .build();
    }
}