package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.booking.RoomAvailabilityRequest;
import com.HTPj.htpj.dto.response.booking.RoomAvailabilityResponse;
import com.HTPj.htpj.entity.BookingDetail;
import com.HTPj.htpj.entity.RoomHold;
import com.HTPj.htpj.entity.RoomType;
import com.HTPj.htpj.mapper.RoomAvailabilityMapper;
import com.HTPj.htpj.repository.BookingDetailRepository;
import com.HTPj.htpj.repository.RoomHoldRepository;
import com.HTPj.htpj.repository.RoomTypeRepository;
import com.HTPj.htpj.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {
    private final RoomTypeRepository roomTypeRepository;
    private final BookingDetailRepository bookingDetailRepository;
    private final RoomAvailabilityMapper roomAvailabilityMapper;
    private final RoomHoldRepository roomHoldRepository;


    @Override
    public List<RoomAvailabilityResponse> checkAvailability(RoomAvailabilityRequest request) {

        List<RoomType> roomTypes =
                roomTypeRepository.findByHotel_HotelId(request.getHotelId());

        List<BookingDetail> bookingDetails =
                bookingDetailRepository.findOverlappingBookings(
                        request.getHotelId(),
                        request.getCheckIn(),
                        request.getCheckOut(),
                        List.of("CONFIRMED", "PAID")
                );

        Map<Integer, Integer> bookedQuantityMap =
                bookingDetails.stream()
                        .collect(Collectors.groupingBy(
                                bd -> bd.getRoomType().getRoomTypeId(),
                                Collectors.summingInt(BookingDetail::getQuantity)
                        ));

        List<RoomHold> roomHolds =
                roomHoldRepository.findActiveOverlappingHolds(
                        request.getHotelId(),
                        request.getCheckIn(),
                        request.getCheckOut(),
                        LocalDateTime.now()
                );
        Map<Integer, Integer> holdingQuantityMap =
                roomHolds.stream()
                        .collect(Collectors.groupingBy(
                                RoomHold::getRoomTypeId,
                                Collectors.summingInt(RoomHold::getQuantity)
                        ));

        List<RoomAvailabilityResponse> responses = new ArrayList<>();

        for (RoomType rt : roomTypes) {

            if (!"ACTIVE".equalsIgnoreCase(rt.getRoomStatus())) {
                responses.add(roomAvailabilityMapper.toInactive(rt));
                continue;
            }

            int bookedQuantity =
                    bookedQuantityMap.getOrDefault(rt.getRoomTypeId(), 0);

            int holdingQuantity =
                    holdingQuantityMap.getOrDefault(rt.getRoomTypeId(), 0);

            int availableQuantity =
                    rt.getTotalRooms() - bookedQuantity - holdingQuantity;

            if (availableQuantity <= 0) {
                responses.add(
                        RoomAvailabilityResponse.builder()
                                .roomTypeId(rt.getRoomTypeId())
                                .roomTitle(rt.getRoomTitle())
                                .price(rt.getBasePrice())
                                .quantityAvaiable(0)
                                .status("sold_out")
                                .build()
                );
            } else {
                responses.add(roomAvailabilityMapper.toActive(rt, availableQuantity));
            }
        }
        System.out.println("DB HOLDS SIZE = " + roomHolds.size());
        System.out.println("checkIn  = " + request.getCheckIn());
        System.out.println("checkOut = " + request.getCheckOut());


        return responses;
    }
}
