package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("""
        SELECT COUNT(b)
        FROM Booking b
        WHERE b.agencyId = :agencyId
        AND b.promotionCode = :code
        AND b.bookingStatus <> 'CANCELLED'
    """)
    Long countAgencyPromotionUsage(
            @Param("agencyId") Long agencyId,
            @Param("code") String code
    );
}