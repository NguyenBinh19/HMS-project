package com.HTPj.htpj.dto.request.rank;
import lombok.*;

import java.math.BigDecimal;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateRankRequest {

    private String rankName;
    private String description;
    private String icon;
    private String color;
    private Integer priority;

    private Integer minTotalBooking;
    private BigDecimal minTotalRevenue;
    private String logic;

    private Integer maintainMinBooking;
    private BigDecimal maintainMinRevenue;
    private String maintainLogic;

}
