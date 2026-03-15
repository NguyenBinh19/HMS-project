package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.hotel.UpdateHotelRequest;
import com.HTPj.htpj.dto.response.hotel.HotelDetailListResponse;
import com.HTPj.htpj.dto.response.hotel.HotelDetailResponse;
import com.HTPj.htpj.dto.response.hotel.HotelListResponse;
import com.HTPj.htpj.dto.response.hotel.HotelResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface HotelService {

    List<HotelResponse> getHotelsForView();

    HotelDetailResponse getHotelDetailForView(Integer hotelId);

    List<HotelDetailResponse> searchHotels(String keyword, java.time.LocalDate checkIn, java.time.LocalDate checkOut, Integer rooms);

    List<HotelListResponse> getAllHotels();

    HotelDetailListResponse getHotelDetail(Integer hotelId);

    HotelDetailListResponse updateHotel(UpdateHotelRequest request, MultipartFile[] newImages
    );
}
