package com.HTPj.htpj.dto.request.booking;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateBookingRequest {
    private String holdCode;

//    private String userId;     // tam thoi
    private Long agencyId;

    private String guestName;
    private String guestPhone;
    private String guestEmail;

    private String notes;

    private Integer totalGuests;

    private BigDecimal discountAmount;

    private String paymentMethod;
}
