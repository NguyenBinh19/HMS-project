package com.HTPj.htpj.entity;
import jakarta.persistence.*;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "room_holds")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomHold {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "hold_code", nullable = false, unique = true)
    private String holdCode;

    @Column(name = "hotel_id", nullable = false)
    private Integer hotelId;

    @Column(name = "room_type_id", nullable = false)
    private Integer roomTypeId;

    @Column(name = "check_in_date", nullable = false)
    private LocalDate checkInDate;

    @Column(name = "check_out_date", nullable = false)
    private LocalDate checkOutDate;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "expired_at", nullable = false)
    private LocalDateTime expiredAt;

    @Column(nullable = false)
    private String status; // HOLDING | EXPIRED

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}

