package com.HTPj.htpj.mapper;

import com.HTPj.htpj.dto.response.booking.BookingDetailResponse;
import com.HTPj.htpj.dto.response.booking.CreateBookingResponse;
import com.HTPj.htpj.dto.response.booking.ListAllBookingsResponse;
import com.HTPj.htpj.entity.Booking;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface BookingMapper {

    CreateBookingResponse toResponse(Booking entity);

    @Mapping(source = "discountTotal", target = "discountAmount")
    BookingDetailResponse toBookingDetailResponse(Booking booking);


}