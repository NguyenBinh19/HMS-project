package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.promotions.CreatePromotionRequest;
import com.HTPj.htpj.dto.request.promotions.UpdatePromotionRequest;
import com.HTPj.htpj.dto.response.promotions.PromotionResponse;

public interface PromotionService {
    PromotionResponse createPromotion(CreatePromotionRequest request);
    PromotionResponse updatePromotion(Integer id, UpdatePromotionRequest request);
    void deletePromotion(Integer id);

}
