package com.HTPj.htpj.controller;
import com.HTPj.htpj.dto.request.ApiResponse;
import com.HTPj.htpj.dto.request.partner.BanPartnerRequest;
import com.HTPj.htpj.service.PartnerService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/partners")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PartnerController {
    PartnerService partnerService;

    @PutMapping("/{adminId}/{partnerType}/{partnerId}/ban")
    public ApiResponse<String> banPartner(
            @PathVariable String adminId,
            @PathVariable String partnerType,
            @PathVariable Long partnerId,
            @RequestBody BanPartnerRequest request
    ) {
        partnerService.banPartner(partnerType, partnerId, request, adminId);

        return ApiResponse.<String>builder()
                .result("Partner banned successfully")
                .build();
    }
}
