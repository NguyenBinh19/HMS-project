package com.HTPj.htpj.dto.request;


import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateRoomTypeRequest {

    private Integer hotelId;
    private String roomCode;
    private String roomTitle;
    private String description;
    private BigDecimal basePrice;
    private Integer maxGuest;
    private Integer totalRooms;
}
