package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RoomTypeRepository extends JpaRepository<RoomType, Integer> {
    boolean existsByRoomCode(String roomCode);
    List<RoomType> findByHotel_HotelId(Integer hotelId);

    @Query("SELECT rt FROM RoomType rt LEFT JOIN FETCH rt.amenities WHERE rt.roomTypeId = :roomTypeId")
    Optional<RoomType> findByIdWithAmenities(@Param("roomTypeId") Integer roomTypeId);
}
