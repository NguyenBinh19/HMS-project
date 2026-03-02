package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.response.hotel.HotelDetailResponse;
import com.HTPj.htpj.dto.response.hotel.HotelResponse;

import java.util.List;

public interface HotelService {

    List<HotelResponse> getHotelsForView();

    HotelDetailResponse getHotelDetailForView(Integer hotelId);

    List<HotelDetailResponse> searchHotels(String keyword);
}
