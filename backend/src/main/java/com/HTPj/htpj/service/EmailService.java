package com.HTPj.htpj.service;

public interface EmailService {
    void sendWelcomeOnboardEmail(String to);
    void sendOtpEmail(String to, String otp, String username);
    void sendResetPasswordEmail(String to, String resetLink, String username);
    void sendPasswordChangedNotification(String to, String username);
    void sendNewReviewNotification(String to, String hotelName, String agencyName, int ratingScore, String bookingCode);
    void sendStaffAccountEmail(String to, String username, String password);
}
