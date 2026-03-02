package com.HTPj.htpj.repository;

import com.HTPj.htpj.dto.response.hotel.HotelSearchProjection;
import com.HTPj.htpj.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface HotelRepository extends JpaRepository<Hotel, Integer> {

    Optional<Hotel> findByHotelIdAndStatus(Integer hotelId, String status);
    List<Hotel> findByStatus(String status);
    @Query("""
    SELECT h.hotelId as hotelId,
           h.hotelName as hotelName,
           h.address as address,
           h.city as city,
           h.country as country,
           h.phone as phone,
           h.description as description,
           h.starRating as starRating,
           COALESCE(AVG(r.ratingScore),0) as avgRating,
           COUNT(r.reviewId) as totalReviews,
           h.amenities as amenities
    FROM Hotel h
    LEFT JOIN HotelReview r ON h.hotelId = r.hotel.hotelId
    WHERE h.status = 'ACTIVE'
      AND (
           LOWER(h.hotelName) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR LOWER(h.address) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR LOWER(h.city) LIKE LOWER(CONCAT('%', :keyword, '%'))
      )
    GROUP BY h.hotelId, h.hotelName, h.address,
             h.city, h.country, h.phone,
             h.description, h.starRating, h.amenities
""")
    List<HotelSearchProjection> searchHotels(@Param("keyword") String keyword);
}
