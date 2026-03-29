package com.HTPj.htpj.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "agency_booking")
public class AgencyBooking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "agency_booking_id")
    private Long id;

    @Column(name = "agency_id", nullable = false)
    private Long agencyId;

    @Column(name = "month", nullable = false, length = 7)
    private String month;

    @Column(name = "total_amount", precision = 18, scale = 2, nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_paid", nullable = false)
    private Boolean isPaid = false;

    @Column(name = "penalty_interest", precision = 18, scale = 2)
    private BigDecimal penaltyInterest = BigDecimal.ZERO;

    @Column(name = "principal_remaining", precision = 18, scale = 2)
    private BigDecimal principalRemaining = BigDecimal.ZERO;

    @OneToMany(fetch = FetchType.LAZY)
    @JoinColumn(name = "agency_id", referencedColumnName = "agency_id", insertable = false, updatable = false)
    private List<Booking> bookings;
}
