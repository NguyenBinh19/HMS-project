package com.HTPj.htpj.dto.request.kyc;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApproveVerificationRequest {
    private Integer verificationId;
    private String reviewedBy;
    private String status;
    private String rejectionReason;

}