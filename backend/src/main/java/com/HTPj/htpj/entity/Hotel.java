package com.HTPj.htpj.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "hotels")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Hotel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "hotel_id")
    private Integer hotelId;

    @Column(name = "hotel_name", nullable = false, length = 255)
    private String hotelName;

    @Column(name = "address", nullable = false)
    private String address;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    // ⭐ SỐ SAO KHÁCH SẠN (1–5)
    @Column(name = "star_rating")
    private Integer starRating;

    // 🏷 TIỆN ÍCH (JSON)
    @Column(name = "amenities", columnDefinition = "NVARCHAR(MAX)")
    private String amenities;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
