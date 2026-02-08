package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.booking.RoomAvailabilityRequest;
import com.HTPj.htpj.dto.response.booking.RoomAvailabilityResponse;

import java.util.List;

public interface BookingService {
    List<RoomAvailabilityResponse> checkAvailability(RoomAvailabilityRequest request);
}
