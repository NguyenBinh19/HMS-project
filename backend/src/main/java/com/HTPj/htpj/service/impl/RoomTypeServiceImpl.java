package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.roomtype.CreateRoomTypeRequest;
import com.HTPj.htpj.dto.response.roomtype.RoomTypeDetailResponse;
import com.HTPj.htpj.dto.response.roomtype.RoomTypeResponse;
import com.HTPj.htpj.entity.Hotel;
import com.HTPj.htpj.entity.RoomType;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.mapper.RoomTypeMapper;
import com.HTPj.htpj.repository.HotelRepository;
import com.HTPj.htpj.repository.RoomTypeRepository;
import com.HTPj.htpj.service.RoomTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomTypeServiceImpl implements RoomTypeService {

    private final RoomTypeRepository roomTypeRepository;
    private final HotelRepository hotelRepository;

    @Override
    public RoomTypeDetailResponse createRoomType(CreateRoomTypeRequest request) {
        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));

        if (roomTypeRepository.existsByRoomCode(request.getRoomCode())) {
            throw new AppException(ErrorCode.ROOM_TYPE_EXISTED);
        }

        RoomType roomType = RoomType.builder()
                .hotel(hotel)
                .roomCode(request.getRoomCode())
                .roomTitle(request.getRoomTitle())
                .description(request.getDescription())
                .basePrice(request.getBasePrice())
                .maxGuest(request.getMaxGuest())
                .totalRooms(request.getTotalRooms())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .roomStatus("inactive")
                .build();

        RoomType room = roomTypeRepository.save(roomType);

        return RoomTypeMapper.toDetailResponse(room);
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

        return RoomTypeMapper.toDetailResponse(roomType);
    }

    @Override
    public RoomTypeDetailResponse inactiveRoomType(Integer roomTypeId) {

        RoomType roomType = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_TYPE_NOT_FOUND));

        roomType.setRoomStatus("inactive");
        roomType.setUpdatedAt(LocalDateTime.now());

        RoomType updatedRoomType = roomTypeRepository.save(roomType);

        return RoomTypeMapper.toDetailResponse(updatedRoomType);
    }



}
