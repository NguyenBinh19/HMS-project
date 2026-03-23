package com.HTPj.htpj.dto.request.financial;

import lombok.Data;

@Data
public class DisputePayoutRequest {
    private Long statementId;
    private String reasonCode;   // INCORRECT_COMMISSION, MISSING_TRANSACTION, OTHER
    private String description;
}
