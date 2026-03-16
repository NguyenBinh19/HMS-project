package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.booking.CreateBookingRequest;
import com.HTPj.htpj.dto.request.booking.RoomAvailabilityRequest;
import com.HTPj.htpj.dto.request.booking.UpdateGuestRequest;
import com.HTPj.htpj.dto.response.booking.*;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.util.List;

public interface BookingService {
    List<RoomAvailabilityResponse> checkAvailability(RoomAvailabilityRequest request);

    CreateBookingResponse createBooking(CreateBookingRequest request);

    // UC-029: Xem lịch sử đặt phòng của agency user
    Page<BookingHistoryResponse> getBookingHistory(int page, int size);

    // UC-030: Xem chi tiết một booking
    BookingDetailResponse getBookingDetail(String bookingCode);

    //Uc79
    List<ListAllBookingsResponse> getAllBookings();

    //Uc28:
    BookingDetailResponse updateGuestInformation(UpdateGuestRequest request);
    List<ListAllBookingsResponse> getTodayCheckinBookings();

    List<ListAllBookingsResponse> getBookingsByCheckinDate(LocalDate date);


}
