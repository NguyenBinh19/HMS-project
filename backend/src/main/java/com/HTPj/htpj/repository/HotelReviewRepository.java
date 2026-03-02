package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.HotelReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface HotelReviewRepository
        extends JpaRepository<HotelReview, Integer> {

    @Query("""
        SELECT CAST(ROUND(AVG(CAST(r.ratingScore AS double)), 1) AS double)
        FROM HotelReview r
        WHERE r.hotel.hotelId = :hotelId
    """)
    Double getAvgRating(Integer hotelId);

    @Query("""
    SELECT COUNT(r) 
    FROM HotelReview r 
    WHERE r.hotel.hotelId = :hotelId
""")
    Integer countByHotelId(Integer hotelId);


}

