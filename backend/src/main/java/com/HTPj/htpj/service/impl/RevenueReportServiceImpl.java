package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.financial.RevenueReportRequest;
import com.HTPj.htpj.dto.response.financial.RevenueReportResponse;
import com.HTPj.htpj.dto.response.financial.RevenueReportResponse.*;
import com.HTPj.htpj.entity.Booking;
import com.HTPj.htpj.entity.BookingDetail;
import com.HTPj.htpj.entity.RoomType;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.repository.BookingRepository;
import com.HTPj.htpj.repository.RoomTypeRepository;
import com.HTPj.htpj.service.RevenueReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.time.temporal.IsoFields;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RevenueReportServiceImpl implements RevenueReportService {

    private final BookingRepository bookingRepository;
    private final RoomTypeRepository roomTypeRepository;

    private static final List<String> REVENUE_STATUSES = List.of(
            "BOOKED", "CHECKED_IN", "COMPLETED", "CANCELLED", "NO_SHOW"
    );
    private static final int MAX_DAILY_RANGE_DAYS = 365;

    @Override
    public RevenueReportResponse generateReport(RevenueReportRequest request) {
        validateRequest(request);

        LocalDate start = request.getStartDate();
        LocalDate end = request.getEndDate();
        String granularity = request.getGranularity() != null ? request.getGranularity() : "DAILY";

        // Fetch bookings for the hotel within the consumption date range
        List<Booking> bookings = fetchRevenueBookings(request);
        List<RoomType> roomTypes = roomTypeRepository.findByHotel_HotelId(request.getHotelId());

        // Calculate total physical room-nights available in the period
        long daysInPeriod = ChronoUnit.DAYS.between(start, end) + 1;
        int totalPhysicalRooms = roomTypes.stream()
                .mapToInt(rt -> rt.getTotalRooms() != null ? rt.getTotalRooms() : 0)
                .sum();
        int totalRoomNightsAvailable = (int) (totalPhysicalRooms * daysInPeriod);

        // Build current period summary
        RevenueSummary summary = buildSummary(bookings, totalRoomNightsAvailable);

        // Build previous period for comparison
        long periodLength = ChronoUnit.DAYS.between(start, end) + 1;
        LocalDate prevStart = start.minusDays(periodLength);
        LocalDate prevEnd = start.minusDays(1);

        RevenueReportRequest prevRequest = new RevenueReportRequest();
        prevRequest.setHotelId(request.getHotelId());
        prevRequest.setStartDate(prevStart);
        prevRequest.setEndDate(prevEnd);
        prevRequest.setAgencyId(request.getAgencyId());
        prevRequest.setSource(request.getSource());

        List<Booking> prevBookings = fetchRevenueBookings(prevRequest);
        int prevRoomNightsAvailable = (int) (totalPhysicalRooms * periodLength);
        RevenueSummary prevSummary = buildSummary(prevBookings, prevRoomNightsAvailable);

        // Calculate growth percentages
        summary.setPreviousPeriodRevenue(prevSummary.getTotalRevenue());
        summary.setPreviousPeriodBookings(prevSummary.getTotalBookings());
        summary.setRevenueGrowthPercent(calcGrowth(summary.getTotalRevenue(), prevSummary.getTotalRevenue()));
        summary.setOccupancyGrowthPercent(calcGrowthDouble(summary.getOccupancyRate(), prevSummary.getOccupancyRate()));
        summary.setAdrGrowthPercent(calcGrowth(summary.getAdr(), prevSummary.getAdr()));
        summary.setRevParGrowthPercent(calcGrowth(summary.getRevPar(), prevSummary.getRevPar()));

        // Build trend data
        List<RevenueTrendItem> trend = buildTrend(bookings, start, end, granularity,
                totalPhysicalRooms);

        // Revenue by room type
        List<RevenueByRoomType> byRoomType = buildByRoomType(bookings, roomTypes);

        return RevenueReportResponse.builder()
                .summary(summary)
                .trend(trend)
                .byRoomType(byRoomType)
                .build();
    }

    private void validateRequest(RevenueReportRequest request) {
        if (request.getStartDate() == null || request.getEndDate() == null) {
            throw new AppException(ErrorCode.REPORT_INVALID_DATE_RANGE);
        }
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new AppException(ErrorCode.REPORT_INVALID_DATE_RANGE);
        }
        String gran = request.getGranularity() != null ? request.getGranularity() : "DAILY";
        long days = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
        if ("DAILY".equalsIgnoreCase(gran) && days > MAX_DAILY_RANGE_DAYS) {
            throw new AppException(ErrorCode.REPORT_DATE_RANGE_TOO_LARGE);
        }
    }

    /**
     * Fetch bookings based on consumption date (accrual basis: checkout dates overlap the range).
     * Excludes CANCELLED/NO_SHOW unless there's a penalty fee.
     */
    private List<Booking> fetchRevenueBookings(RevenueReportRequest request) {
        List<Booking> all = bookingRepository.findAll();

        return all.stream()
                .filter(b -> b.getHotelId().equals(request.getHotelId()))
                .filter(b -> REVENUE_STATUSES.contains(b.getBookingStatus()))
                // Consumption date overlap: booking stay overlaps [start, end]
                .filter(b -> !b.getCheckOutDate().isBefore(request.getStartDate())
                        && !b.getCheckInDate().isAfter(request.getEndDate()))
                .filter(b -> request.getAgencyId() == null
                        || b.getAgencyId().equals(request.getAgencyId()))
                .collect(Collectors.toList());
    }

    /**
     * Get earned amount for a booking based on status:
     * - CANCELLED: hotel earns only the penalty
     * - NO_SHOW: hotel keeps the full amount (no refund)
     * - Others: finalAmount
     */
    private BigDecimal getEarnedAmount(Booking b) {
        if ("CANCELLED".equalsIgnoreCase(b.getBookingStatus())) {
            return b.getCancellationPenalty() != null ? b.getCancellationPenalty() : BigDecimal.ZERO;
        }
        return b.getFinalAmount() != null ? b.getFinalAmount() : BigDecimal.ZERO;
    }

    private RevenueSummary buildSummary(List<Booking> bookings, int totalRoomNightsAvailable) {
        BigDecimal totalRevenue = bookings.stream()
                .map(this::getEarnedAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalBookings = bookings.size();

        int totalRoomNightsSold = bookings.stream()
                .mapToInt(b -> {
                    int nights = b.getNights() != null ? b.getNights() : 0;
                    int rooms = b.getTotalRooms() != null ? b.getTotalRooms() : 1;
                    return nights * rooms;
                })
                .sum();

        // BR-RPT-01: KPI Calculations
        double occupancyRate = totalRoomNightsAvailable > 0
                ? (double) totalRoomNightsSold / totalRoomNightsAvailable * 100
                : 0.0;

        BigDecimal adr = totalRoomNightsSold > 0
                ? totalRevenue.divide(BigDecimal.valueOf(totalRoomNightsSold), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal revPar = totalRoomNightsAvailable > 0
                ? totalRevenue.divide(BigDecimal.valueOf(totalRoomNightsAvailable), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return RevenueSummary.builder()
                .totalRevenue(totalRevenue)
                .totalBookings(totalBookings)
                .totalRoomNightsSold(totalRoomNightsSold)
                .totalRoomNightsAvailable(totalRoomNightsAvailable)
                .occupancyRate(Math.round(occupancyRate * 100.0) / 100.0)
                .adr(adr)
                .revPar(revPar)
                .build();
    }

    private List<RevenueTrendItem> buildTrend(List<Booking> bookings, LocalDate start,
                                               LocalDate end, String granularity,
                                               int totalPhysicalRooms) {
        Map<String, List<Booking>> grouped = new LinkedHashMap<>();

        // Pre-populate buckets to show zero-data periods
        if ("MONTHLY".equalsIgnoreCase(granularity)) {
            LocalDate cursor = start.withDayOfMonth(1);
            while (!cursor.isAfter(end)) {
                grouped.put(cursor.getYear() + "-" + String.format("%02d", cursor.getMonthValue()),
                        new ArrayList<>());
                cursor = cursor.plusMonths(1);
            }
        } else if ("WEEKLY".equalsIgnoreCase(granularity)) {
            LocalDate cursor = start;
            while (!cursor.isAfter(end)) {
                String weekKey = cursor.getYear() + "-W" + String.format("%02d",
                        cursor.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR));
                grouped.putIfAbsent(weekKey, new ArrayList<>());
                cursor = cursor.plusWeeks(1);
            }
        } else { // DAILY
            LocalDate cursor = start;
            while (!cursor.isAfter(end)) {
                grouped.put(cursor.toString(), new ArrayList<>());
                cursor = cursor.plusDays(1);
            }
        }

        // Assign bookings to buckets based on check-in date (consumption start)
        for (Booking b : bookings) {
            String key = getPeriodKey(b.getCheckInDate(), granularity);
            grouped.computeIfAbsent(key, k -> new ArrayList<>()).add(b);
        }

        List<RevenueTrendItem> items = new ArrayList<>();
        for (Map.Entry<String, List<Booking>> entry : grouped.entrySet()) {
            List<Booking> periodBookings = entry.getValue();
            BigDecimal revenue = periodBookings.stream()
                    .map(this::getEarnedAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            int roomNightsSold = periodBookings.stream()
                    .mapToInt(b -> {
                        int nights = b.getNights() != null ? b.getNights() : 0;
                        int rooms = b.getTotalRooms() != null ? b.getTotalRooms() : 1;
                        return nights * rooms;
                    })
                    .sum();

            int periodDays = getPeriodDays(entry.getKey(), granularity, start, end);
            int periodAvailable = totalPhysicalRooms * periodDays;
            double occ = periodAvailable > 0
                    ? (double) roomNightsSold / periodAvailable * 100 : 0.0;

            items.add(RevenueTrendItem.builder()
                    .period(entry.getKey())
                    .revenue(revenue)
                    .bookings(periodBookings.size())
                    .roomNightsSold(roomNightsSold)
                    .occupancyRate(Math.round(occ * 100.0) / 100.0)
                    .build());
        }
        return items;
    }

    private List<RevenueByRoomType> buildByRoomType(List<Booking> bookings,
                                                     List<RoomType> roomTypes) {
        BigDecimal totalRevenue = bookings.stream()
                .map(this::getEarnedAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Aggregate per room type from booking details
        Map<Integer, BigDecimal> revenueMap = new HashMap<>();
        Map<Integer, Integer> nightsMap = new HashMap<>();

        for (Booking b : bookings) {
            if (b.getBookingDetails() == null) continue;
            for (BookingDetail bd : b.getBookingDetails()) {
                Integer rtId = bd.getRoomType().getRoomTypeId();
                BigDecimal amount = bd.getTotalAmount() != null ? bd.getTotalAmount() : BigDecimal.ZERO;
                int nights = bd.getNights() != null ? bd.getNights() : 0;
                int qty = bd.getQuantity() != null ? bd.getQuantity() : 1;

                revenueMap.merge(rtId, amount, BigDecimal::add);
                nightsMap.merge(rtId, nights * qty, Integer::sum);
            }
        }

        List<RevenueByRoomType> result = new ArrayList<>();
        for (RoomType rt : roomTypes) {
            BigDecimal rev = revenueMap.getOrDefault(rt.getRoomTypeId(), BigDecimal.ZERO);
            int nights = nightsMap.getOrDefault(rt.getRoomTypeId(), 0);
            double contribution = totalRevenue.compareTo(BigDecimal.ZERO) > 0
                    ? rev.divide(totalRevenue, 4, RoundingMode.HALF_UP).doubleValue() * 100
                    : 0.0;

            result.add(RevenueByRoomType.builder()
                    .roomTypeId(rt.getRoomTypeId())
                    .roomTypeName(rt.getRoomTitle())
                    .revenue(rev)
                    .roomNightsSold(nights)
                    .contribution(Math.round(contribution * 100.0) / 100.0)
                    .build());
        }
        return result;
    }

    private String getPeriodKey(LocalDate date, String granularity) {
        if ("MONTHLY".equalsIgnoreCase(granularity)) {
            return date.getYear() + "-" + String.format("%02d", date.getMonthValue());
        } else if ("WEEKLY".equalsIgnoreCase(granularity)) {
            return date.getYear() + "-W" + String.format("%02d",
                    date.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR));
        }
        return date.toString();
    }

    private int getPeriodDays(String key, String granularity, LocalDate rangeStart, LocalDate rangeEnd) {
        if ("MONTHLY".equalsIgnoreCase(granularity)) {
            return 30; // approximation
        } else if ("WEEKLY".equalsIgnoreCase(granularity)) {
            return 7;
        }
        return 1;
    }

    private Double calcGrowth(BigDecimal current, BigDecimal previous) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) return null;
        return current.subtract(previous)
                .divide(previous, 4, RoundingMode.HALF_UP)
                .doubleValue() * 100;
    }

    private Double calcGrowthDouble(Double current, Double previous) {
        if (previous == null || previous == 0.0) return null;
        return ((current - previous) / previous) * 100;
    }
}
