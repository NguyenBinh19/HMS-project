package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.promotions.CreatePromotionRequest;
import com.HTPj.htpj.dto.response.promotions.PromotionResponse;

public interface PromotionService {
    PromotionResponse createPromotion(CreatePromotionRequest request);
}
