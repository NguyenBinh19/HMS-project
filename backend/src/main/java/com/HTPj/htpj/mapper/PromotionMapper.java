package com.HTPj.htpj.mapper;

import com.HTPj.htpj.dto.request.promotions.CreatePromotionRequest;
import com.HTPj.htpj.dto.response.promotions.ApplyPromotionResponse;
import com.HTPj.htpj.dto.response.promotions.PromotionListResponse;
import com.HTPj.htpj.dto.response.promotions.PromotionResponse;
import com.HTPj.htpj.entity.Promotion;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PromotionMapper {

    Promotion toEntity(CreatePromotionRequest request);

    PromotionResponse toPromotionResponse(Promotion promotion);

    PromotionListResponse toPromotionListResponse(Promotion promotion);

    ApplyPromotionResponse toApplyPromotionResponse(Promotion promotion);
}