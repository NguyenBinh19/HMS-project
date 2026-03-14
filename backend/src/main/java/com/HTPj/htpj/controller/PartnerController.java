package com.HTPj.htpj.controller;
import com.HTPj.htpj.dto.request.ApiResponse;
import com.HTPj.htpj.dto.request.partner.BanPartnerRequest;
import com.HTPj.htpj.dto.request.partner.CreateStaffRequest;
import com.HTPj.htpj.dto.request.partner.UpdateStaffRequest;
import com.HTPj.htpj.dto.response.partner.ListStaffResponse;
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

    @PostMapping("/create-staff")
    public ApiResponse<String> createStaff(
            @RequestBody CreateStaffRequest request
    ) {

        return ApiResponse.<String>builder()
                .result(partnerService.createStaff(request))
                .build();
    }

    @GetMapping("/list-staff")
    public ApiResponse<List<ListStaffResponse>> getStaffList() {

        return ApiResponse.<List<ListStaffResponse>>builder()
                .result(partnerService.getStaffList())
                .build();
    }

    @PutMapping("/lock/{userId}")
    public ApiResponse<String> lockStaff(@PathVariable String userId) {

        partnerService.lockStaff(userId);

        return ApiResponse.<String>builder()
                .result("Staff locked successfully")
                .build();
    }

    @PutMapping("/unlock/{userId}")
    public ApiResponse<String> unLockStaff(@PathVariable String userId) {

        partnerService.unLockStaff(userId);

        return ApiResponse.<String>builder()
                .result("Staff active successfully")
                .build();
    }

    @PutMapping("/staff/update")
    public ApiResponse<String> updateStaff(
            @RequestBody UpdateStaffRequest request
    ) {

        partnerService.updateStaff(request);

        return ApiResponse.<String>builder()
                .result("Staff updated successfully")
                .build();
    }

}
