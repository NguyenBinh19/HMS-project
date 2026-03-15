package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.hotel.UpdateHotelRequest;
import com.HTPj.htpj.dto.response.hotel.*;
import com.HTPj.htpj.dto.response.kyc.VerificationInfoResponse;
import com.HTPj.htpj.entity.*;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.mapper.HotelMapper;
import com.HTPj.htpj.repository.*;
import com.HTPj.htpj.service.HotelService;
import com.HTPj.htpj.service.S3Service;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.BeanUtils;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
    PartnerVerificationRepository partnerVerificationRepository;
    S3Service s3Service;
    UserRepository userRepository;

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
                    .email(hotel.getEmail())
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
                .email(hotel.getEmail())
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

    @Override
    public List<HotelListResponse> getAllHotels() {

        List<Hotel> hotels = hotelRepository.findAll();

        return hotels.stream()
                .map(hotelMapper::toHotelListResponse)
                .toList();
    }

    @Override
    public HotelDetailListResponse getHotelDetail(Integer hotelId) {

        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));

        PartnerVerification verification =
                partnerVerificationRepository
                        .findByHotelOrderByVersionDesc(hotelId)
                        .get(0);

        HotelDetailListResponse response =
                hotelMapper.toHotelDetailListResponse(hotel);

        VerificationInfoResponse verificationInfo =
                hotelMapper.toVerificationInfoResponse(verification);

        response.setVerification(verificationInfo);

        List<HotelImageResponse> images = hotelImageRepository
                .findByHotelHotelIdOrderBySortOrderAsc(hotelId)
                .stream()
                .map(img -> HotelImageResponse.builder()
                        .imageId(img.getImageId()) // Lấy ID thật từ DB
                        .imageUrl(img.getImageUrl())
                        .build())
                .toList();

        Double avgRating = hotelReviewRepository.getAvgRating(hotelId);
        Integer totalReviews = hotelReviewRepository.countByHotelId(hotelId);

        response.setImages(images);
        response.setAmenitiesList(parseAmenities(hotel.getAmenities()));
        response.setAvgRating(avgRating != null ? avgRating : 0.0);
        response.setTotalReviews(totalReviews);

        return response;
    }


    public HotelDetailListResponse getHotelDetail() {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        Jwt jwt = (Jwt) authentication.getPrincipal();

        String userId = jwt.getClaim("userId");

        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Hotel hotel = user.getHotel();

        if (hotel == null) {
            throw new AppException(ErrorCode.HOTEL_NOT_FOUND);
        }
        Integer hotelId = hotel.getHotelId();

        PartnerVerification verification =
                partnerVerificationRepository
                        .findByHotelOrderByVersionDesc(hotelId)
                        .get(0);

        HotelDetailListResponse response =
                hotelMapper.toHotelDetailListResponse(hotel);

        VerificationInfoResponse verificationInfo =
                hotelMapper.toVerificationInfoResponse(verification);

        response.setVerification(verificationInfo);

        List<HotelImageResponse> images = hotelImageRepository
                .findByHotelHotelIdOrderBySortOrderAsc(hotelId)
                .stream()
                .map(img -> HotelImageResponse.builder()
                        .imageId(img.getImageId()) // Lấy ID thật từ DB
                        .imageUrl(img.getImageUrl())
                        .build())
                .toList();

        Double avgRating = hotelReviewRepository.getAvgRating(hotelId);
        Integer totalReviews = hotelReviewRepository.countByHotelId(hotelId);

        response.setImages(images);
        response.setAmenitiesList(parseAmenities(hotel.getAmenities()));
        response.setAvgRating(avgRating != null ? avgRating : 0.0);
        response.setTotalReviews(totalReviews);

        return response;
    }


    @Override
    @Transactional
    public HotelDetailListResponse updateHotel(UpdateHotelRequest request, MultipartFile[] newImages
    ) {
        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        Jwt jwt = (Jwt) authentication.getPrincipal();

        String userId = jwt.getClaim("userId");

        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Hotel hotel = user.getHotel();

        if (hotel == null) {
            throw new AppException(ErrorCode.HOTEL_NOT_FOUND);
        }
        Integer hotelId = hotel.getHotelId();

        // update basic fields
        hotel.setHotelName(request.getHotelName());
        hotel.setAddress(request.getAddress());
        hotel.setCity(request.getCity());
        hotel.setCountry(request.getCountry());
        hotel.setPhone(request.getPhone());
        hotel.setDescription(request.getDescription());
        hotel.setEmail(request.getEmail());

        // amenities -> json
        try {
            ObjectMapper mapper = new ObjectMapper();
            hotel.setAmenities(mapper.writeValueAsString(request.getAmenitiesList()));
        } catch (Exception e) {
            hotel.setAmenities("[]");
        }

        hotel.setUpdatedAt(LocalDateTime.now());

        hotelRepository.save(hotel);

    /*
     DELETE IMAGES
     */
        if (request.getDeleteImageIds() != null && !request.getDeleteImageIds().isEmpty()) {

            List<HotelImage> imagesToDelete =
                    hotelImageRepository.findAllById(request.getDeleteImageIds());

            for (HotelImage image : imagesToDelete) {

                String imageUrl = image.getImageUrl();

                // extract key from url
                String key = imageUrl.substring(imageUrl.indexOf(".com/") + 5);

                s3Service.deleteFile(key);
            }

            hotelImageRepository.deleteByImageIdIn(request.getDeleteImageIds());
        }

    /*
     UPLOAD NEW IMAGES
     */
        if (newImages != null && newImages.length > 0) {

            int currentSize = hotelImageRepository
                    .findByHotelHotelIdOrderBySortOrderAsc(hotelId)
                    .size();

            for (int i = 0; i < newImages.length; i++) {

                MultipartFile file = newImages[i];

                String key = "hotels/" + hotelId + "/" +
                        UUID.randomUUID() + "-" + file.getOriginalFilename();

                try {
                    s3Service.uploadFile(file, key);
                } catch (IOException e) {
                    throw new RuntimeException("Upload image failed");
                }

                String url = s3Service.getFileUrl(key);

                HotelImage image = new HotelImage();
                image.setHotel(hotel);
                image.setImageUrl(url);
                image.setIsCover(false);
                image.setSortOrder(currentSize + i + 1);
                image.setCreatedAt(LocalDateTime.now());

                hotelImageRepository.save(image);
            }
        }

    /*
     UPDATE COVER IMAGE
     */
        if (request.getCoverImageId() != null) {

            List<HotelImage> images =
                    hotelImageRepository.findByHotelHotelIdOrderBySortOrderAsc(hotelId);

            for (HotelImage img : images) {

                if (img.getImageId().equals(request.getCoverImageId())) {
                    img.setIsCover(true);
                } else {
                    img.setIsCover(false);
                }
            }

            hotelImageRepository.saveAll(images);
        }

        return getHotelDetail(hotelId);
    }


}
