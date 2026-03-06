package com.HTPj.htpj.mapper;

import com.HTPj.htpj.dto.request.promotions.CreatePromotionRequest;
import com.HTPj.htpj.dto.response.promotions.PromotionResponse;
import com.HTPj.htpj.entity.Promotion;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PromotionMapper {

    Promotion toEntity(CreatePromotionRequest request);

    PromotionResponse toResponse(Promotion promotion);
}