package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.commission.CreateCommissionRequest;
import com.HTPj.htpj.dto.request.commission.DeleteCommissionRequest;
import com.HTPj.htpj.dto.response.commision.CommissionDetailResponse;
import com.HTPj.htpj.dto.response.commision.CommissionResponse;
import com.HTPj.htpj.entity.Commission;
import com.HTPj.htpj.entity.CommissionHotel;
import com.HTPj.htpj.entity.Hotel;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.repository.CommissionHotelRepository;
import com.HTPj.htpj.repository.CommissionLogRepository;
import com.HTPj.htpj.repository.CommissionRepository;
import com.HTPj.htpj.repository.HotelRepository;
import com.HTPj.htpj.service.CommissionService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CommissionServiceImpl implements CommissionService {

    CommissionRepository commissionRepository;
    CommissionHotelRepository commissionHotelRepository;
    CommissionLogRepository commissionLogRepository;
    HotelRepository hotelRepository;

    private String getUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Jwt jwt = (Jwt) authentication.getPrincipal();
        return jwt.getClaim("userId");
    }

    @Override
    public String create(CreateCommissionRequest request) {

        String userId = getUserId();
        LocalDateTime now = LocalDateTime.now();

        Commission commission = new Commission();

        // DEFAULT
        if ("DEFAULT".equals(request.getCommissionType())) {

            commissionRepository.findDefault().ifPresent(c -> {
                throw new AppException(ErrorCode.DEFAULT_ALREADY_EXIST);
            });

            commission.setCommissionType("DEFAULT");
            commission.setRateType(request.getRateType());
            commission.setCommissionValue(request.getCommissionValue());
            commission.setNote(request.getNote());

            commission.setIsActive(true);
            commission.setStartDate(null);
            commission.setEndDate(null);
        }

        // DEAL
        else if ("DEAL".equals(request.getCommissionType())) {

            commission.setCommissionType("DEAL");
            commission.setRateType(request.getRateType());
            commission.setCommissionValue(request.getCommissionValue());
            commission.setStartDate(request.getStartDate());
            commission.setEndDate(request.getEndDate());
            commission.setIsActive(request.getIsActive());
            commission.setNote(request.getNote());
        }

        // HOTEL
        else {

            commission.setCommissionType("HOTEL");
            commission.setRateType(request.getRateType());
            commission.setCommissionValue(request.getCommissionValue());
            commission.setStartDate(request.getStartDate());
            commission.setEndDate(request.getEndDate());
            commission.setIsActive(request.getIsActive());
            commission.setNote(request.getNote());
        }

        commission.setCreatedAt(now);
        commission.setUpdatedAt(now);
        commission.setCreatedBy(userId);
        commission.setUpdatedBy(userId);

        commission = commissionRepository.save(commission);


        if ("HOTEL".equals(request.getCommissionType())) {

            for (Integer hotelId : request.getHotelIds()) {
                // HOTEL mapping
                CommissionHotel ch = new CommissionHotel();
                ch.setCommissionId(commission.getCommissionId());
                ch.setHotelId(hotelId);
                commissionHotelRepository.save(ch);

                //update hotel
                Hotel hotel = hotelRepository.findById(hotelId)
                        .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));

                hotel.setUpdatedAt(now);

                hotel.setCommissionValue(commission.getCommissionValue());
                hotel.setRateType(commission.getRateType());
                hotel.setCommissionId(commission.getCommissionId());

                hotel.setCommissionUpdatedAt(now);
                hotel.setCommissionUpdatedBy(userId);
                hotel.setCommissionType("HOTEL");

                hotelRepository.save(hotel);
            }
        }

        return "Create successfully";
    }

    @Override
    public String delete(Long commissionId, DeleteCommissionRequest request) {

        Commission commission = commissionRepository.findById(commissionId)
                .orElseThrow(() -> new AppException(ErrorCode.COMMISSION_NOT_FOUND));

        if ("DEFAULT".equals(commission.getCommissionType())) {
            throw new AppException(ErrorCode.CANNOT_DELETE_DEFAULT);
        }

        if (request.getReason() == null || request.getReason().isEmpty()) {
            throw new AppException(ErrorCode.REASON_REQUIRED);
        }

        commission.setIsActive(false);
        commission.setReason(request.getReason());
        commission.setUpdatedAt(LocalDateTime.now());
        commission.setUpdatedBy(getUserId());

        commissionRepository.save(commission);

        return "Archived successfully";
    }

    @Override
    public List<CommissionResponse> getAll() {
        return commissionRepository.findAll().stream().map(c -> {
            CommissionResponse res = new CommissionResponse();
            res.setCommissionId(c.getCommissionId());
            res.setCommissionType(c.getCommissionType());
            res.setRateType(c.getRateType());
            res.setCommissionValue(c.getCommissionValue());
            res.setStartDate(c.getStartDate());
            res.setEndDate(c.getEndDate());
            res.setIsActive(c.getIsActive());
            return res;
        }).toList();
    }

    @Override
    public CommissionDetailResponse getDetail(Long commissionId) {

        Commission commission = commissionRepository.findById(commissionId)
                .orElseThrow(() -> new AppException(ErrorCode.COMMISSION_NOT_FOUND));

        CommissionDetailResponse response = new CommissionDetailResponse();
        response.setCommission(commission);

        // DEFAULT
        if ("DEFAULT".equals(commission.getCommissionType())) {
            response.setLogs(commissionLogRepository.findByCommissionId(commissionId));
        }

        // HOTEL
        if ("HOTEL".equals(commission.getCommissionType())) {
            List<CommissionHotel> chs = commissionHotelRepository.findByCommissionId(commissionId);

            List<Hotel> hotels = chs.stream()
                    .map(ch -> hotelRepository.findById(ch.getHotelId()).orElse(null))
                    .toList();

            response.setHotels(hotels);
        }

        return response;
    }
}
