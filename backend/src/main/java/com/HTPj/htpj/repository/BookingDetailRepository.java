package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.BookingDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BookingDetailRepository extends JpaRepository<BookingDetail, Long> {
    @Query("""
        SELECT bd
        FROM BookingDetail bd
        JOIN bd.booking b
        WHERE b.hotelId = :hotelId
          AND b.bookingStatus IN :statuses
          AND b.checkInDate < :checkOut
          AND b.checkOutDate > :checkIn
    """)
    List<BookingDetail> findOverlappingBookings(
            @Param("hotelId") Integer hotelId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("statuses") List<String> statuses
    );
}
