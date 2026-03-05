package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
}