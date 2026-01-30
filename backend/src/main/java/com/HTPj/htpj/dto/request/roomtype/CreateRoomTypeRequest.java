package com.HTPj.htpj.dto.request.roomtype;


import lombok.*;

import java.math.BigDecimal;
import java.util.List;

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
    private Integer max_adults;
    private Integer maxChildren;
    private BigDecimal roomArea;
    private String bedType;
    private String keywords;
    private Integer totalRooms;
    private List<Integer> amenityIds;
}
