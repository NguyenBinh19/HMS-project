package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.roomtype.CreateRoomTypeRequest;
import com.HTPj.htpj.dto.request.roomtype.UpdateRoomTypeRequest;
import com.HTPj.htpj.dto.response.roomtype.RoomTypeDetailResponse;
import com.HTPj.htpj.dto.response.roomtype.RoomTypeListDetailResponse;
import com.HTPj.htpj.dto.response.roomtype.RoomTypeResponse;
import com.HTPj.htpj.entity.Hotel;
import com.HTPj.htpj.entity.RoomType;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.mapper.RoomTypeMapper;
import com.HTPj.htpj.repository.HotelRepository;
import com.HTPj.htpj.repository.RoomTypeRepository;
import com.HTPj.htpj.service.RoomTypeService;
import com.fasterxml.jackson.core.type.TypeReference;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomTypeServiceImpl implements RoomTypeService {

    private final RoomTypeRepository roomTypeRepository;
    private final HotelRepository hotelRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();


    @Override
    public RoomTypeDetailResponse createRoomType(CreateRoomTypeRequest request) {
        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));

        if (roomTypeRepository.existsByRoomCode(request.getRoomCode())) {
            throw new AppException(ErrorCode.ROOM_TYPE_EXISTED);
        }

        String amenities = null;
        try {
            if (request.getAmenities() != null) {
                amenities = objectMapper.writeValueAsString(request.getAmenities());
            }
        } catch (Exception e) {
            throw new RuntimeException("Invalid amenities format");
        }


        RoomType roomType = RoomType.builder()
                .hotel(hotel)
                .roomCode(request.getRoomCode())
                .roomTitle(request.getRoomTitle())
                .description(request.getDescription())
                .basePrice(request.getBasePrice())
                .maxAdults(request.getMaxAdults())
                .maxChildren(request.getMaxChildren())
                .roomArea(request.getRoomArea())
                .bedType(request.getBedType())
                .totalRooms(request.getTotalRooms())
                .amenities(amenities)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .roomStatus("inactive")
                .build();

        RoomType room = roomTypeRepository.save(roomType);
        List<String> amenitiesList = parseAmenities(room.getAmenities());

        return RoomTypeMapper.toDetailResponse(room, amenitiesList);
    }

    @Override
    public List<RoomTypeResponse> getRoomTypesByHotelId(Integer hotelId) {
        List<RoomType> roomTypes = roomTypeRepository.findByHotel_HotelId(hotelId);

        return roomTypes.stream()
                .map(RoomTypeMapper::toListResponse)
                .collect(Collectors.toList());
    }

    @Override
    public RoomTypeDetailResponse getRoomTypeDetail(Integer roomTypeId) {
        RoomType roomType = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_TYPE_NOT_FOUND));

        List<String> amenitiesList = parseAmenities(roomType.getAmenities());

        return RoomTypeMapper.toDetailResponse(roomType, amenitiesList);
    }

    @Override
    public RoomTypeDetailResponse inactiveRoomType(Integer roomTypeId) {

        RoomType roomType = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_TYPE_NOT_FOUND));

        roomType.setRoomStatus("inactive");
        roomType.setUpdatedAt(LocalDateTime.now());

        RoomType updatedRoomType = roomTypeRepository.save(roomType);

        List<String> amenitiesList = parseAmenities(updatedRoomType.getAmenities());

        return RoomTypeMapper.toDetailResponse(updatedRoomType, amenitiesList);
    }

    private List<String> parseAmenities(String amenitiesJson) {
        try {
            if (amenitiesJson == null || amenitiesJson.isBlank()) {
                return List.of();
            }
            return objectMapper.readValue(amenitiesJson, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse amenities JSON", e);
        }
    }

    @Override
    public RoomTypeDetailResponse updateRoomType(Integer roomTypeId, UpdateRoomTypeRequest request
    ) {
        RoomType roomType = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_TYPE_NOT_FOUND));

        roomType.setRoomTitle(request.getRoomTitle());
        roomType.setDescription(request.getDescription());
        roomType.setBasePrice(request.getBasePrice());
        roomType.setMaxAdults(request.getMaxAdults());
        roomType.setMaxChildren(request.getMaxChildren());
        roomType.setRoomArea(request.getRoomArea());
        roomType.setBedType(request.getBedType());
        roomType.setTotalRooms(request.getTotalRooms());

        try {
            String amenitiesJson = objectMapper.writeValueAsString(request.getAmenities());
            roomType.setAmenities(amenitiesJson);
        } catch (Exception e) {
            throw new RuntimeException("Invalid amenities format");
        }

        roomType.setUpdatedAt(LocalDateTime.now());

        RoomType updated = roomTypeRepository.save(roomType);

        return RoomTypeMapper.toDetailResponse(updated, parseAmenities(updated.getAmenities())
        );
    }

    @Override
    public List<RoomTypeListDetailResponse> getRoomTypeDetailsByHotelId(Integer hotelId) {
        List<RoomType> roomTypes = roomTypeRepository.findByHotel_HotelId(hotelId);

        return roomTypes.stream()
                .map(roomType -> {
                    List<String> amenitiesList = parseAmenities(roomType.getAmenities());
                    return RoomTypeMapper.toListDetailResponse(roomType, amenitiesList);
                })
                .collect(Collectors.toList());
    }

}
