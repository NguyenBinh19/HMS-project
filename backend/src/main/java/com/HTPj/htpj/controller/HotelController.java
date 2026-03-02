package com.HTPj.htpj.controller;

import com.HTPj.htpj.dto.request.ApiResponse;
import com.HTPj.htpj.dto.response.hotel.HotelDetailResponse;
import com.HTPj.htpj.dto.response.hotel.HotelResponse;
import com.HTPj.htpj.service.HotelService;
import com.HTPj.htpj.service.impl.HotelServiceImpl;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hotels")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class HotelController {

    HotelService hotelServiceImpl;

    @GetMapping
    public ApiResponse<List<HotelResponse>> getHotelsForView() {
        return ApiResponse.<List<HotelResponse>>builder()
                .result(hotelServiceImpl.getHotelsForView())
                .build();
    }

    @GetMapping("/{hotelId}")
    public ApiResponse<HotelDetailResponse> getHotelDetailForView(
            @PathVariable Integer hotelId
    ) {
        return ApiResponse.<HotelDetailResponse>builder()
                .result(hotelServiceImpl.getHotelDetailForView(hotelId))
                .build();
    }

    @GetMapping("/search")
    public ApiResponse<List<HotelDetailResponse>> searchHotels(
            @RequestParam String keyword
    ) {
        return ApiResponse.<List<HotelDetailResponse>>builder()
                .result(hotelServiceImpl.searchHotels(keyword))
                .build();
    }
}
