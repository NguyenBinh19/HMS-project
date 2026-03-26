package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.booking.CancelBookingRequest;
import com.HTPj.htpj.dto.request.booking.CheckinRequest;
import com.HTPj.htpj.dto.request.booking.CreateBookingRequest;
import com.HTPj.htpj.dto.request.booking.NoShowRequest;
import com.HTPj.htpj.dto.request.booking.RoomAvailabilityRequest;
import com.HTPj.htpj.dto.request.booking.UpdateGuestRequest;
import com.HTPj.htpj.dto.response.booking.*;
import com.HTPj.htpj.dto.request.promotions.CheckPromotionCodeRequest;
import com.HTPj.htpj.dto.response.booking.CreateBookingResponse;
import com.HTPj.htpj.dto.response.booking.ListAllBookingsResponse;
import com.HTPj.htpj.dto.response.booking.RoomAvailabilityResponse;
import com.HTPj.htpj.dto.response.promotions.ApplyPromotionResponse;
import com.HTPj.htpj.entity.*;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.mapper.BookingMapper;
import com.HTPj.htpj.mapper.RoomAvailabilityMapper;
import com.HTPj.htpj.repository.*;
import com.HTPj.htpj.service.BookingService;
import com.HTPj.htpj.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
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
    private final HotelRepository hotelRepository;
    private final BookingAddonServiceRepository bookingAddonServiceRepository;
    private final PromotionService promotionService;
    private final PromotionRepository promotionRepository;
    private final UserRepository userRepository;
    private final RoomAllotmentRepository roomAllotmentRepository;


    @Override
    public List<RoomAvailabilityResponse> checkAvailability(RoomAvailabilityRequest request) {

        List<RoomType> roomTypes =
                roomTypeRepository.findByHotel_HotelId(request.getHotelId());

        List<BookingDetail> bookingDetails =
                bookingDetailRepository.findOverlappingBookings(
                        request.getHotelId(),
                        request.getCheckIn(),
                        request.getCheckOut(),
                        List.of("BOOKED")
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
    @Transactional
    @Override
    public CreateBookingResponse createBooking(CreateBookingRequest request) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        Jwt jwt = (Jwt) authentication.getPrincipal();

        String userId = jwt.getClaim("userId");

        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Agency agency = user.getAgency();

        if (agency == null) {
            throw new AppException(ErrorCode.AGENCY_NOT_FOUND);
        }

        Long agencyId = agency.getAgencyId();

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
                .userId(user.getId())
                .agencyId(agencyId)
                .checkInDate(checkIn)
                .checkOutDate(checkOut)
                .nights(nights)
                .guestName(request.getGuestName())
                .guestPhone(request.getGuestPhone())
                .guestEmail(request.getGuestEmail())
                .notes(request.getNotes())
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus("unpaid")
                .bookingStatus("BOOKED")
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
        booking.setTotalAmount(bookingTotal);

        BigDecimal discountTotal = BigDecimal.ZERO;

        if (request.getPromotionCode() != null && !request.getPromotionCode().isBlank()) {

            CheckPromotionCodeRequest promoRequest =
                    CheckPromotionCodeRequest.builder()
                            .code(request.getPromotionCode())
                            .hotelId(hold.getHotelId())
                            .billAmount(bookingTotal)
                            .checkin(checkIn)
                            .checkout(checkOut)
                            .build();

            ApplyPromotionResponse promo =
                    promotionService.checkPromotionCode(promoRequest);

            booking.setPromotionCode(promo.getCode());
            booking.setDiscountVal(promo.getDiscountVal());
            booking.setTypeDiscount(promo.getTypeDiscount());

            Promotion promotionEntity = promotionRepository.findById(promo.getId())
                    .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_CODE_INVALID));

            booking.setPromotion(promotionEntity);

            if ("PERCENT".equalsIgnoreCase(promo.getTypeDiscount())) {

                BigDecimal percentAmount =
                        bookingTotal.multiply(promo.getDiscountVal())
                                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

                if (promo.getMaxDiscount() != null &&
                        percentAmount.compareTo(promo.getMaxDiscount()) >= 0) {

                    discountTotal = promo.getMaxDiscount();
                } else {
                    discountTotal = percentAmount;
                }

            } else if ("AMOUNT".equalsIgnoreCase(promo.getTypeDiscount())) {
                discountTotal = promo.getDiscountVal();
            }
        }
        if (discountTotal.compareTo(bookingTotal) > 0) {
            discountTotal = bookingTotal;
        }
        booking.setDiscountTotal(discountTotal);
        booking.setFinalAmount(bookingTotal.subtract(discountTotal));

        Booking saved = bookingRepository.save(booking);

        //count +1
        if (saved.getPromotion() != null) {
            promotionRepository.increaseUsedCount(saved.getPromotion().getId());
        }

        hold.setStatus("BOOKED");
        roomHoldRepository.save(hold);

        return bookingMapper.toResponse(saved);
    }

    // =========================================================================
    // UC-029: Lịch sử đặt phòng (phân trang)
    // =========================================================================
    @Override
    public Page<BookingHistoryResponse> getBookingHistory(int page, int size) {
        String userId = extractUserId();

        Users user = userRepository.findByUsername(userId)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        Page<Booking> bookingPage = bookingRepository.findHistoryByUserId(
                user.getId(), PageRequest.of(page, size));

        // Batch-fetch hotel names để tránh N+1 — 1 query duy nhất cho tất cả hotelId
        List<Integer> hotelIds = bookingPage.getContent().stream()
                .map(Booking::getHotelId)
                .distinct()
                .toList();

        Map<Integer, Hotel> hotelMap = hotelRepository.findAllById(hotelIds)
                .stream()
                .collect(Collectors.toMap(Hotel::getHotelId, h -> h));

        return bookingPage.map(booking -> {
            Hotel hotel = hotelMap.get(booking.getHotelId());
            return BookingHistoryResponse.builder()
                    .bookingId(booking.getBookingId())
                    .bookingCode(booking.getBookingCode())
                    .hotelId(booking.getHotelId())
                    .hotelName(hotel != null ? hotel.getHotelName() : null)
                    .checkInDate(booking.getCheckInDate())
                    .checkOutDate(booking.getCheckOutDate())
                    .nights(booking.getNights())
                    .totalRooms(booking.getTotalRooms())
                    .totalGuests(booking.getTotalGuests())
                    .finalAmount(booking.getFinalAmount())
                    .bookingStatus(booking.getBookingStatus())
                    .paymentStatus(booking.getPaymentStatus())
                    .guestName(booking.getGuestName())
                    .createdAt(booking.getCreatedAt())
                    .build();
        });
    }

    // =========================================================================
    // UC-030: Chi tiết booking — JOIN FETCH tránh N+1
    // =========================================================================
    @Override
    public BookingDetailResponse getBookingDetail(String bookingCode) {
        String userId = extractUserId();
        Users user = userRepository.findByUsername(userId)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));
        // Một query: load booking + tất cả bookingDetails (JOIN FETCH)
        Booking booking = bookingRepository.findDetailByBookingCodeAndUserId(bookingCode, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        Hotel hotel = hotelRepository.findById(booking.getHotelId()).orElse(null);

        // Một query: load addon services + tên dịch vụ (JOIN FETCH addonService)
        List<BookingAddonService> addonServices =
                bookingAddonServiceRepository.findByBookingIdWithService(booking.getBookingId());

        List<BookingDetailItemResponse> roomDetails = booking.getBookingDetails()
                .stream()
                .map(bd -> BookingDetailItemResponse.builder()
                        .bookingDetailId(bd.getBookingDetailId())
                        .roomTitle(bd.getRoomTitle())
                        .quantity(bd.getQuantity())
                        .roomCode(bd.getRoomCode())
                        .bedType(bd.getBedType())
                        .roomArea(bd.getRoomArea())
                        .maxAdults(bd.getMaxAdults())
                        .maxChildren(bd.getMaxChildren())
                        .maxGuests(bd.getMaxGuests())
                        .amenities(bd.getAmenities())
                        .pricePerNight(bd.getPricePerNight())
                        .subtotalAmount(bd.getSubtotalAmount())
                        .totalAmount(bd.getTotalAmount())
                        .nights(bd.getNights())
                        .build())
                .toList();

        List<BookingAddonServiceResponse> addonResponses = addonServices.stream()
                .map(bas -> BookingAddonServiceResponse.builder()
                        .id(bas.getId())
                        .serviceName(bas.getAddonService().getServiceName())
                        .serviceType(bas.getAddonService().getCategory())
                        .quantity(bas.getQuantity())
                        .unitPrice(bas.getUnitPrice())
                        .totalPrice(bas.getTotalPrice())
                        .serviceDate(bas.getServiceDate())
                        .flightNumber(bas.getFlightNumber())
                        .flightTime(bas.getFlightTime())
                        .specialNote(bas.getSpecialNote())
                        .build())
                .toList();

        return BookingDetailResponse.builder()
                .bookingId(booking.getBookingId())
                .bookingCode(booking.getBookingCode())
                .hotelId(booking.getHotelId())
                .hotelName(hotel != null ? hotel.getHotelName() : null)
                .hotelAddress(hotel != null ? hotel.getAddress() : null)
                .hotelStarRating(hotel != null ? hotel.getStarRating() : null)
                .checkInDate(booking.getCheckInDate())
                .checkOutDate(booking.getCheckOutDate())
                .nights(booking.getNights())
                .totalRooms(booking.getTotalRooms())
                .totalGuests(booking.getTotalGuests())
                .guestName(booking.getGuestName())
                .guestPhone(booking.getGuestPhone())
                .guestEmail(booking.getGuestEmail())
                .notes(booking.getNotes())
                .totalAmount(booking.getTotalAmount())
                .discountAmount(booking.getDiscountTotal())
                .finalAmount(booking.getFinalAmount())
                .paymentMethod(booking.getPaymentMethod())
                .paymentStatus(booking.getPaymentStatus())
                .bookingStatus(booking.getBookingStatus())
                .createdAt(booking.getCreatedAt())
                .hasFeedback(Boolean.TRUE.equals(booking.getHasFeedback()))
                .roomDetails(roomDetails)
                .addonServices(addonResponses)
                .build();
    }

    // =========================================================================
    // Helpers
    // =========================================================================
    private String extractUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Jwt jwt = (Jwt) auth.getPrincipal();
        return jwt.getSubject();
    }

    //UC79
    @Override
    public List<ListAllBookingsResponse> getAllBookings() {
        return bookingRepository.getAllBookingsSummary();
    }

    //UC28:
    @Override
    public BookingDetailResponse updateGuestInformation(UpdateGuestRequest request) {

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        LocalDate currentDate = LocalDate.now();

        if (!"BOOKED".equals(booking.getBookingStatus())
                || !currentDate.isBefore(booking.getCheckInDate())) {
            throw new AppException(ErrorCode.BOOKING_UPDATE_NOT_ALLOWED);
        }

        booking.setGuestName(request.getGuestName());
        booking.setGuestPhone(request.getGuestPhone());
        booking.setGuestEmail(request.getGuestEmail());
        booking.setNotes(request.getNotes());

        booking.setUpdatedAt(LocalDateTime.now());

        Booking savedBooking = bookingRepository.save(booking);

        return bookingMapper.toBookingDetailResponse(savedBooking);
    }

    //UC-050 - View Daily Arrival List
    @Override
    public List<ListAllBookingsResponse> getTodayCheckinBookings() {
        return bookingRepository.getTodayCheckinBookings();
    }

    @Override
    public List<ListAllBookingsResponse> getBookingsByCheckinDate(LocalDate date) {
        return bookingRepository.getBookingsByCheckinDate(date);
    }

    // =========================================================================
    // UC-051: View Daily Departure List
    // =========================================================================
    @Override
    public List<DepartureListResponse> getTodayDepartures() {
        Integer hotelId = extractHotelId();
        return bookingRepository.getTodayDeparturesByHotelId(hotelId);
    }

    @Override
    public List<DepartureListResponse> getDeparturesByDate(LocalDate date) {
        Integer hotelId = extractHotelId();
        return bookingRepository.getDeparturesByHotelIdAndDate(hotelId, date);
    }

    // UC-051: Perform checkout — update booking to COMPLETED
    @Transactional
    @Override
    public BookingDetailResponse performCheckout(String bookingCode) {
        Integer hotelId = extractHotelId();

        Booking booking = bookingRepository.findByBookingCodeAndHotelId(bookingCode, hotelId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        if ("COMPLETED".equalsIgnoreCase(booking.getBookingStatus())) {
            throw new AppException(ErrorCode.BOOKING_ALREADY_COMPLETED);
        }
        if (!"BOOKED".equalsIgnoreCase(booking.getBookingStatus())
                && !"CHECKED-IN".equalsIgnoreCase(booking.getBookingStatus())) {
            throw new AppException(ErrorCode.BOOKING_NOT_CHECKED_IN);
        }

        booking.setBookingStatus("COMPLETED");
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);

        return bookingMapper.toBookingDetailResponse(booking);
    }

    // UC-051: Express checkout — instant process, no bill check
    @Transactional
    @Override
    public BookingDetailResponse expressCheckout(String bookingCode) {
        return performCheckout(bookingCode);
    }

    private Integer extractHotelId() {
        String userId = extractUserId();
        Users user = userRepository.findByUsername(userId)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        Hotel hotel = user.getHotel();
        if (hotel == null) {
            throw new AppException(ErrorCode.HOTEL_NOT_FOUND);
        }
        return hotel.getHotelId();
    }

    // =========================================================================
    // UC-031: Cancel Booking Order
    // =========================================================================
    @Transactional
    @Override
    public CancelBookingResponse cancelBooking(CancelBookingRequest request) {
        Integer hotelId = extractHotelId();

        Booking booking = bookingRepository.findByBookingCodeAndHotelId(request.getBookingCode(), hotelId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        // Only BOOKED bookings can be cancelled
        String status = booking.getBookingStatus();
        if (!"CONFIRMED".equalsIgnoreCase(status) && !"BOOKED".equalsIgnoreCase(status)) {
            throw new AppException(ErrorCode.CANCEL_NOT_ALLOWED);
        }

        LocalDate today = LocalDate.now();

        // Cannot cancel after check-in date has passed
        if (today.isAfter(booking.getCheckInDate())) {
            throw new AppException(ErrorCode.CANCEL_PAST_CHECKIN);
        }

        // Calculate cancellation penalty:
        // - Free cancellation if cancelled 3+ days before check-in
        // - 1st night charge as penalty if cancelled within 3 days of check-in
        long daysBeforeCheckin = ChronoUnit.DAYS.between(today, booking.getCheckInDate());
        BigDecimal penalty = BigDecimal.ZERO;

        if (daysBeforeCheckin < 3) {
            // Penalty = first night's price (finalAmount / nights)
            if (booking.getNights() != null && booking.getNights() > 0) {
                penalty = booking.getFinalAmount()
                        .divide(BigDecimal.valueOf(booking.getNights()), 2, RoundingMode.HALF_UP);
            }
        }

        BigDecimal refund = booking.getFinalAmount().subtract(penalty);
        if (refund.compareTo(BigDecimal.ZERO) < 0) {
            refund = BigDecimal.ZERO;
        }

        // Release inventory (decrement soldCount in allotments)
        releaseInventory(booking);

        booking.setBookingStatus("CANCELLED");
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);

        return CancelBookingResponse.builder()
                .bookingCode(booking.getBookingCode())
                .bookingStatus("CANCELLED")
                .cancellationPenalty(penalty)
                .refundAmount(refund)
                .reason(request.getReason())
                .cancelledAt(LocalDateTime.now())
                .build();
    }

    // =========================================================================
    // UC-052: Check-in Guest
    // =========================================================================
    @Transactional
    @Override
    public BookingDetailResponse checkinGuest(CheckinRequest request) {
        Integer hotelId = extractHotelId();

        Booking booking = bookingRepository.findByBookingCodeAndHotelId(request.getBookingCode(), hotelId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        if ("CHECKED-IN".equalsIgnoreCase(booking.getBookingStatus())) {
            throw new AppException(ErrorCode.ALREADY_CHECKED_IN);
        }

        if (!"BOOKED".equalsIgnoreCase(booking.getBookingStatus())) {
            throw new AppException(ErrorCode.CHECKIN_NOT_ALLOWED);
        }

        // Check-in is only allowed on the scheduled check-in date
        LocalDate today = LocalDate.now();
        if (!today.equals(booking.getCheckInDate())) {
            throw new AppException(ErrorCode.CHECKIN_DATE_MISMATCH);
        }

        booking.setBookingStatus("CHECKED-IN");
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);

        return bookingMapper.toBookingDetailResponse(booking);
    }

    // UC-052: Check-out Guest (from IN_HOUSE to COMPLETED)
    @Transactional
    @Override
    public BookingDetailResponse checkoutGuest(String bookingCode) {
        Integer hotelId = extractHotelId();

        Booking booking = bookingRepository.findByBookingCodeAndHotelId(bookingCode, hotelId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        if ("COMPLETED".equalsIgnoreCase(booking.getBookingStatus())) {
            throw new AppException(ErrorCode.BOOKING_ALREADY_COMPLETED);
        }
        if (!"CHECKED_IN".equalsIgnoreCase(booking.getBookingStatus())) {
            throw new AppException(ErrorCode.BOOKING_NOT_CHECKED_IN);
        }

        booking.setBookingStatus("COMPLETED");
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);

        return bookingMapper.toBookingDetailResponse(booking);
    }

    // =========================================================================
    // UC-053: Report No-show
    // =========================================================================
    @Transactional
    @Override
    public NoShowResponse reportNoShow(NoShowRequest request) {
        Integer hotelId = extractHotelId();

        Booking booking = bookingRepository.findByBookingCodeAndHotelId(request.getBookingCode(), hotelId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        if (!"BOOKED".equalsIgnoreCase(booking.getBookingStatus())) {
            throw new AppException(ErrorCode.NOSHOW_NOT_ALLOWED);
        }

        // Cannot report no-show before check-in date
        LocalDate today = LocalDate.now();
        if (today.isBefore(booking.getCheckInDate())) {
            throw new AppException(ErrorCode.NOSHOW_BEFORE_CHECKIN);
        }

        // No-show penalty = first night charge
        BigDecimal penalty = BigDecimal.ZERO;
        if (booking.getNights() != null && booking.getNights() > 0) {
            penalty = booking.getFinalAmount()
                    .divide(BigDecimal.valueOf(booking.getNights()), 2, RoundingMode.HALF_UP);
        }

        // Release inventory for remaining nights (all nights since guest never arrived)
        releaseInventory(booking);

        booking.setBookingStatus("NO_SHOW");
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);

        return NoShowResponse.builder()
                .bookingCode(booking.getBookingCode())
                .bookingStatus("NO_SHOW")
                .penaltyAmount(penalty)
                .reason(request.getReason())
                .reportedAt(LocalDateTime.now())
                .build();
    }

    // =========================================================================
    // Inventory Helper: release soldCount for each booking detail's date range
    // =========================================================================
    private void releaseInventory(Booking booking) {
        if (booking.getBookingDetails() == null) return;

        for (BookingDetail detail : booking.getBookingDetails()) {
            Integer roomTypeId = detail.getRoomType() != null
                    ? detail.getRoomType().getRoomTypeId()
                    : null;
            if (roomTypeId == null) continue;

            LocalDate start = detail.getCheckInDate();
            LocalDate end = detail.getCheckOutDate();

            for (LocalDate date = start; date.isBefore(end); date = date.plusDays(1)) {
                roomAllotmentRepository.findByRoomTypeIdAndAllotmentDate(roomTypeId, date)
                        .ifPresent(allotment -> {
                            int newSold = Math.max(0,
                                    (allotment.getSoldCount() != null ? allotment.getSoldCount() : 0)
                                            - detail.getQuantity());
                            allotment.setSoldCount(newSold);
                            roomAllotmentRepository.save(allotment);
                        });
            }
        }
    }
}
