package com.HTPj.htpj.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Uncategorized error", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1002, "Người dùng với email này đã tồn tại", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1003, "Username must be at least {min} characters", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1004, "Password must be at least {min} characters", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005, "User not existed", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),
    INVALID_DOB(1008, "Your age must be at least {min}", HttpStatus.BAD_REQUEST),

    HOTEL_NOT_FOUND(2001, "Hotel not found", HttpStatus.NOT_FOUND),
    ROOM_TYPE_EXISTED(2002, "Room type already exists", HttpStatus.BAD_REQUEST),
    ROOM_TYPE_NOT_FOUND(2003, "Room type not found", HttpStatus.NOT_FOUND),

    PROMOTION_NOT_FOUND(2101, "Promotion not found", HttpStatus.NOT_FOUND),
    PROMOTION_CODE_EXISTED(2102, "Promotion code already existed", HttpStatus.BAD_REQUEST),
    PROMOTION_CODE_INVALID(2103, "Promotion code is invalid", HttpStatus.BAD_REQUEST),
    PROMOTION_INACTIVE(2104, "Promotion is inactive", HttpStatus.BAD_REQUEST),
    PROMOTION_USAGE_EXCEEDED(2105, "Promotion usage exceeded", HttpStatus.BAD_REQUEST),
    PROMOTION_NOT_APPLICABLE_HOTEL(2106, "Promotion not applicable for this hotel", HttpStatus.BAD_REQUEST),
    PROMOTION_MIN_ORDER_NOT_MET(2107, "Minimum order value not reached", HttpStatus.BAD_REQUEST),
    PROMOTION_EXPIRED(2108, "Promotion expired", HttpStatus.BAD_REQUEST),
    PROMOTION_STAY_DATE_INVALID(2109, "Stay date not valid for promotion", HttpStatus.BAD_REQUEST),
    PROMOTION_MIN_STAY_NOT_MET(2110, "Minimum stay not satisfied", HttpStatus.BAD_REQUEST),
    PROMOTION_AGENCY_USAGE_EXCEEDED(2111, "Agency usage limit exceeded", HttpStatus.BAD_REQUEST),

    HOLD_NOT_FOUND(2301, "Hold not found", HttpStatus.NOT_FOUND),
    HOLD_EXPIRED(2302, "Hold has expired", HttpStatus.BAD_REQUEST),
    AGENCY_NOT_FOUND(4001, "Agency not found", HttpStatus.NOT_FOUND),
    KYC_FILE_UPLOAD_FAILED(4003, "Failed to upload KYC document", HttpStatus.INTERNAL_SERVER_ERROR),

    ADDON_SERVICE_NOT_FOUND(4001, "Addon service not found", HttpStatus.NOT_FOUND),
    BOOKING_NOT_FOUND(4002, "Booking not found", HttpStatus.NOT_FOUND),

    KYC_VERIFICATION_NOT_FOUND(4004, "KYC verification request not found.", HttpStatus.NOT_FOUND),
    ;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;
}