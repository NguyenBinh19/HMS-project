package com.HTPj.htpj.scheduler;

import com.HTPj.htpj.dto.response.financial.PayoutStatementResponse;
import com.HTPj.htpj.entity.Hotel;
import com.HTPj.htpj.entity.PayoutStatement;
import com.HTPj.htpj.repository.HotelRepository;
import com.HTPj.htpj.repository.PayoutStatementRepository;
import com.HTPj.htpj.service.EmailService;
import com.HTPj.htpj.service.NotificationService;
import com.HTPj.htpj.service.PayoutStatementService;
import com.HTPj.htpj.entity.Users;
import com.HTPj.htpj.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class PayoutStatementScheduler {

    private final PayoutStatementService payoutStatementService;
    private final PayoutStatementRepository statementRepository;
    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    /**
     * Auto-generate payout statements on the 3rd of every month at 00:05 AM.
     * Billing cycle: 26th of two months ago -> 25th of previous month.
     * Example: On March 3rd, generates for Jan 26 -> Feb 25.
     */
    @Scheduled(cron = "0 5 0 3 * ?")
    public void generateMonthlyPayoutStatements() {
        log.info("=== SCHEDULED: Starting monthly payout statement generation ===");

        try {
            LocalDate today = LocalDate.now(); // Should be the 3rd
            LocalDate periodStart = today.minusMonths(2).withDayOfMonth(26);
            LocalDate periodEnd = today.minusMonths(1).withDayOfMonth(25);

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

    /**
     * Auto-approve all PENDING_CONFIRMATION statements on the 6th of every month at 00:05 AM.
     * Hotels have a 3-day confirm window (3rd-5th). After that, statements are auto-approved.
     */
    @Scheduled(cron = "0 5 0 6 * ?")
    @Transactional
    public void autoApproveUnconfirmedStatements() {
        log.info("=== SCHEDULED: Auto-approving unconfirmed payout statements ===");

        try {
            List<PayoutStatement> pending = statementRepository.findByStatus("PENDING_CONFIRMATION");

            int count = 0;
            for (PayoutStatement stmt : pending) {
                stmt.setStatus("APPROVED");
                stmt.setConfirmedBy("SYSTEM_AUTO_APPROVE");
                stmt.setConfirmedAt(LocalDateTime.now());
                statementRepository.save(stmt);
                count++;

                // Notify hotel users
                List<Users> hotelUsers = userRepository.findByHotel_HotelId(stmt.getHotelId());
                Hotel hotel = hotelRepository.findById(stmt.getHotelId()).orElse(null);
                String hotelName = hotel != null ? hotel.getHotelName() : "Unknown";

                for (Users u : hotelUsers) {
                    notificationService.sendNotification(u.getId(), "FINANCIAL",
                            "Bảng sao kê đã được tự động xác nhận",
                            "Bảng sao kê " + stmt.getStatementCode() + " của khách sạn " + hotelName
                                    + " đã được tự động xác nhận do hết thời hạn xác nhận (3-5 hàng tháng).",
                            "PAYOUT", String.valueOf(stmt.getStatementId()), "/hotel/payout-state");
                }
            }

            log.info("=== SCHEDULED: Auto-approved {} statements ===", count);
        } catch (Exception e) {
            log.error("=== SCHEDULED: Error during auto-approve ===", e);
        }
    }
}
