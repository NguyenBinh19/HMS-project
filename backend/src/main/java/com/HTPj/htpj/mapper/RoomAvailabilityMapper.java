package com.HTPj.htpj.mapper;

import com.HTPj.htpj.dto.response.booking.RoomAvailabilityResponse;
import com.HTPj.htpj.entity.RoomType;
import org.springframework.stereotype.Component;

@Component
public class RoomAvailabilityMapper {

    public RoomAvailabilityResponse toInactive(RoomType rt) {
        return RoomAvailabilityResponse.builder()
                .roomTypeId(rt.getRoomTypeId())
                .roomTitle(rt.getRoomTitle())
                .status("inactive")
                .build();
    }

    public RoomAvailabilityResponse toActive(RoomType rt, int quantity) {
        return RoomAvailabilityResponse.builder()
                .roomTypeId(rt.getRoomTypeId())
                .roomTitle(rt.getRoomTitle())
                .price(rt.getBasePrice())
                .quantityAvaiable(quantity)
                .status("active")
                .build();
    }
}
