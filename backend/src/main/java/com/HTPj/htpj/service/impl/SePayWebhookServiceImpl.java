package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.entity.TransactionHistory;
import com.HTPj.htpj.repository.AgencyRepository;
import com.HTPj.htpj.repository.TransactionHistoryRepository;
import com.HTPj.htpj.service.SePayWebhookService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class SePayWebhookServiceImpl implements SePayWebhookService {

    private final AgencyRepository agencyRepo;
    private final TransactionHistoryRepository transactionHistoryRepository;

    @Override
    public void processWebhook(Map<String, Object> payload) {
        LocalDateTime txDate = LocalDateTime.parse(
                payload.get("transactionDate").toString(),
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
        );
        BigDecimal amount = new BigDecimal(payload.get("transferAmount").toString());
        String content = (String) payload.get("content");

        Pattern p = Pattern.compile("NAP\\s*(\\d+)");
        Matcher m = p.matcher(content);
        if (m.find()) {
            Long agencyId = Long.parseLong(m.group(1));
            agencyRepo.findById(agencyId).ifPresent(agency -> {
                BigDecimal currentBalance = agency.getWalletBalance() != null
                        ? agency.getWalletBalance()
                        : BigDecimal.ZERO;
                BigDecimal newBalance = currentBalance.add(amount);
                agency.setWalletBalance(newBalance);
                agencyRepo.save(agency);

                TransactionHistory history = TransactionHistory.builder()
                        .transactionDate(txDate)
                        .transactionType("Top-up")
                        .description("Nạp tiền qua SePay")
                        .sourceType("Wallet")
                        .amount(amount)
                        .balanceAfter(newBalance)
                        .status("Success")
                        .direction("IN")
                        .agency(agency)
                        .createdAt(LocalDateTime.now())
                        .build();

                history = transactionHistoryRepository.save(history);
                history.setTransactionCode(String.format("TRK-%06d", history.getId()));
                transactionHistoryRepository.save(history);
            });
        }
    }
}

