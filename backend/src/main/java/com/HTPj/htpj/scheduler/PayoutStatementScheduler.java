package com.HTPj.htpj.scheduler;

import com.HTPj.htpj.dto.response.financial.PayoutStatementResponse;
import com.HTPj.htpj.entity.Hotel;
import com.HTPj.htpj.repository.HotelRepository;
import com.HTPj.htpj.service.EmailService;
import com.HTPj.htpj.service.PayoutStatementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class PayoutStatementScheduler {

    private final PayoutStatementService payoutStatementService;
    private final HotelRepository hotelRepository;
    private final EmailService emailService;

    /**
     * Auto-generate payout statements on the 26th of every month at 00:05 AM.
     * Billing cycle: 26th of previous month -> 25th of current month.
     * Cron: second minute hour day-of-month month day-of-week
     */
    @Scheduled(cron = "0 5 0 26 * ?")
    public void generateMonthlyPayoutStatements() {
        log.info("=== SCHEDULED: Starting monthly payout statement generation ===");

        try {
            LocalDate today = LocalDate.now(); // Should be the 26th
            LocalDate periodStart = today.minusMonths(1).withDayOfMonth(26);
            LocalDate periodEnd = today.withDayOfMonth(25);

            List<PayoutStatementResponse> statements =
                    payoutStatementService.generateStatementsForPeriod(periodStart, periodEnd);

            log.info("Generated {} payout statements for period {} to {}",
                    statements.size(), periodStart, periodEnd);

            // Send email notifications to each hotel
            for (PayoutStatementResponse stmt : statements) {
                try {
                    Hotel hotel = hotelRepository.findById(stmt.getHotelId()).orElse(null);
                    if (hotel != null && hotel.getEmail() != null && !hotel.getEmail().isBlank()) {
                        emailService.sendPayoutStatementNotification(
                                hotel.getEmail(),
                                hotel.getHotelName(),
                                stmt.getStatementCode(),
                                stmt.getPeriodStart(),
                                stmt.getPeriodEnd(),
                                stmt.getGrossRevenue(),
                                stmt.getTotalCommission(),
                                stmt.getNetPayout(),
                                stmt.getTotalBookings()
                        );
                        log.info("Sent payout statement email to {} for hotel {}",
                                hotel.getEmail(), hotel.getHotelName());
                    }
                } catch (Exception e) {
                    log.error("Failed to send email for statement {}: {}",
                            stmt.getStatementCode(), e.getMessage());
                }
            }

            log.info("=== SCHEDULED: Monthly payout statement generation completed ===");
        } catch (Exception e) {
            log.error("=== SCHEDULED: Error during monthly payout statement generation ===", e);
        }
    }
}
