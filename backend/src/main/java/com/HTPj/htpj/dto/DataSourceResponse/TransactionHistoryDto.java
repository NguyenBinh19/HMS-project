package com.HTPj.htpj.dto.DataSourceResponse;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionHistoryDto(
        Long id,
        String transactionCode,
        LocalDateTime transactionDate,
        String transactionType,
        String description,
        String sourceType,
        BigDecimal amount,
        BigDecimal balanceAfter,
        String status,
        String direction
) {}
