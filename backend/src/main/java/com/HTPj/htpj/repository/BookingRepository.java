package com.HTPj.htpj.repository;

import com.HTPj.htpj.dto.response.booking.ListAllBookingsResponse;
import com.HTPj.htpj.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    boolean existsByBookingCode(String bookingCode);

    // UC-029: Lịch sử đặt phòng — chỉ lấy bảng bookings, không JOIN thêm
    // (dữ liệu tổng hợp đã lưu sẵn trong bảng bookings)
    @Query("""
        SELECT b FROM Booking b
        WHERE b.userId = :userId
        ORDER BY b.createdAt DESC
    """)
    Page<Booking> findHistoryByUserId(@Param("userId") String userId, Pageable pageable);

    // UC-030: Chi tiết booking — JOIN FETCH bookingDetails một lần, tránh N+1
    @Query("""
        SELECT DISTINCT b FROM Booking b
        LEFT JOIN FETCH b.bookingDetails
        WHERE b.bookingCode = :bookingCode
          AND b.userId = :userId
    """)
    Optional<Booking> findDetailByBookingCodeAndUserId(
            @Param("bookingCode") String bookingCode,
            @Param("userId") String userId
    );
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

    @Query("""
    SELECT new com.HTPj.htpj.dto.response.booking.ListAllBookingsResponse(
        b.bookingCode,
        b.createdAt,
        b.guestName,
        a.agencyName,
        h.hotelName,
        b.checkInDate,
        b.checkOutDate,
        b.totalRooms,
        b.finalAmount,
        b.bookingStatus,
        b.paymentStatus
    )
    FROM Booking b
    JOIN Agency a ON b.agencyId = a.agencyId
    JOIN Hotel h ON b.hotelId = h.hotelId
    """)
    List<ListAllBookingsResponse> getAllBookingsSummary();

    @Query("""
    SELECT new com.HTPj.htpj.dto.response.booking.ListAllBookingsResponse(
        b.bookingCode,
        b.createdAt,
        b.guestName,
        a.agencyName,
        h.hotelName,
        b.checkInDate,
        b.checkOutDate,
        b.totalRooms,
        b.finalAmount,
        b.bookingStatus,
        b.paymentStatus
    )
    FROM Booking b
    JOIN Agency a ON b.agencyId = a.agencyId
    JOIN Hotel h ON b.hotelId = h.hotelId
    WHERE b.bookingStatus = 'CONFIRMED'
    AND b.checkInDate = :date
    """)
    List<ListAllBookingsResponse> getBookingsByCheckinDate(LocalDate date);


    @Query("""
    SELECT new com.HTPj.htpj.dto.response.booking.ListAllBookingsResponse(
        b.bookingCode,
        b.createdAt,
        b.guestName,
        a.agencyName,
        h.hotelName,
        b.checkInDate,
        b.checkOutDate,
        b.totalRooms,
        b.finalAmount,
        b.bookingStatus,
        b.paymentStatus
    )
    FROM Booking b
    JOIN Agency a ON b.agencyId = a.agencyId
    JOIN Hotel h ON b.hotelId = h.hotelId
    WHERE b.bookingStatus = 'CONFIRMED'
    AND b.checkInDate = CURRENT_DATE
    """)
    List<ListAllBookingsResponse> getTodayCheckinBookings();
}