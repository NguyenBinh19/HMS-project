package com.HTPj.htpj.dto.request.roomHold;


import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateRoomHoldRequest {

    private Integer hotelId;
    private Integer roomTypeId;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer quantity;
}

