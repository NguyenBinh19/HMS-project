package com.HTPj.htpj.entity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "ranks")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Rank {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String rankName;

    private String description;

    private Integer priority;

    private Boolean isActive;

    private Integer minTotalBooking;

    private BigDecimal minTotalRevenue;

    private String logic;

    private Integer maintainMinBooking;

    private BigDecimal maintainMinRevenue;

    private String maintainLogic;

    private BigDecimal creditLimit;

    private LocalDateTime createdAt;

    private String createdBy;

    private LocalDateTime updatedAt;

    private String updatedBy;

    private String color;

    private String icon;

    @OneToMany(mappedBy = "rank")
    private List<Agency> agencies;
}
