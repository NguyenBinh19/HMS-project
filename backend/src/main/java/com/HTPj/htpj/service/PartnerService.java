package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.partner.BanPartnerRequest;

public interface PartnerService {
    void banPartner(String partnerType, Long partnerId, BanPartnerRequest request, String adminId);

}