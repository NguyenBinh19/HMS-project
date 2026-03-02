package com.HTPj.htpj.mapper;

import com.HTPj.htpj.dto.request.hotel.CreateHotelRequest;
import com.HTPj.htpj.dto.request.hotel.UpdateHotelRequest;
import com.HTPj.htpj.dto.response.hotel.HotelDetailResponse;
import com.HTPj.htpj.dto.response.hotel.HotelResponse;
import com.HTPj.htpj.entity.Hotel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface HotelMapper {

    Hotel toHotel(CreateHotelRequest request);

    HotelResponse toHotelResponse(Hotel hotel);

    @Mapping(target = "amenities", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "avgRating", ignore = true)
    @Mapping(target = "totalReviews", ignore = true)
    HotelDetailResponse toHotelDetailResponse(Hotel hotel);

    void updateHotel(@MappingTarget Hotel hotel, UpdateHotelRequest request);
}
