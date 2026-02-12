package com.HTPj.htpj.entity;

import jakarta.persistence.*;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "room_types")
public class RoomType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_type_id")
    private Integer roomTypeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @Column(name = "room_code", nullable = false, length = 50)
    private String roomCode;

    @Column(name = "room_title", nullable = false, length = 255)
    private String roomTitle;

    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "base_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "max_adults")
    private Integer maxAdults;

    @Column(name = "max_children")
    private Integer maxChildren;

    @Column(name = "room_area", precision = 10, scale = 2)
    private BigDecimal roomArea;

    @Column(name = "bed_type", length = 100)
    private String bedType;

    @Column(name = "total_rooms")
    private Integer totalRooms;

    @Column(name = "amenities", columnDefinition = "NVARCHAR(MAX)")
    private String amenities;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "room_status", length = 20)
    private String roomStatus;

}
