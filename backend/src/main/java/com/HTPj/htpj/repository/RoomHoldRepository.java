package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.RoomHold;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface RoomHoldRepository extends JpaRepository<RoomHold, Long> {

    Optional<RoomHold> findByHoldCode(String holdCode);

    @Query("""
    SELECT rh
    FROM RoomHold rh
    WHERE rh.hotelId = :hotelId
      AND UPPER(rh.status) = 'HOLDING'
      AND rh.checkInDate < :checkOut
      AND rh.checkOutDate > :checkIn
    """)

    List<RoomHold> findActiveOverlappingHolds(
            @Param("hotelId") Integer hotelId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("now") LocalDateTime now
    );


}