package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.promotions.CreatePromotionRequest;
import com.HTPj.htpj.dto.request.promotions.UpdatePromotionRequest;
import com.HTPj.htpj.dto.response.promotions.PromotionResponse;
import com.HTPj.htpj.entity.Promotion;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
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
            throw new AppException(ErrorCode.PROMOTION_CODE_EXISTED);
        }

        Promotion promotion = promotionMapper.toEntity(request);

        promotion.setUsedCount(0);
        promotion.setIsDeleted(false);
        promotion.setCreatedAt(LocalDateTime.now());

        Promotion savedPromotion = promotionRepository.save(promotion);

        return promotionMapper.toResponse(savedPromotion);
    }

    @Override
    public PromotionResponse updatePromotion(Integer id, UpdatePromotionRequest request) {

        Promotion promotion = promotionRepository
                .findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));

        // check code change
        if (!promotion.getCode().equals(request.getCode())) {

            boolean existed = promotionRepository
                    .existsByCodeAndIsDeletedFalse(request.getCode());

            if (existed) {
                throw new AppException(ErrorCode.PROMOTION_CODE_EXISTED);
            }
        }

        // update fields
        promotion.setName(request.getName());
        promotion.setCode(request.getCode());
        promotion.setDiscountVal(request.getDiscountVal());
        promotion.setMaxDiscount(request.getMaxDiscount());
        promotion.setMinOrderVal(request.getMinOrderVal());
        promotion.setStartDate(request.getStartDate());
        promotion.setEndDate(request.getEndDate());
        promotion.setMinStay(request.getMinStay());
        promotion.setMaxUsage(request.getMaxUsage());
        promotion.setStatus(request.getStatus());

        Promotion savedPromotion = promotionRepository.save(promotion);

        return promotionMapper.toResponse(savedPromotion);
    }
}