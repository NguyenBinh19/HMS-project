package com.HTPj.htpj.mapper;

import com.HTPj.htpj.dto.response.roomtype.AmenityResponse;
import com.HTPj.htpj.dto.response.roomtype.RoomTypeDetailResponse;
import com.HTPj.htpj.dto.response.roomtype.RoomTypeResponse;
import com.HTPj.htpj.entity.Amenity;
import com.HTPj.htpj.entity.RoomType;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class RoomTypeMapper {

    public static RoomTypeDetailResponse toDetailResponse(RoomType entity) {
        List<AmenityResponse> amenities = entity.getAmenities() == null
                ? Collections.emptyList()
                : entity.getAmenities().stream()
                        .map(RoomTypeMapper::toAmenityResponse)
                        .collect(Collectors.toList());

        return RoomTypeDetailResponse.builder()
                .roomTypeId(entity.getRoomTypeId())
                .hotelId(entity.getHotel().getHotelId())
                .roomCode(entity.getRoomCode())
                .roomTitle(entity.getRoomTitle())
                .description(entity.getDescription())
                .basePrice(entity.getBasePrice())
                .max_adults(entity.getMax_adults())
                .maxChildren(entity.getMaxChildren())
                .roomArea(entity.getRoomArea())
                .bedType(entity.getBedType())
                .keywords(entity.getKeywords())
                .totalRooms(entity.getTotalRooms())
                .roomStatus(entity.getRoomStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .amenities(amenities)
                .build();
    }

    public static AmenityResponse toAmenityResponse(Amenity entity) {
        return AmenityResponse.builder()
                .id(entity.getAmenityId())
                .name(entity.getName())
                .category(entity.getCategory())
                .build();
    }

    public static RoomTypeResponse toListResponse(RoomType entity) {
        return RoomTypeResponse.builder()
                .roomTypeId(entity.getRoomTypeId())
                .hotelId(entity.getHotel().getHotelId())
                .roomCode(entity.getRoomCode())
                .roomTitle(entity.getRoomTitle())
                .basePrice(entity.getBasePrice())
                .max_adults(entity.getMax_adults())
                .totalRooms(entity.getTotalRooms())
                .roomStatus(entity.getRoomStatus())
                .build();
    }
}
