package com.HTPj.htpj.dto.request.partner;
import lombok.*;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BanPartnerRequest {

    String reason;

    String evidence;

    String legalName;

    String taxCode;

    String businessLicenseNumber;

    String representativeCicNumber;

}