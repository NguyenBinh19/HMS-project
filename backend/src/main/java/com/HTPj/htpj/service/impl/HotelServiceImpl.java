package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.response.hotel.HotelDetailResponse;
import com.HTPj.htpj.dto.response.hotel.HotelResponse;
import com.HTPj.htpj.dto.response.hotel.HotelSearchProjection;
import com.HTPj.htpj.entity.*;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.mapper.HotelMapper;
import com.HTPj.htpj.repository.*;
import com.HTPj.htpj.service.HotelService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class HotelServiceImpl implements HotelService {

    HotelRepository hotelRepository;
    HotelImageRepository hotelImageRepository;
    HotelReviewRepository hotelReviewRepository;
    HotelMapper hotelMapper;
    RoomTypeRepository roomTypeRepository;
    BookingDetailRepository bookingDetailRepository;
    RoomHoldRepository roomHoldRepository;

    public List<HotelResponse> getHotelsForView() {

        List<Hotel> hotels = hotelRepository.findByStatus("ACTIVE");

        return hotels.stream().map(hotel -> {

            // cover image
            String coverImage = hotelImageRepository
                    .findByHotelHotelIdAndIsCoverTrue(hotel.getHotelId())
                    .stream()
                    .findFirst()
                    .map(HotelImage::getImageUrl)
                    .orElse(null);

            // rating
            Double avgRating = hotelReviewRepository.getAvgRating(hotel.getHotelId());
            Integer totalReviews = hotelReviewRepository.countByHotelId(hotel.getHotelId());

            return HotelResponse.builder()
                    .hotelId(hotel.getHotelId())
                    .hotelName(hotel.getHotelName())
                    .city(hotel.getCity())
                    .country(hotel.getCountry())
                    .starRating(hotel.getStarRating())
                    .coverImage(coverImage)
                    .avgRating(avgRating != null ? avgRating : 0.0)
                    .totalReviews(totalReviews)
                    .build();

        }).toList();
    }

    public HotelDetailResponse getHotelDetailForView(Integer hotelId) {

        Hotel hotel = hotelRepository
                .findByHotelIdAndStatus(hotelId, "ACTIVE")
                .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));

        List<String> images = hotelImageRepository
                .findByHotelHotelIdOrderBySortOrderAsc(hotelId)
                .stream()
                .map(HotelImage::getImageUrl)
                .toList();

        Double avgRating = hotelReviewRepository.getAvgRating(hotelId);
        Integer totalReviews = hotelReviewRepository.countByHotelId(hotelId);

        return HotelDetailResponse.builder()
                .hotelId(hotel.getHotelId())
                .hotelName(hotel.getHotelName())
                .address(hotel.getAddress())
                .city(hotel.getCity())
                .country(hotel.getCountry())
                .phone(hotel.getPhone())
                .description(hotel.getDescription())
                .starRating(hotel.getStarRating())
                .images(images)
                .amenities(parseAmenities(hotel.getAmenities()))
                .avgRating(avgRating != null ? avgRating : 0.0)
                .totalReviews(totalReviews)
                .build();
    }
    public List<HotelDetailResponse> searchHotels(String keyword, LocalDate checkIn, LocalDate checkOut, Integer rooms) {

        List<HotelSearchProjection> hotels =
                hotelRepository.searchHotels(keyword);

        if (hotels.isEmpty()) {
            return List.of();
        }

        List<Integer> hotelIds = hotels.stream()
                .map(HotelSearchProjection::getHotelId)
                .toList();

        List<HotelImage> images =
                hotelImageRepository.findByHotelHotelIdInOrderBySortOrderAsc(hotelIds);

        Map<Integer, List<String>> imageMap = images.stream()
                .collect(Collectors.groupingBy(
                        img -> img.getHotel().getHotelId(),
                        Collectors.mapping(HotelImage::getImageUrl, Collectors.toList())
                ));

        boolean filterByAvailability = checkIn != null && checkOut != null;
        int requiredRooms = rooms != null && rooms > 0 ? rooms : 1;

        // Tính availability nếu có ngày
        Map<Integer, BigDecimal> minPriceMap = new HashMap<>();
        Map<Integer, Integer> availableRoomMap = new HashMap<>();

        if (filterByAvailability) {
            List<RoomType> allRoomTypes = roomTypeRepository.findByHotel_HotelIdIn(hotelIds);

            // Booked quantities per roomType
            List<BookingDetail> overlappingBookings =
                    bookingDetailRepository.findOverlappingBookingsForHotels(
                            hotelIds, checkIn, checkOut, List.of("CONFIRMED", "PAID", "booked"));

            Map<Integer, Integer> bookedMap = overlappingBookings.stream()
                    .collect(Collectors.groupingBy(
                            bd -> bd.getRoomType().getRoomTypeId(),
                            Collectors.summingInt(BookingDetail::getQuantity)));

            // Hold quantities per roomType
            List<RoomHoldDetail> overlappingHolds =
                    roomHoldRepository.findActiveOverlappingHoldDetailsForHotels(
                            hotelIds, checkIn, checkOut);

            Map<Integer, Integer> holdMap = overlappingHolds.stream()
                    .collect(Collectors.groupingBy(
                            RoomHoldDetail::getRoomTypeId,
                            Collectors.summingInt(RoomHoldDetail::getQuantity)));

            // Group room types by hotel
            Map<Integer, List<RoomType>> roomTypesByHotel = allRoomTypes.stream()
                    .filter(rt -> "ACTIVE".equalsIgnoreCase(rt.getRoomStatus()))
                    .collect(Collectors.groupingBy(rt -> rt.getHotel().getHotelId()));

            for (Integer hotelId : hotelIds) {
                List<RoomType> rts = roomTypesByHotel.getOrDefault(hotelId, List.of());
                int totalAvailable = 0;
                BigDecimal minPrice = null;

                for (RoomType rt : rts) {
                    int booked = bookedMap.getOrDefault(rt.getRoomTypeId(), 0);
                    int held = holdMap.getOrDefault(rt.getRoomTypeId(), 0);
                    int available = rt.getTotalRooms() - booked - held;

                    if (available > 0) {
                        totalAvailable += available;
                        if (minPrice == null || rt.getBasePrice().compareTo(minPrice) < 0) {
                            minPrice = rt.getBasePrice();
                        }
                    }
                }

                availableRoomMap.put(hotelId, totalAvailable);
                if (minPrice != null) {
                    minPriceMap.put(hotelId, minPrice);
                }
            }
        }

        return hotels.stream()
                .filter(h -> {
                    if (!filterByAvailability) return true;
                    int available = availableRoomMap.getOrDefault(h.getHotelId(), 0);
                    return available >= requiredRooms;
                })
                .map(h ->
                        HotelDetailResponse.builder()
                                .hotelId(h.getHotelId())
                                .hotelName(h.getHotelName())
                                .address(h.getAddress())
                                .city(h.getCity())
                                .country(h.getCountry())
                                .phone(h.getPhone())
                                .description(h.getDescription())
                                .starRating(h.getStarRating())
                                .images(imageMap.getOrDefault(h.getHotelId(), List.of()))
                                .amenities(parseAmenities(h.getAmenities()))
                                .avgRating(h.getAvgRating())
                                .totalReviews(h.getTotalReviews())
                                .minPrice(minPriceMap.get(h.getHotelId()))
                                .totalAvailableRooms(availableRoomMap.get(h.getHotelId()))
                                .build()
                ).toList();
    }
    private List<String> parseAmenities(String amenitiesJson) {
        if (amenitiesJson == null || amenitiesJson.isBlank()) {
            return List.of();
        }

        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(
                    amenitiesJson,
                    new TypeReference<List<String>>() {}
            );
        } catch (Exception e) {
            return List.of();
        }
    }


}
