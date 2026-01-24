package com.HTPj.htpj.controller;

import com.HTPj.htpj.dto.request.ApiResponse;
import com.HTPj.htpj.dto.request.roomtype.CreateRoomTypeRequest;
import com.HTPj.htpj.dto.response.roomtype.RoomTypeDetailResponse;
import com.HTPj.htpj.dto.response.roomtype.RoomTypeResponse;
import com.HTPj.htpj.service.RoomTypeService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/room-types")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RoomTypeController {

    RoomTypeService roomTypeService;

    @PostMapping
    ApiResponse<RoomTypeDetailResponse> create(@RequestBody CreateRoomTypeRequest request) {
        return ApiResponse.<RoomTypeDetailResponse>builder()
                .result(roomTypeService.createRoomType(request))
                .build();
    }

    @GetMapping
    ApiResponse<List<RoomTypeResponse>> getRoomTypesByHotelId(
            @RequestParam Integer hotelId
    ) {
        return ApiResponse.<List<RoomTypeResponse>>builder()
                .result(roomTypeService.getRoomTypesByHotelId(hotelId))
                .build();
    }

    @GetMapping("/{roomTypeId}")
    ApiResponse<RoomTypeDetailResponse> getRoomTypeDetail(
            @PathVariable Integer roomTypeId
    ) {
        return ApiResponse.<RoomTypeDetailResponse>builder()
                .result(roomTypeService.getRoomTypeDetail(roomTypeId))
                .build();
    }

    @DeleteMapping("/{roomTypeId}")
    ApiResponse<RoomTypeDetailResponse> deleteRoomType(
            @PathVariable Integer roomTypeId
    ) {
        return ApiResponse.<RoomTypeDetailResponse>builder()
                .result(roomTypeService.inactiveRoomType(roomTypeId))
                .build();
    }



}
