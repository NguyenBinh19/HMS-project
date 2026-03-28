package com.HTPj.htpj.controller;

import com.HTPj.htpj.dto.request.ApiResponse;
import com.HTPj.htpj.entity.SystemConfig;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.repository.SystemConfigRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/system-config")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class SystemConfigController {

    SystemConfigRepository systemConfigRepository;

    /**
     * Get cancellation penalty configs
     * Returns: CANCEL_DAYS_BEFORE_CHECKIN and CANCEL_PENALTY_PERCENT
     */
    @GetMapping("/cancel-penalty")
    public ApiResponse<Map<String, String>> getCancelPenaltyConfig() {
        List<SystemConfig> configs = systemConfigRepository.findByConfigCodeIn(
                List.of("CANCEL_DAYS_BEFORE_CHECKIN", "CANCEL_PENALTY_PERCENT")
        );

        Map<String, String> result = configs.stream()
                .collect(Collectors.toMap(SystemConfig::getConfigCode, SystemConfig::getConfigValue));

        return ApiResponse.<Map<String, String>>builder()
                .result(result)
                .build();
    }

    /**
     * Update cancellation penalty configs
     * Body: { "daysBeforeCheckin": "3", "penaltyPercent": "30" }
     */
    @PutMapping("/cancel-penalty")
    public ApiResponse<String> updateCancelPenaltyConfig(@RequestBody Map<String, String> request) {
        String currentUserId = getCurrentUserId();

        String daysValue = request.get("daysBeforeCheckin");
        String penaltyValue = request.get("penaltyPercent");

        if (daysValue != null) {
            int days = Integer.parseInt(daysValue);
            if (days < 0) throw new AppException(ErrorCode.INVALID_CONFIG_VALUE);

            SystemConfig config = systemConfigRepository.findByConfigCode("CANCEL_DAYS_BEFORE_CHECKIN")
                    .orElseGet(() -> SystemConfig.builder()
                            .configCode("CANCEL_DAYS_BEFORE_CHECKIN")
                            .configName("Cancel Days Before Checkin")
                            .dataType("INTEGER")
                            .description("Number of days before check-in that triggers cancellation penalty")
                            .isActive(true)
                            .build());

            config.setConfigValue(String.valueOf(days));
            config.setUpdatedAt(LocalDateTime.now());
            config.setUpdatedBy(currentUserId);
            systemConfigRepository.save(config);
        }

        if (penaltyValue != null) {
            double percent = Double.parseDouble(penaltyValue);
            if (percent < 0 || percent > 100) throw new AppException(ErrorCode.INVALID_CONFIG_VALUE);

            SystemConfig config = systemConfigRepository.findByConfigCode("CANCEL_PENALTY_PERCENT")
                    .orElseGet(() -> SystemConfig.builder()
                            .configCode("CANCEL_PENALTY_PERCENT")
                            .configName("Cancel Penalty Percent")
                            .dataType("DECIMAL")
                            .description("Percentage of booking amount charged as penalty for late cancellation")
                            .isActive(true)
                            .build());

            config.setConfigValue(penaltyValue);
            config.setUpdatedAt(LocalDateTime.now());
            config.setUpdatedBy(currentUserId);
            systemConfigRepository.save(config);
        }

        return ApiResponse.<String>builder()
                .result("Cancel penalty config updated successfully")
                .build();
    }

    private String getCurrentUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            return jwt.getClaimAsString("userId");
        }
        return null;
    }
}
