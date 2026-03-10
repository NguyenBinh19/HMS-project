package com.HTPj.htpj.controller;

import com.HTPj.htpj.dto.request.ApiResponse;
import com.HTPj.htpj.dto.request.booking.CreateBookingRequest;
import com.HTPj.htpj.dto.request.booking.RoomAvailabilityRequest;
import com.HTPj.htpj.dto.request.roomHold.CreateRoomHoldRequest;
import com.HTPj.htpj.dto.request.roomHold.ExtendRoomHoldRequest;
import com.HTPj.htpj.dto.response.booking.BookingDetailResponse;
import com.HTPj.htpj.dto.response.booking.BookingHistoryResponse;
import com.HTPj.htpj.dto.response.booking.CreateBookingResponse;
import com.HTPj.htpj.dto.response.booking.ListAllBookingsResponse;
import com.HTPj.htpj.dto.response.booking.RoomAvailabilityResponse;
import com.HTPj.htpj.dto.response.roomHold.RoomHoldResponse;
import com.HTPj.htpj.service.BookingService;
import com.HTPj.htpj.service.RoomHoldService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/booking")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class BookingController {
    BookingService bookingService;
    RoomHoldService roomHoldService;

    //Check room avai for booking
    @PostMapping("/room_avai")
    ApiResponse<List<RoomAvailabilityResponse>> checkAvailability(
            @RequestBody RoomAvailabilityRequest request
    ) {
        return ApiResponse.<List<RoomAvailabilityResponse>>builder()
                .result(bookingService.checkAvailability(request))
                .build();
    }

    //hold room
    @PostMapping("/room_holds")
    public ApiResponse<RoomHoldResponse> createHold(
            @RequestBody CreateRoomHoldRequest request
    ) {
        return ApiResponse.<RoomHoldResponse>builder()
                .result(roomHoldService.createHold(request))
                .build();
    }

    @PostMapping("/room_holds/extend")
    public ApiResponse<RoomHoldResponse> extendHold(
            @RequestBody ExtendRoomHoldRequest request
    ) {
        return ApiResponse.<RoomHoldResponse>builder()
                .result(roomHoldService.extendHold(request))
                .build();
    }

    //booking
    @PostMapping("/create")
    ApiResponse<CreateBookingResponse> createBooking(
            @RequestBody CreateBookingRequest request
    ) {
        return ApiResponse.<CreateBookingResponse>builder()
                .result(bookingService.createBooking(request))
                .build();
    }

    //UC79
    @GetMapping("/listAll")
    ApiResponse<List<ListAllBookingsResponse>> getAllBookings() {
        return ApiResponse.<List<ListAllBookingsResponse>>builder()
                .result(bookingService.getAllBookings())
                .build();
    }

    // UC-029: Lịch sử đặt phòng (phân trang)
    @GetMapping("/history")
    ApiResponse<Page<BookingHistoryResponse>> getBookingHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.<Page<BookingHistoryResponse>>builder()
                .result(bookingService.getBookingHistory(page, size))
                .build();
    }

    // UC-030: Chi tiết booking theo booking code
    @GetMapping("/detail/{bookingCode}")
    ApiResponse<BookingDetailResponse> getBookingDetail(
            @PathVariable String bookingCode
    ) {
        return ApiResponse.<BookingDetailResponse>builder()
                .result(bookingService.getBookingDetail(bookingCode))
                .build();
    }

}
