package com.HTPj.htpj.dto.response.rank;
import lombok.*;

import java.math.BigDecimal;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RankResponse {

    private Integer id;
    private String rankName;
    private String description;
    private String icon;
    private String color;
    private Integer priority;
    private Boolean isActive;

    private Integer minTotalBooking;
    private BigDecimal minTotalRevenue;
    private String logic;

    private Integer maintainMinBooking;
    private BigDecimal maintainMinRevenue;
    private String maintainLogic;

    private BigDecimal creditLimit;

    private Long agencies;
}