package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.promotions.ApplyPromotionRequest;
import com.HTPj.htpj.dto.request.promotions.CheckPromotionCodeRequest;
import com.HTPj.htpj.dto.request.promotions.CreatePromotionRequest;
import com.HTPj.htpj.dto.request.promotions.UpdatePromotionRequest;
import com.HTPj.htpj.dto.response.promotions.ApplyPromotionResponse;
import com.HTPj.htpj.dto.response.promotions.PromotionListResponse;
import com.HTPj.htpj.dto.response.promotions.PromotionResponse;
import com.HTPj.htpj.entity.Promotion;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.mapper.PromotionMapper;
import com.HTPj.htpj.repository.BookingRepository;
import com.HTPj.htpj.repository.PromotionRepository;
import com.HTPj.htpj.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository promotionRepository;
    private final PromotionMapper promotionMapper;
    private final BookingRepository bookingRepository;

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

        return promotionMapper.toPromotionResponse(savedPromotion);
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
        promotion.setApplyStartDate(request.getApplyStartDate());
        promotion.setApplyEndDate(request.getApplyEndDate());
        promotion.setStayStartDate(request.getStayStartDate());
        promotion.setStayEndDate(request.getStayEndDate());
        promotion.setAgencyUsageLimit(request.getAgencyUsageLimit());
        promotion.setMinStay(request.getMinStay());
        promotion.setMaxUsage(request.getMaxUsage());
        promotion.setStatus(request.getStatus());

        Promotion savedPromotion = promotionRepository.save(promotion);

        return promotionMapper.toPromotionResponse(savedPromotion);
    }

    @Override
    public void deletePromotion(Integer id) {

        Promotion promotion = promotionRepository
                .findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));

        Integer usedCount = promotion.getUsedCount() == null ? 0 : promotion.getUsedCount();

        if (usedCount == 0) {
            promotionRepository.delete(promotion);
            return;
        }

        promotion.setIsDeleted(true);
        promotion.setStatus("INACTIVE");

        promotionRepository.save(promotion);
    }

    @Override
    public PromotionResponse getPromotionDetail(Integer id) {

        Promotion promotion = promotionRepository
                .findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));

        return promotionMapper.toPromotionResponse(promotion);
    }

    @Override
    public List<PromotionListResponse> getPromotionsByHotel(Integer hotelId) {

        List<Promotion> promotions =
                promotionRepository.findByHotelIdAndIsDeletedFalse(hotelId);

        return promotions.stream()
                .map(promotionMapper::toPromotionListResponse)
                .toList();
    }

    @Override
    public List<ApplyPromotionResponse> getAvailablePromotions(ApplyPromotionRequest request) {

        List<Promotion> promotions =
                promotionRepository.findByHotelIdAndIsDeletedFalse(request.getHotelId());

        LocalDate now = LocalDate.now();

        long nights =
                ChronoUnit.DAYS.between(request.getCheckin(), request.getCheckout());

        return promotions.stream()
                .filter(p -> "PUBLIC".equalsIgnoreCase(p.getTypePromotion()))
                .filter(p -> Boolean.FALSE.equals(p.getIsDeleted()))
                .filter(p -> "ACTIVE".equalsIgnoreCase(p.getStatus()))
                .filter(p -> p.getUsedCount() < p.getMaxUsage())
                .filter(p -> request.getBillAmount()
                        .compareTo(p.getMinOrderVal()) >= 0)
                .filter(p -> !now.isBefore(p.getApplyStartDate())
                        && !now.isAfter(p.getApplyEndDate()))
                .filter(p -> !request.getCheckin().isBefore(p.getStayStartDate())
                        && !request.getCheckout().isAfter(p.getStayEndDate()))
                .filter(p -> nights >= p.getMinStay())
                .filter(p -> {
                    Long used =
                            bookingRepository.countAgencyPromotionUsage(
                                    request.getAgencyId(),
                                    p.getCode()
                            );

                    return used < p.getAgencyUsageLimit();
                })
                .map(promotionMapper::toApplyPromotionResponse)
                .toList();
    }

    @Override
    public ApplyPromotionResponse checkPromotionCode(CheckPromotionCodeRequest request) {

        Promotion promotion =
                promotionRepository.findByCodeAndIsDeletedFalse(request.getCode())
                        .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_CODE_INVALID));

        LocalDate now = LocalDate.now();

        long nights =
                ChronoUnit.DAYS.between(request.getCheckin(), request.getCheckout());

        if (!"ACTIVE".equalsIgnoreCase(promotion.getStatus()))
            throw new AppException(ErrorCode.PROMOTION_INACTIVE);

        if (promotion.getUsedCount() >= promotion.getMaxUsage())
            throw new AppException(ErrorCode.PROMOTION_USAGE_EXCEEDED);

        if (!promotion.getHotelId().equals(request.getHotelId()))
            throw new AppException(ErrorCode.PROMOTION_NOT_APPLICABLE_HOTEL);

        if (request.getBillAmount().compareTo(promotion.getMinOrderVal()) < 0)
            throw new AppException(ErrorCode.PROMOTION_MIN_ORDER_NOT_MET);

        if (now.isBefore(promotion.getApplyStartDate()) ||
                now.isAfter(promotion.getApplyEndDate()))
            throw new AppException(ErrorCode.PROMOTION_EXPIRED);

        if (request.getCheckin().isBefore(promotion.getStayStartDate()) ||
                request.getCheckout().isAfter(promotion.getStayEndDate()))
            throw new AppException(ErrorCode.PROMOTION_STAY_DATE_INVALID);

        if (nights < promotion.getMinStay())
            throw new AppException(ErrorCode.PROMOTION_MIN_STAY_NOT_MET);

        Long used =
                bookingRepository.countAgencyPromotionUsage(
                        request.getAgencyId(),
                        promotion.getCode()
                );

        if (used >= promotion.getAgencyUsageLimit())
            throw new AppException(ErrorCode.PROMOTION_AGENCY_USAGE_EXCEEDED);

        return promotionMapper.toApplyPromotionResponse(promotion);
    }
}