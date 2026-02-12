package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.booking.RoomAvailabilityRequest;
import com.HTPj.htpj.dto.response.booking.RoomAvailabilityResponse;
import com.HTPj.htpj.entity.*;
import com.HTPj.htpj.mapper.RoomAvailabilityMapper;
import com.HTPj.htpj.repository.BookingDetailRepository;
import com.HTPj.htpj.repository.RoomHoldRepository;
import com.HTPj.htpj.repository.RoomPricingRuleRepository;
import com.HTPj.htpj.repository.RoomTypeRepository;
import com.HTPj.htpj.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {
    private final RoomTypeRepository roomTypeRepository;
    private final BookingDetailRepository bookingDetailRepository;
    private final RoomAvailabilityMapper roomAvailabilityMapper;
    private final RoomHoldRepository roomHoldRepository;
    private final RoomPricingRuleRepository roomPricingRuleRepository;


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
        List<RoomHoldDetail> holdDetails =
                roomHoldRepository.findActiveOverlappingHoldDetails(
                        request.getHotelId(),
                        request.getCheckIn(),
                        request.getCheckOut()
                );

        Map<Integer, Integer> holdingQuantityMap =
                holdDetails.stream()
                        .collect(Collectors.groupingBy(
                                RoomHoldDetail::getRoomTypeId,
                                Collectors.summingInt(RoomHoldDetail::getQuantity)
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

            BigDecimal calculatedPrice = calculateTotalPrice(
                    rt,
                    request.getCheckIn(),
                    request.getCheckOut()
            );

            if (availableQuantity <= 0) {
                responses.add(
                        RoomAvailabilityResponse.builder()
                                .roomTypeId(rt.getRoomTypeId())
                                .roomTitle(rt.getRoomTitle())
                                .price(calculatedPrice)
                                .quantityAvaiable(0)
                                .status("sold_out")
                                .build()
                );
            } else {
                responses.add(roomAvailabilityMapper.toActive(rt, availableQuantity, calculatedPrice));
            }
        }

        return responses;
    }

    private BigDecimal calculateTotalPrice(RoomType roomType,
                                           LocalDate checkIn,
                                           LocalDate checkOut) {

        BigDecimal basePrice = roomType.getBasePrice();

        List<RoomPricingRule> rules =
                roomPricingRuleRepository
                        .findByRoomTypeIdAndIsActiveTrue(roomType.getRoomTypeId());

        BigDecimal totalPrice = BigDecimal.ZERO;

        for (LocalDate date = checkIn;
             date.isBefore(checkOut);
             date = date.plusDays(1)) {

            final LocalDate pricingDate = date;
            final String dayOfWeek = pricingDate.getDayOfWeek().name().toLowerCase();

            Optional<RoomPricingRule> selectedRule = rules.stream()
                    .filter(rule -> {

                        boolean matchDateRange = false;
                        boolean matchDayOfWeek = false;

                        if (rule.getStartDate() != null && rule.getEndDate() != null) {
                            matchDateRange =
                                    (!pricingDate.isBefore(rule.getStartDate()) &&
                                            !pricingDate.isAfter(rule.getEndDate()));
                        }

                        if (rule.getDayOfWeek() != null) {
                            matchDayOfWeek = Arrays.stream(rule.getDayOfWeek().split(","))
                                    .map(String::trim)
                                    .anyMatch(d -> d.equalsIgnoreCase(dayOfWeek));

                        }

                        return matchDateRange || matchDayOfWeek;
                    })
                    .min(Comparator.comparing(RoomPricingRule::getPriority));

            BigDecimal dailyPrice = basePrice;

            if (selectedRule.isPresent()) {

                RoomPricingRule rule = selectedRule.get();

                if (rule.getAdjustmentValue() != null &&
                        rule.getAdjustmentType() != null) {

                    if ("percent".equalsIgnoreCase(rule.getAdjustmentType())) {

                        BigDecimal percentAmount = basePrice
                                .multiply(rule.getAdjustmentValue())
                                .divide(BigDecimal.valueOf(100));

                        dailyPrice = dailyPrice.add(percentAmount);
                    }

                    if ("fixed".equalsIgnoreCase(rule.getAdjustmentType())) {
                        dailyPrice = dailyPrice.add(rule.getAdjustmentValue());
                    }
                }
            }

            totalPrice = totalPrice.add(dailyPrice);
        }

        return totalPrice;
    }


}
