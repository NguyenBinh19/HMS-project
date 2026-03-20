package com.HTPj.htpj.entity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "commission_log")
public class CommissionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long commissionLogId;

    private Long commissionId;

    private String oldRateType;
    private BigDecimal oldValue;

    private String newRateType;
    private BigDecimal newValue;

    private String reason;

    private String changedBy;

    private LocalDateTime changedAt;
}