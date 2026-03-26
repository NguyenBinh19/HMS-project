package com.HTPj.htpj.repository;

import com.HTPj.htpj.dto.response.booking.DepartureListResponse;
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

    Optional<Booking> findByBookingCode(String bookingCode);

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
    WHERE b.bookingStatus = 'BOOKED'
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
    WHERE b.bookingStatus = 'BOOKED'
    AND b.checkInDate = CURRENT_DATE
    """)
    List<ListAllBookingsResponse> getTodayCheckinBookings();

    // UC-051: View Daily Departure List - bookings checking out today for a specific hotel
    @Query("""
    SELECT new com.HTPj.htpj.dto.response.booking.DepartureListResponse(
        b.bookingCode,
        bd.roomTitle,
        bd.roomCode,
        b.guestName,
        a.agencyName,
        b.checkInDate,
        b.checkOutDate,
        b.totalRooms,
        b.finalAmount,
        b.bookingStatus,
        b.paymentStatus,
        b.createdAt
    )
    FROM Booking b
    JOIN Agency a ON b.agencyId = a.agencyId
    JOIN BookingDetail bd ON bd.booking = b
    WHERE b.hotelId = :hotelId
    AND b.checkOutDate = CURRENT_DATE
    AND b.bookingStatus IN ('BOOKED', 'COMPLETED')
    ORDER BY b.bookingStatus ASC, b.guestName ASC
    """)
    List<DepartureListResponse> getTodayDeparturesByHotelId(@Param("hotelId") Integer hotelId);

    // UC-051: View departures by specific date for a specific hotel
    @Query("""
    SELECT new com.HTPj.htpj.dto.response.booking.DepartureListResponse(
        b.bookingCode,
        bd.roomTitle,
        bd.roomCode,
        b.guestName,
        a.agencyName,
        b.checkInDate,
        b.checkOutDate,
        b.totalRooms,
        b.finalAmount,
        b.bookingStatus,
        b.paymentStatus,
        b.createdAt
    )
    FROM Booking b
    JOIN Agency a ON b.agencyId = a.agencyId
    JOIN BookingDetail bd ON bd.booking = b
    WHERE b.hotelId = :hotelId
    AND b.checkOutDate = :date
    AND b.bookingStatus IN ('BOOKED', 'COMPLETED')
    ORDER BY b.bookingStatus ASC, b.guestName ASC
    """)
    List<DepartureListResponse> getDeparturesByHotelIdAndDate(
            @Param("hotelId") Integer hotelId,
            @Param("date") LocalDate date
    );

    // UC-051: Find booking by code and hotel for checkout operation
    @Query("""
    SELECT DISTINCT b FROM Booking b
    LEFT JOIN FETCH b.bookingDetails
    WHERE b.bookingCode = :bookingCode
    AND b.hotelId = :hotelId
    """)
    Optional<Booking> findByBookingCodeAndHotelId(
            @Param("bookingCode") String bookingCode,
            @Param("hotelId") Integer hotelId
    );
}