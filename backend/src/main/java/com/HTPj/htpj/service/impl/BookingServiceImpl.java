package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.booking.CreateBookingRequest;
import com.HTPj.htpj.dto.request.booking.RoomAvailabilityRequest;
import com.HTPj.htpj.dto.response.booking.CreateBookingResponse;
import com.HTPj.htpj.dto.response.booking.RoomAvailabilityResponse;
import com.HTPj.htpj.entity.*;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.mapper.BookingMapper;
import com.HTPj.htpj.mapper.RoomAvailabilityMapper;
import com.HTPj.htpj.repository.*;
import com.HTPj.htpj.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
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
    private final BookingRepository bookingRepository;
    private final BookingMapper bookingMapper;


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

    private BigDecimal calculateTotalPrice(RoomType roomType,LocalDate checkIn,LocalDate checkOut) {

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

    @Override
    public CreateBookingResponse createBooking(CreateBookingRequest request) {

        // LẤY USER TỪ JWT
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        Jwt jwt = (Jwt) authentication.getPrincipal();

        String userId = jwt.getSubject();

        RoomHold hold = roomHoldRepository.findByHoldCode(request.getHoldCode())
                .orElseThrow(() -> new AppException(ErrorCode.HOLD_NOT_FOUND));

        if (!"HOLDING".equalsIgnoreCase(hold.getStatus())) {
            throw new AppException(ErrorCode.HOLD_EXPIRED);
        }

        LocalDate checkIn = hold.getCheckInDate();
        LocalDate checkOut = hold.getCheckOutDate();

        int nights = (int) ChronoUnit.DAYS.between(checkIn, checkOut);

        Booking booking = Booking.builder()
                .bookingCode("BOOKING-" + UUID.randomUUID().toString().substring(0, 8))
                .hotelId(hold.getHotelId())
                .userId(userId)
//                .userId(request.getUserId())       // tam thoi lay request
                .agencyId(request.getAgencyId())
                .checkInDate(checkIn)
                .checkOutDate(checkOut)
                .nights(nights)
                .guestName(request.getGuestName())
                .guestPhone(request.getGuestPhone())
                .guestEmail(request.getGuestEmail())
                .notes(request.getNotes())
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus("unpaid")
                .bookingStatus("booked")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        BigDecimal bookingTotal = BigDecimal.ZERO;
        int totalRooms = 0;

        List<BookingDetail> bookingDetails = new ArrayList<>();

        for (RoomHoldDetail holdDetail : hold.getDetails()) {

            RoomType roomType = roomTypeRepository.findById(holdDetail.getRoomTypeId())
                    .orElseThrow(() -> new AppException(ErrorCode.ROOM_TYPE_NOT_FOUND));

            int quantity = holdDetail.getQuantity();

            BigDecimal pricePerStay = calculateTotalPrice(roomType, checkIn, checkOut);

            BigDecimal subtotal = pricePerStay;
            BigDecimal total = subtotal.multiply(BigDecimal.valueOf(quantity));

            bookingTotal = bookingTotal.add(total);
            totalRooms += quantity;

            BookingDetail detail = BookingDetail.builder()
                    .booking(booking)
                    .roomType(roomType)
                    .roomTitle(roomType.getRoomTitle())
                    .quantity(quantity)
                    .pricePerNight(roomType.getBasePrice())
                    .subtotalAmount(subtotal)   // giá 1 phòng
                    .totalAmount(total)         // tổng tiền hạng phòng
                    .checkInDate(checkIn)
                    .checkOutDate(checkOut)
                    .nights(nights)
                    .createdAt(LocalDateTime.now())
                    .roomCode(roomType.getRoomCode())
                    .bedType(roomType.getBedType())
                    .roomArea(roomType.getRoomArea())
                    .maxAdults(roomType.getMaxAdults())
                    .maxChildren(roomType.getMaxChildren())
                    .maxGuests(
                            (roomType.getMaxAdults() == null ? 0 : roomType.getMaxAdults()) +
                                    (roomType.getMaxChildren() == null ? 0 : roomType.getMaxChildren())
                    )
                    .amenities(roomType.getAmenities())
                    .build();

            bookingDetails.add(detail);
        }

        booking.setBookingDetails(bookingDetails);
        booking.setTotalRooms(totalRooms);
        booking.setTotalGuests(request.getTotalGuests());

        BigDecimal discount = request.getDiscountAmount() == null
                ? BigDecimal.ZERO
                : request.getDiscountAmount();

        booking.setTotalAmount(bookingTotal);
        booking.setDiscountAmount(discount);
        booking.setFinalAmount(bookingTotal.subtract(discount));

        Booking saved = bookingRepository.save(booking);

        hold.setStatus("BOOKED");
        roomHoldRepository.save(hold);

        return bookingMapper.toResponse(saved);
    }
}
