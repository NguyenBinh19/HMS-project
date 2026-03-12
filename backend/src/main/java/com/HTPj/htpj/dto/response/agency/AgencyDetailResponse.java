package com.HTPj.htpj.dto.response.agency;
import com.HTPj.htpj.dto.response.kyc.VerificationInfoResponse;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgencyDetailResponse {
    private Long agencyId;
    private String agencyName;
    private String email;
    private String phone;
    private String address;
    private BigDecimal creditLimit;
    private BigDecimal currentCredit;
    private String status;
    private VerificationInfoResponse verification;
}
