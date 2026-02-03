package com.HTPj.htpj.repository;
import com.HTPj.htpj.entity.HotelImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HotelImageRepository
        extends JpaRepository<HotelImage, Integer> {

     List<HotelImage> findByHotelHotelIdOrderBySortOrderAsc(Integer hotelId);

    List<HotelImage> findByHotelHotelIdAndIsCoverTrue(Integer hotelId);

}