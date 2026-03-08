package com.HTPj.htpj.mapper;

import com.HTPj.htpj.dto.response.booking.CreateBookingResponse;
import com.HTPj.htpj.dto.response.booking.ListAllBookingsResponse;
import com.HTPj.htpj.entity.Booking;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface BookingMapper {

    CreateBookingResponse toResponse(Booking entity);

    ListAllBookingsResponse toBookingSummaryResponse(Booking entity);

    List<ListAllBookingsResponse> toBookingSummaryResponseList(List<Booking> entities);
}