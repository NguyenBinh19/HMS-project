package com.HTPj.htpj.dto.request.hotel;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateHotelRequest {
    private String hotelName;
    private String address;
    private String city;
    private String phone;
    private String description;
    private String status;
}
