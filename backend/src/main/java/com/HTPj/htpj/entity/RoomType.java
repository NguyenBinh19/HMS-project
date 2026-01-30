package com.HTPj.htpj.entity;

import jakarta.persistence.*;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

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
    private Integer max_adults;

    @Column(name = "max_children")
    private Integer maxChildren;

    @Column(name = "room_area", precision = 10, scale = 2)
    private BigDecimal roomArea;

    @Column(name = "bed_type", length = 100)
    private String bedType;

    @Column(name = "keywords", columnDefinition = "NVARCHAR(MAX)")
    private String keywords;

    @Column(name = "total_rooms")
    private Integer totalRooms;

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "room_type_amenities",
            joinColumns = @JoinColumn(name = "room_type_id", nullable = false),
            inverseJoinColumns = @JoinColumn(name = "amenity_id", nullable = false),
            uniqueConstraints = @UniqueConstraint(columnNames = {"room_type_id", "amenity_id"})
    )
    private Set<Amenity> amenities = new HashSet<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "room_status", length = 20)
    private String roomStatus;

}
