package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.roomHold.CreateRoomHoldRequest;
import com.HTPj.htpj.dto.response.roomHold.RoomHoldResponse;
import com.HTPj.htpj.entity.RoomHold;
import com.HTPj.htpj.mapper.RoomHoldMapper;
import com.HTPj.htpj.repository.RoomHoldRepository;
import com.HTPj.htpj.service.RoomHoldService;
import com.HTPj.htpj.temporal.client.RoomHoldWorkflowClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;
@Service
@RequiredArgsConstructor
public class RoomHoldServiceImpl implements RoomHoldService {

    private final RoomHoldRepository roomHoldRepository;
    private final RoomHoldMapper roomHoldMapper;
    private final RoomHoldWorkflowClient workflowClient;


    @Override
    public RoomHoldResponse createHold(CreateRoomHoldRequest req) {

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiredAt = now.plusMinutes(1);

        RoomHold hold = RoomHold.builder()
                .holdCode("HOLD-" + UUID.randomUUID())
                .hotelId(req.getHotelId())
                .roomTypeId(req.getRoomTypeId())
                .checkInDate(req.getCheckInDate())
                .checkOutDate(req.getCheckOutDate())
                .quantity(req.getQuantity())
                .createdAt(now)
                .expiredAt(expiredAt)
                .status("HOLDING")
                .build();

        roomHoldRepository.save(hold);

        workflowClient.startWorkflow(
                hold.getHoldCode(),
                expiredAt.atZone(java.time.ZoneId.systemDefault())
                        .toInstant()
                        .toEpochMilli()
        );


        return roomHoldMapper.toResponse(hold);
    }
}
