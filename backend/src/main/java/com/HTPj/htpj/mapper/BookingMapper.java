package com.HTPj.htpj.mapper;

import com.HTPj.htpj.dto.response.booking.CreateBookingResponse;
import com.HTPj.htpj.entity.Booking;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BookingMapper {

    CreateBookingResponse toResponse(Booking entity);
}