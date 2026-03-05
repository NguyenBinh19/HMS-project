package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.promotions.CreatePromotionRequest;
import com.HTPj.htpj.dto.response.promotions.PromotionResponse;
import com.HTPj.htpj.entity.Promotion;
import com.HTPj.htpj.mapper.PromotionMapper;
import com.HTPj.htpj.repository.PromotionRepository;
import com.HTPj.htpj.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository promotionRepository;
    private final PromotionMapper promotionMapper;

    @Override
    public PromotionResponse createPromotion(CreatePromotionRequest request) {

        if (promotionRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Promotion code already exists");
        }

        Promotion promotion = promotionMapper.toEntity(request);

        promotion.setUsedCount(0);
        promotion.setIsDeleted(false);
        promotion.setCreatedAt(LocalDateTime.now());

        Promotion savedPromotion = promotionRepository.save(promotion);

        return promotionMapper.toResponse(savedPromotion);
    }
}