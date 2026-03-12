package com.HTPj.htpj.dto.response.hotel;
import com.HTPj.htpj.dto.response.kyc.VerificationInfoResponse;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelDetailListResponse {
    Integer hotelId;
    String hotelName;
    String address;
    String city;
    String country;
    String phone;
    String description;
    Integer starRating;
    String amenities;
    String status;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    VerificationInfoResponse verification;
}
