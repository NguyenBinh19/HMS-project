package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.response.hotel.HotelDetailResponse;
import com.HTPj.htpj.dto.response.hotel.HotelResponse;
import com.HTPj.htpj.entity.Hotel;
import com.HTPj.htpj.entity.HotelImage;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.mapper.HotelMapper;
import com.HTPj.htpj.repository.HotelImageRepository;
import com.HTPj.htpj.repository.HotelRepository;
import com.HTPj.htpj.repository.HotelReviewRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class HotelService {

    HotelRepository hotelRepository;
    HotelImageRepository hotelImageRepository;
    HotelReviewRepository hotelReviewRepository;
    HotelMapper hotelMapper;

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
            // fallback an toàn, không làm sập API view
            return List.of();
        }
    }


}
