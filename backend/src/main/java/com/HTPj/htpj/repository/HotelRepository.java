package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HotelRepository extends JpaRepository<Hotel, Integer> {

    Optional<Hotel> findByHotelIdAndStatus(Integer hotelId, String status);
    List<Hotel> findByStatus(String status);

}
