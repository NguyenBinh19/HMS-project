package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.financial.ConfirmPayoutRequest;
import com.HTPj.htpj.dto.request.financial.DisputePayoutRequest;
import com.HTPj.htpj.dto.request.financial.MarkAsPaidRequest;
import com.HTPj.htpj.dto.request.financial.PayoutListRequest;
import com.HTPj.htpj.dto.response.financial.PayoutLineItemResponse;
import com.HTPj.htpj.dto.response.financial.PayoutListItemResponse;
import com.HTPj.htpj.dto.response.financial.PayoutListResponse;
import com.HTPj.htpj.dto.response.financial.PayoutStatementResponse;
import com.HTPj.htpj.entity.Hotel;
import com.HTPj.htpj.entity.PayoutLineItem;
import com.HTPj.htpj.entity.PayoutStatement;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.repository.HotelRepository;
import com.HTPj.htpj.repository.PayoutLineItemRepository;
import com.HTPj.htpj.repository.PayoutStatementRepository;
import com.HTPj.htpj.service.PayoutStatementService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PayoutStatementServiceImpl implements PayoutStatementService {

    private final PayoutStatementRepository statementRepository;
    private final PayoutLineItemRepository lineItemRepository;
    private final HotelRepository hotelRepository;

    private static final BigDecimal MIN_PAYOUT_THRESHOLD = new BigDecimal("50");

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

        String userId = getCurrentUserId();

        stmt.setStatus("APPROVED");
        stmt.setConfirmedBy(userId);
        stmt.setConfirmedAt(LocalDateTime.now());
        statementRepository.save(stmt);

        Hotel hotel = hotelRepository.findById(stmt.getHotelId())
                .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));

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
        stmt.setDisputeReasonCode(request.getReasonCode());
        stmt.setDisputeReason(request.getDescription());
        statementRepository.save(stmt);

        Hotel hotel = hotelRepository.findById(stmt.getHotelId())
                .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));

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
        int readyCount = 0, processingCount = 0, paidCount = 0, blockedCount = 0;

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

            if (!"PROCESSING".equals(stmt.getStatus())) {
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
        }
        return results;
    }

    @Override
    @Transactional
    public List<PayoutStatementResponse> exportBatchPayment(List<Long> statementIds) {
        List<PayoutStatementResponse> results = new ArrayList<>();

        for (Long id : statementIds) {
            PayoutStatement stmt = statementRepository.findById(id)
                    .orElseThrow(() -> new AppException(ErrorCode.STATEMENT_NOT_FOUND));

            if (!"APPROVED".equals(stmt.getStatus())) {
                throw new AppException(ErrorCode.STATEMENT_INVALID_STATUS);
            }

            // UC-088.E2: Below minimum threshold — mark as ROLLOVER
            if (stmt.getNetPayout() != null
                    && stmt.getNetPayout().compareTo(MIN_PAYOUT_THRESHOLD) < 0) {
                stmt.setStatus("ROLLOVER");
            } else {
                stmt.setStatus("PROCESSING");
            }
            statementRepository.save(stmt);

            Hotel hotel = hotelRepository.findById(stmt.getHotelId())
                    .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));
            results.add(toResponse(stmt, hotel.getHotelName(), false));
        }
        return results;
    }

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
                .disputeReason(s.getDisputeReason())
                .disputeReasonCode(s.getDisputeReasonCode())
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
