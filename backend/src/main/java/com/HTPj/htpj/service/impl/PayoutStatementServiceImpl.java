package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.financial.ConfirmPayoutRequest;
import com.HTPj.htpj.dto.request.financial.DisputePayoutRequest;
import com.HTPj.htpj.dto.request.financial.MarkAsPaidRequest;
import com.HTPj.htpj.dto.request.financial.PayoutListRequest;
import com.HTPj.htpj.dto.response.financial.PayoutLineItemResponse;
import com.HTPj.htpj.dto.response.financial.PayoutListItemResponse;
import com.HTPj.htpj.dto.response.financial.PayoutListResponse;
import com.HTPj.htpj.dto.response.financial.PayoutStatementResponse;
import com.HTPj.htpj.entity.*;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.repository.*;
import com.HTPj.htpj.service.EmailService;
import com.HTPj.htpj.service.NotificationService;
import com.HTPj.htpj.service.PayoutStatementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayoutStatementServiceImpl implements PayoutStatementService {

    private final PayoutStatementRepository statementRepository;
    private final PayoutLineItemRepository lineItemRepository;
    private final HotelRepository hotelRepository;
    private final BookingRepository bookingRepository;
    private final EmailService emailService;
    private final AgencyRepository agencyRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private static final BigDecimal MIN_PAYOUT_THRESHOLD = new BigDecimal("50");

    // ---- Statement Generation ----

    @Override
    @Transactional
    public List<PayoutStatementResponse> generateStatementsForPeriod(LocalDate periodStart, LocalDate periodEnd) {
        log.info("Generating payout statements for period {} to {}", periodStart, periodEnd);

        // Find all hotels that have unprocessed paid bookings (current period + late-paid from previous)
        List<Integer> hotelIds = bookingRepository.findHotelIdsWithUnprocessedPaidBookings(periodEnd);
        log.info("Found {} hotels with unprocessed paid bookings up to {}", hotelIds.size(), periodEnd);

        List<PayoutStatementResponse> results = new ArrayList<>();

        for (Integer hotelId : hotelIds) {
            // Skip if statement already exists for this hotel and period
            if (statementRepository.existsByHotelIdAndPeriodStartAndPeriodEnd(hotelId, periodStart, periodEnd)) {
                log.info("Statement already exists for hotel {} in period {} - {}, skipping", hotelId, periodStart, periodEnd);
                continue;
            }

            Hotel hotel = hotelRepository.findById(hotelId).orElse(null);
            if (hotel == null) {
                log.warn("Hotel {} not found, skipping", hotelId);
                continue;
            }

            // Get all unprocessed paid bookings for this hotel (current period + late-paid from previous)
            List<Booking> bookings = bookingRepository.findUnprocessedPaidBookingsByHotel(
                    hotelId, periodEnd);

            if (bookings.isEmpty()) continue;

            // Calculate totals
            BigDecimal grossRevenue = BigDecimal.ZERO;
            BigDecimal totalCommission = BigDecimal.ZERO;
            BigDecimal totalRefunds = BigDecimal.ZERO;
            int totalRoomNights = 0;

            // Generate statement code: STM-YYYYMM-hotelId
            String periodCode = periodEnd.format(DateTimeFormatter.ofPattern("yyyyMM"));
            String statementCode = String.format("STM-%s-%04d", periodCode, hotelId);

            // Create statement first
            PayoutStatement statement = PayoutStatement.builder()
                    .statementCode(statementCode)
                    .hotelId(hotelId)
                    .periodStart(periodStart)
                    .periodEnd(periodEnd)
                    .status("PENDING_CONFIRMATION")
                    .totalBookings(bookings.size())
                    .build();

            statement = statementRepository.save(statement);

            // Create line items for each booking
            List<PayoutLineItem> lineItems = new ArrayList<>();
            for (Booking booking : bookings) {
                BigDecimal bookingGross = booking.getFinalAmount() != null
                        ? booking.getFinalAmount() : BigDecimal.ZERO;
                BigDecimal bookingRefund = booking.getRefundAmount() != null
                        ? booking.getRefundAmount() : BigDecimal.ZERO;

                // Calculate commission based on hotel's commission settings
                BigDecimal commissionAmount = calculateCommission(bookingGross, hotel);

                BigDecimal netAmount = bookingGross.subtract(commissionAmount).subtract(bookingRefund);

                int roomNights = booking.getNights() != null ? booking.getNights() : 0;

                String agencyName = agencyRepository.findById(booking.getAgencyId())
                        .map(Agency::getAgencyName)
                        .orElse("Unknown Agency");
                PayoutLineItem lineItem = PayoutLineItem.builder()
                        .payoutStatement(statement)
                        .bookingId(booking.getBookingId())
                        .bookingCode(booking.getBookingCode())
                        .agencyName(agencyName)
                        .checkInDate(booking.getCheckInDate())
                        .checkOutDate(booking.getCheckOutDate())
                        .roomNights(roomNights)
                        .grossAmount(bookingGross)
                        .commissionAmount(commissionAmount)
                        .refundAmount(bookingRefund)
                        .netAmount(netAmount)
                        .build();

                lineItems.add(lineItem);

                grossRevenue = grossRevenue.add(bookingGross);
                totalCommission = totalCommission.add(commissionAmount);
                totalRefunds = totalRefunds.add(bookingRefund);
                totalRoomNights += roomNights;
            }

            lineItemRepository.saveAll(lineItems);

            // Mark all included bookings as processed so they won't be picked up again
            for (Booking booking : bookings) {
                booking.setPayoutProcessed(true);
            }
            bookingRepository.saveAll(bookings);

            // Update statement totals
            BigDecimal netPayout = grossRevenue.subtract(totalCommission).subtract(totalRefunds);
            statement.setGrossRevenue(grossRevenue);
            statement.setTotalCommission(totalCommission);
            statement.setTotalRefunds(totalRefunds);
            statement.setAdjustments(BigDecimal.ZERO);
            statement.setNetPayout(netPayout);
            statement.setTotalRoomNights(totalRoomNights);

            // UC-088.E2: Below minimum threshold → ROLLOVER
            if (netPayout.compareTo(MIN_PAYOUT_THRESHOLD) < 0) {
                statement.setStatus("ROLLOVER");
            }

            statementRepository.save(statement);

            results.add(toResponse(statement, hotel.getHotelName(), false));
            log.info("Generated statement {} for hotel {} ({}): netPayout={}",
                    statementCode, hotelId, hotel.getHotelName(), netPayout);
            List<Users> hotelUsers = userRepository.findByHotel_HotelId(hotelId);
            for (Users u : hotelUsers) {
                notificationService.sendNotification(u.getId(), "FINANCIAL",
                        "Bảng sao kê thanh toán đã được tạo",
                        "Một bảng sao kê thanh toán mới " + statementCode + " đã được tạo cho khách sạn của bạn.",
                        "PAYOUT", String.valueOf(statement.getStatementId()), "/hotel/payout-state");
            }
        }

        log.info("Generated {} payout statements for period {} to {}", results.size(), periodStart, periodEnd);
        return results;
    }

    @Override
    @Transactional
    public List<PayoutStatementResponse> generateCurrentCycleStatements() {
        LocalDate today = LocalDate.now();
        // Generate for the most recently COMPLETED billing cycle (26th→25th)
        LocalDate periodStart;
        LocalDate periodEnd;

        if (today.getDayOfMonth() >= 26) {
            // After the 26th: last completed cycle ended on the 25th of this month
            periodStart = today.minusMonths(1).withDayOfMonth(26);
            periodEnd = today.withDayOfMonth(25);
        } else {
            // Before the 26th: last completed cycle ended on the 25th of previous month
            periodStart = today.minusMonths(2).withDayOfMonth(26);
            periodEnd = today.minusMonths(1).withDayOfMonth(25);
        }

        return generateStatementsForPeriod(periodStart, periodEnd);
    }

    /**
     * Calculate commission for a booking based on hotel's commission settings.
     * Hotel entity stores commissionValue, commissionType, rateType.
     */
    private BigDecimal calculateCommission(BigDecimal grossAmount, Hotel hotel) {
        if (hotel.getCommissionValue() == null || grossAmount == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal commissionValue = hotel.getCommissionValue();
        String rateType = hotel.getRateType();

        if ("PERCENT".equalsIgnoreCase(rateType)) {
            return grossAmount.multiply(commissionValue)
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        } else {
            // FIXED amount per booking
            return commissionValue;
        }
    }

    // ---- UC-070: Hotel Owner methods ----

    @Override
    @Transactional(readOnly = true)
    public List<PayoutStatementResponse> getHotelStatements(Integer hotelId) {
        List<PayoutStatement> statements = statementRepository.findByHotelId(hotelId);
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));
        return statements.stream()
                .map(s -> toResponse(s, hotel.getHotelName(), false))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PayoutStatementResponse getStatementDetail(Long statementId) {
        PayoutStatement stmt = statementRepository.findById(statementId)
                .orElseThrow(() -> new AppException(ErrorCode.STATEMENT_NOT_FOUND));
        Hotel hotel = hotelRepository.findById(stmt.getHotelId())
                .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));

        List<PayoutLineItem> items = lineItemRepository.findByStatementId(statementId);
        PayoutStatementResponse response = toResponse(stmt, hotel.getHotelName(), true);
        response.setLineItems(items.stream().map(this::toLineItemResponse).collect(Collectors.toList()));
        return response;
    }

    @Override
    @Transactional
    public PayoutStatementResponse confirmPayout(ConfirmPayoutRequest request) {
        PayoutStatement stmt = statementRepository.findById(request.getStatementId())
                .orElseThrow(() -> new AppException(ErrorCode.STATEMENT_NOT_FOUND));

        // BR-FIN-01: Only PENDING_CONFIRMATION can be confirmed
        if (!"PENDING_CONFIRMATION".equals(stmt.getStatus())) {
            if ("PAID".equals(stmt.getStatus())) {
                throw new AppException(ErrorCode.STATEMENT_ALREADY_PAID);
            }
            throw new AppException(ErrorCode.STATEMENT_INVALID_STATUS);
        }

        // BR-FIN-02: Confirm window is 3rd–5th of the month only
        int dayOfMonth = LocalDate.now().getDayOfMonth();
        if (dayOfMonth < 3 || dayOfMonth > 5) {
            throw new AppException(ErrorCode.STATEMENT_CONFIRM_WINDOW_CLOSED);
        }

        String userId = getCurrentUserId();

        stmt.setStatus("APPROVED");
        stmt.setConfirmedBy(userId);
        stmt.setConfirmedAt(LocalDateTime.now());
        statementRepository.save(stmt);

        Hotel hotel = hotelRepository.findById(stmt.getHotelId())
                .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));

        List<Users> admins = userRepository.findByIsAdminTrue();
        for (Users admin : admins) {
            notificationService.sendNotification(admin.getId(), "FINANCIAL",
                    "Xác nhận thanh toán thành công",
                    "Bảng sao kê thanh toán của khách sạn " + hotel.getHotelName() + " đã được xác nhận.",
                    "PAYOUT", String.valueOf(stmt.getStatementId()), "/admin/payout-list");
        }
        return toResponse(stmt, hotel.getHotelName(), false);
    }

    @Override
    @Transactional
    public PayoutStatementResponse disputePayout(DisputePayoutRequest request) {
        PayoutStatement stmt = statementRepository.findById(request.getStatementId())
                .orElseThrow(() -> new AppException(ErrorCode.STATEMENT_NOT_FOUND));

        if (!"PENDING_CONFIRMATION".equals(stmt.getStatus()) && !"DRAFT".equals(stmt.getStatus())) {
            throw new AppException(ErrorCode.STATEMENT_INVALID_STATUS);
        }

        stmt.setStatus("DISPUTED");
//        stmt.setDisputeReasonCode(request.getReasonCode());
//        stmt.setDisputeReason(request.getDescription());
        statementRepository.save(stmt);

        Hotel hotel = hotelRepository.findById(stmt.getHotelId())
                .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));

        List<Users> admins = userRepository.findByIsAdminTrue();
        for (Users admin : admins) {
            notificationService.sendNotification(admin.getId(), "FINANCIAL",
                    "Phát sinh khiếu nại thanh toán",
                    "Bảng sao kê thanh toán của khách sạn " + hotel.getHotelName()
                            + " đã bị khiếu nại. Lý do: " + request.getReasonCode(),
                    "PAYOUT", String.valueOf(stmt.getStatementId()), "/admin/payout-list");
        }
        return toResponse(stmt, hotel.getHotelName(), false);
    }

    // ---- UC-088: Admin methods ----

    @Override
    @Transactional(readOnly = true)
    public PayoutListResponse getPayoutList(PayoutListRequest request) {
        List<PayoutStatement> statements;

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            statements = statementRepository.findByStatus(request.getStatus());
        } else if (request.getPeriodStart() != null && request.getPeriodEnd() != null) {
            statements = statementRepository.findByPeriod(request.getPeriodStart(), request.getPeriodEnd());
        } else {
            statements = statementRepository.findAll();
        }

        // Filter by hotelId if specified
        if (request.getHotelId() != null) {
            statements = statements.stream()
                    .filter(s -> s.getHotelId().equals(request.getHotelId()))
                    .collect(Collectors.toList());
        }

        // Exclude disputed statements (per UC-088 assumptions)
        statements = statements.stream()
                .filter(s -> !"DISPUTED".equals(s.getStatus()))
                .collect(Collectors.toList());

        // Batch fetch hotels
        Set<Integer> hotelIds = statements.stream()
                .map(PayoutStatement::getHotelId)
                .collect(Collectors.toSet());
        Map<Integer, Hotel> hotelMap = hotelRepository.findAllById(hotelIds).stream()
                .collect(Collectors.toMap(Hotel::getHotelId, h -> h));

        List<PayoutListItemResponse> payoutItems = new ArrayList<>();
        BigDecimal totalLiability = BigDecimal.ZERO;
        int pendingCount = 0,readyCount = 0, processingCount = 0, paidCount = 0, blockedCount = 0;

        for (PayoutStatement s : statements) {
            Hotel hotel = hotelMap.get(s.getHotelId());
            String hotelName = hotel != null ? hotel.getHotelName() : "Unknown";

            // UC-088.E1: Missing bank info detection
            boolean missingBankInfo = (hotel == null || hotel.getEmail() == null);

            PayoutListItemResponse item = PayoutListItemResponse.builder()
                    .statementId(s.getStatementId())
                    .statementCode(s.getStatementCode())
                    .hotelId(s.getHotelId())
                    .hotelName(hotelName)
                    .periodStart(s.getPeriodStart())
                    .periodEnd(s.getPeriodEnd())
                    .grossRevenue(s.getGrossRevenue())
                    .totalCommission(s.getTotalCommission())
                    .netPayout(s.getNetPayout())
                    .totalBookings(s.getTotalBookings())
                    .status(s.getStatus())
                    .missingBankInfo(missingBankInfo)
                    .confirmedAt(s.getConfirmedAt())
                    .paidAt(s.getPaidAt())
                    .build();

            payoutItems.add(item);

            // Aggregate summary
            if ("APPROVED".equals(s.getStatus()) || "PROCESSING".equals(s.getStatus())) {
                totalLiability = totalLiability.add(
                        s.getNetPayout() != null ? s.getNetPayout() : BigDecimal.ZERO);
            }

            switch (s.getStatus()) {
                case "PENDING_CONFIRMATION" -> pendingCount++;
                case "APPROVED" -> readyCount++;
                case "PROCESSING" -> processingCount++;
                case "PAID" -> paidCount++;
                case "ROLLOVER" -> blockedCount++;
                default -> {}
            }
        }

        return PayoutListResponse.builder()
                .payouts(payoutItems)
                .totalPayoutLiability(totalLiability)
                .totalRecords(statements.size())
                .pendingCount(pendingCount)
                .readyCount(readyCount)
                .processingCount(processingCount)
                .paidCount(paidCount)
                .blockedCount(blockedCount)
                .build();
    }

    @Override
    @Transactional
    public List<PayoutStatementResponse> markAsPaid(MarkAsPaidRequest request) {
        String adminUserId = getCurrentUserId();
        List<PayoutStatementResponse> results = new ArrayList<>();

        for (Long id : request.getStatementIds()) {
            PayoutStatement stmt = statementRepository.findById(id)
                    .orElseThrow(() -> new AppException(ErrorCode.STATEMENT_NOT_FOUND));

            if (!"APPROVED".equals(stmt.getStatus())) {
                throw new AppException(ErrorCode.STATEMENT_INVALID_STATUS);
            }

            stmt.setStatus("PAID");
            stmt.setBankReference(request.getBankReference());
            stmt.setPaidAt(LocalDateTime.now());
            stmt.setPaidBy(adminUserId);
            statementRepository.save(stmt);

            Hotel hotel = hotelRepository.findById(stmt.getHotelId())
                    .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));
            results.add(toResponse(stmt, hotel.getHotelName(), false));

            List<Users> hotelUsers = userRepository.findByHotel_HotelId(stmt.getHotelId());
            for (Users u : hotelUsers) {
                notificationService.sendNotification(u.getId(), "FINANCIAL",
                        "Thanh toán đã được chuyển",
                        "Khoản thanh toán cho bảng sao kê " + stmt.getStatementCode() + " đã được chuyển.",
                        "PAYOUT", String.valueOf(stmt.getStatementId()), "/hotel/payout-state");
            }
            // UC-088.2: Send "Payment Sent" email to Hotel
            if (hotel.getEmail() != null && !hotel.getEmail().isBlank()) {
                try {
                    emailService.sendPaymentSentNotification(
                            hotel.getEmail(),
                            hotel.getHotelName(),
                            stmt.getStatementCode(),
                            stmt.getNetPayout(),
                            request.getBankReference()
                    );
                } catch (Exception e) {
                    log.error("Failed to send payment notification for statement {}", stmt.getStatementCode(), e);
                }
            }
        }
        return results;
    }

//    @Override
//    @Transactional
//    public List<PayoutStatementResponse> exportBatchPayment(List<Long> statementIds) {
//        List<PayoutStatementResponse> results = new ArrayList<>();
//
//        for (Long id : statementIds) {
//            PayoutStatement stmt = statementRepository.findById(id)
//                    .orElseThrow(() -> new AppException(ErrorCode.STATEMENT_NOT_FOUND));
//
//            if (!"APPROVED".equals(stmt.getStatus())) {
//                throw new AppException(ErrorCode.STATEMENT_INVALID_STATUS);
//            }
//
//            // UC-088.E2: Below minimum threshold — mark as ROLLOVER
//            if (stmt.getNetPayout() != null
//                    && stmt.getNetPayout().compareTo(MIN_PAYOUT_THRESHOLD) < 0) {
//                stmt.setStatus("ROLLOVER");
//            } else {
//                stmt.setStatus("PROCESSING");
//            }
//            statementRepository.save(stmt);
//
//            Hotel hotel = hotelRepository.findById(stmt.getHotelId())
//                    .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));
//            results.add(toResponse(stmt, hotel.getHotelName(), false));
//        }
//        return results;
//    }

    // ---- Helpers ----

    private PayoutStatementResponse toResponse(PayoutStatement s, String hotelName, boolean includeItems) {
        return PayoutStatementResponse.builder()
                .statementId(s.getStatementId())
                .statementCode(s.getStatementCode())
                .hotelId(s.getHotelId())
                .hotelName(hotelName)
                .periodStart(s.getPeriodStart())
                .periodEnd(s.getPeriodEnd())
                .grossRevenue(s.getGrossRevenue())
                .totalCommission(s.getTotalCommission())
                .totalRefunds(s.getTotalRefunds())
                .adjustments(s.getAdjustments())
                .netPayout(s.getNetPayout())
                .totalBookings(s.getTotalBookings())
                .totalRoomNights(s.getTotalRoomNights())
                .status(s.getStatus())
                .confirmedBy(s.getConfirmedBy())
                .confirmedAt(s.getConfirmedAt())
//                .disputeReason(s.getDisputeReason())
//                .disputeReasonCode(s.getDisputeReasonCode())
                .bankReference(s.getBankReference())
                .paidAt(s.getPaidAt())
                .createdAt(s.getCreatedAt())
                .build();
    }

    private PayoutLineItemResponse toLineItemResponse(PayoutLineItem item) {
        return PayoutLineItemResponse.builder()
                .lineItemId(item.getLineItemId())
                .bookingId(item.getBookingId())
                .bookingCode(item.getBookingCode())
                .agencyName(item.getAgencyName())
                .checkInDate(item.getCheckInDate())
                .checkOutDate(item.getCheckOutDate())
                .roomNights(item.getRoomNights())
                .grossAmount(item.getGrossAmount())
                .commissionAmount(item.getCommissionAmount())
                .refundAmount(item.getRefundAmount())
                .netAmount(item.getNetAmount())
                .build();
    }

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Jwt jwt = (Jwt) authentication.getPrincipal();
        return jwt.getClaim("userId");
    }
}
