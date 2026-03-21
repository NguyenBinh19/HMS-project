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
    ACCOUNT_NOT_VERIFIED(1009, "Tài khoản chưa được xác minh. Vui lòng kiểm tra email để xác thực OTP.", HttpStatus.FORBIDDEN),
    ACCOUNT_BANNED(1010, "Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ.", HttpStatus.FORBIDDEN),
    INVALID_ROLE_SELECTION(1011, "Loại tài khoản không hợp lệ. Vui lòng chọn Khách sạn hoặc Đại lý.", HttpStatus.BAD_REQUEST),
    OTP_INVALID(1012, "Mã OTP không chính xác.", HttpStatus.BAD_REQUEST),
    OTP_EXPIRED(1013, "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.", HttpStatus.BAD_REQUEST),
    OTP_MAX_ATTEMPTS(1014, "Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau 30 phút.", HttpStatus.TOO_MANY_REQUESTS),
    OTP_COOLDOWN(1015, "Vui lòng chờ 60 giây trước khi yêu cầu OTP mới.", HttpStatus.TOO_MANY_REQUESTS),
    RESET_TOKEN_INVALID(1016, "Liên kết đặt lại mật khẩu không hợp lệ.", HttpStatus.BAD_REQUEST),
    RESET_TOKEN_EXPIRED(1017, "Liên kết đặt lại mật khẩu đã hết hạn.", HttpStatus.BAD_REQUEST),
    PASSWORD_SAME_AS_OLD(1018, "Mật khẩu mới không được trùng với mật khẩu cũ.", HttpStatus.BAD_REQUEST),
    INVALID_PHONE(1019, "Số điện thoại không hợp lệ.", HttpStatus.BAD_REQUEST),
    INVALID_IMAGE_FORMAT(1020, "Định dạng ảnh không hợp lệ. Chỉ chấp nhận jpg, jpeg, png, webp.", HttpStatus.BAD_REQUEST),
    FILE_TOO_LARGE(1021, "Kích thước file vượt quá giới hạn cho phép (5MB).", HttpStatus.BAD_REQUEST),
    AVATAR_UPLOAD_FAILED(1022, "Tải ảnh đại diện thất bại.", HttpStatus.INTERNAL_SERVER_ERROR),
    CANNOT_BAN_ADMIN(1023, "Không thể khóa tài khoản Admin.", HttpStatus.FORBIDDEN),
    INSUFFICIENT_PRIVILEGES(1024, "Không đủ quyền để thực hiện thao tác này.", HttpStatus.FORBIDDEN),

    //staff
    INVALID_MANAGER_ROLE(1100, "Invalid manager role", HttpStatus.FORBIDDEN),
    MANAGER_NOT_FOUND(1101, "Manager not found", HttpStatus.NOT_FOUND),
    ROLE_NOT_FOUND(1102, "Role not found", HttpStatus.NOT_FOUND),
    USERNAME_EXISTED(1103, "Username already exists", HttpStatus.BAD_REQUEST),
    EMAIL_EXISTED(1104, "Email already exists", HttpStatus.BAD_REQUEST),
    PHONE_EXISTED(1105, "Phone already exists", HttpStatus.BAD_REQUEST),

    //hotel + room
    HOTEL_NOT_FOUND(2001, "Hotel not found", HttpStatus.NOT_FOUND),
    ROOM_TYPE_EXISTED(2002, "Room type already exists", HttpStatus.BAD_REQUEST),
    ROOM_TYPE_NOT_FOUND(2003, "Room type not found", HttpStatus.NOT_FOUND),

    //promotion
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

    //booking
    HOLD_NOT_FOUND(2201, "Hold not found", HttpStatus.NOT_FOUND),
    HOLD_EXPIRED(2202, "Hold has expired", HttpStatus.BAD_REQUEST),
    BOOKING_UPDATE_NOT_ALLOWED(2203, "Booking cannot update guest information", HttpStatus.BAD_REQUEST),
    BOOKING_NOT_FOUND(2204, "Booking not found", HttpStatus.NOT_FOUND),
    ADDON_SERVICE_NOT_FOUND(2205, "Addon service not found", HttpStatus.NOT_FOUND),

    FEEDBACK_ALREADY_SUBMITTED(3001, "Bạn đã đánh giá đơn hàng này rồi.", HttpStatus.BAD_REQUEST),
    FEEDBACK_WINDOW_EXPIRED(3002, "Thời hạn đánh giá đã hết (180 ngày sau checkout).", HttpStatus.BAD_REQUEST),
    BOOKING_NOT_COMPLETED(3003, "Chỉ có thể đánh giá đơn hàng đã hoàn thành.", HttpStatus.BAD_REQUEST),
    REVIEW_NOT_FOUND(3004, "Đánh giá không tồn tại.", HttpStatus.NOT_FOUND),
    REPLY_WINDOW_EXPIRED(3005, "Thời hạn phản hồi đã hết (30 ngày).", HttpStatus.BAD_REQUEST),
    REVIEW_ALREADY_REPLIED(3006, "Đánh giá này đã được phản hồi.", HttpStatus.BAD_REQUEST),
    INVALID_PARTNER_TYPE(4005, "Invalid partner type", HttpStatus.NOT_FOUND),
    VERIFICATION_NOT_FOUND(4006, "Invalid verfication", HttpStatus.NOT_FOUND),

    //kyc
    AGENCY_NOT_FOUND(4001, "Agency not found", HttpStatus.NOT_FOUND),
    EMAIL_ALREADY_EXISTS(4002, "Email already exists", HttpStatus.BAD_REQUEST),
    KYC_FILE_UPLOAD_FAILED(4003, "Failed to upload KYC document", HttpStatus.INTERNAL_SERVER_ERROR),
    KYC_VERIFICATION_NOT_FOUND(4004, "KYC verification request not found.", HttpStatus.NOT_FOUND),

    //rank
    RANK_NOT_FOUND(4101, "Rank not found", HttpStatus.NOT_FOUND),
    RANK_NAME_EXISTED(4102, "Rank name already exists", HttpStatus.BAD_REQUEST),
    RANK_PRIORITY_EXISTED(4103, "Priority already exists", HttpStatus.BAD_REQUEST),
    RANK_IN_USE(4104, "Rank is being used by agencies", HttpStatus.BAD_REQUEST),

    //commission
    DEFAULT_ALREADY_EXIST(4201, "Default commission already exists", HttpStatus.BAD_REQUEST),
    CANNOT_DELETE_DEFAULT(4202, "Cannot delete default commission", HttpStatus.BAD_REQUEST),
    REASON_REQUIRED(4203, "Reason is required", HttpStatus.BAD_REQUEST),
    COMMISSION_NOT_FOUND(4204, "Commission not found", HttpStatus.NOT_FOUND),
    INVALID_COMMISSION_TYPE(4205, "Only for commission type deal", HttpStatus.NOT_FOUND),
    COMMISSION_ALREADY_ACTIVE(4206, "Commission is active", HttpStatus.NOT_FOUND),


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