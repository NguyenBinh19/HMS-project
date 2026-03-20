package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.commission.CreateCommissionRequest;
import com.HTPj.htpj.dto.request.commission.DeleteCommissionRequest;
import com.HTPj.htpj.dto.response.commision.CommissionDetailResponse;
import com.HTPj.htpj.dto.response.commision.CommissionResponse;

import java.util.List;

public interface CommissionService {
    String create(CreateCommissionRequest request);

    String delete(Long commissionId, DeleteCommissionRequest request);

    List<CommissionResponse> getAll();

    CommissionDetailResponse getDetail(Long commissionId);
}
