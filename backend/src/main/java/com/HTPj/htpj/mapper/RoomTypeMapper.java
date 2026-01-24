package com.HTPj.htpj.mapper;

import com.HTPj.htpj.dto.response.roomtype.RoomTypeDetailResponse;
import com.HTPj.htpj.dto.response.roomtype.RoomTypeResponse;
import com.HTPj.htpj.entity.RoomType;

public class RoomTypeMapper {

    public static RoomTypeDetailResponse toDetailResponse(RoomType entity) {
        return RoomTypeDetailResponse.builder()
                .roomTypeId(entity.getRoomTypeId())
                .hotelId(entity.getHotel().getHotelId())
                .roomCode(entity.getRoomCode())
                .roomTitle(entity.getRoomTitle())
                .description(entity.getDescription())
                .basePrice(entity.getBasePrice())
                .maxGuest(entity.getMaxGuest())
                .totalRooms(entity.getTotalRooms())
                .roomStatus(entity.getRoomStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public static RoomTypeResponse toListResponse(RoomType entity) {
        return RoomTypeResponse.builder()
                .roomTypeId(entity.getRoomTypeId())
                .hotelId(entity.getHotel().getHotelId())
                .roomCode(entity.getRoomCode())
                .roomTitle(entity.getRoomTitle())
                .basePrice(entity.getBasePrice())
                .maxGuest(entity.getMaxGuest())
                .totalRooms(entity.getTotalRooms())
                .roomStatus(entity.getRoomStatus())
                .build();
    }
}
