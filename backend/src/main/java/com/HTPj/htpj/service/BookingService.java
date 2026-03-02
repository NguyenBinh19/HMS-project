package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.booking.CreateBookingRequest;
import com.HTPj.htpj.dto.request.booking.RoomAvailabilityRequest;
import com.HTPj.htpj.dto.response.booking.CreateBookingResponse;
import com.HTPj.htpj.dto.response.booking.RoomAvailabilityResponse;

import java.util.List;

public interface BookingService {
    List<RoomAvailabilityResponse> checkAvailability(RoomAvailabilityRequest request);

    CreateBookingResponse createBooking(CreateBookingRequest request);
}
