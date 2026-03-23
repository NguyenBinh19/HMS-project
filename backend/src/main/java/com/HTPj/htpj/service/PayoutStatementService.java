package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.financial.ConfirmPayoutRequest;
import com.HTPj.htpj.dto.request.financial.DisputePayoutRequest;
import com.HTPj.htpj.dto.request.financial.MarkAsPaidRequest;
import com.HTPj.htpj.dto.request.financial.PayoutListRequest;
import com.HTPj.htpj.dto.response.financial.PayoutListResponse;
import com.HTPj.htpj.dto.response.financial.PayoutStatementResponse;

import java.util.List;

public interface PayoutStatementService {

    // UC-070: Hotel views their settlement statements
    List<PayoutStatementResponse> getHotelStatements(Integer hotelId);

    // UC-070: Hotel views statement detail
    PayoutStatementResponse getStatementDetail(Long statementId);

    // UC-070: Hotel confirms payout (BR-FIN-01)
    PayoutStatementResponse confirmPayout(ConfirmPayoutRequest request);

    // UC-070: Hotel disputes a statement
    PayoutStatementResponse disputePayout(DisputePayoutRequest request);

    // UC-088: Admin views payout list
    PayoutListResponse getPayoutList(PayoutListRequest request);

    // UC-088: Admin marks payouts as paid
    List<PayoutStatementResponse> markAsPaid(MarkAsPaidRequest request);

    // UC-088: Admin exports batch payment file — updates status to PROCESSING
    List<PayoutStatementResponse> exportBatchPayment(List<Long> statementIds);
}
