package com.HTPj.htpj.dto.response.roomtype;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomTypeDetailResponse {

    private Integer roomTypeId;
    private Integer hotelId;
    private String roomCode;
    private String roomTitle;
    private String description;
    private BigDecimal basePrice;
    private Integer maxGuest;
    private Integer totalRooms;
    private String roomStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
