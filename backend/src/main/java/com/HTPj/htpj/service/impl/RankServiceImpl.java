package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.rank.CreateRankRequest;
import com.HTPj.htpj.dto.request.rank.UpdateRankRequest;
import com.HTPj.htpj.dto.response.rank.RankResponse;
import com.HTPj.htpj.entity.Rank;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.mapper.RankMapper;
import com.HTPj.htpj.repository.AgencyRepository;
import com.HTPj.htpj.repository.RankRepository;
import com.HTPj.htpj.repository.UserRepository;
import com.HTPj.htpj.service.RankService;
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
public class RankServiceImpl implements RankService {

    RankRepository rankRepository;
    AgencyRepository agencyRepository;
    RankMapper rankMapper;
    UserRepository userRepository;

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        Jwt jwt = (Jwt) authentication.getPrincipal();

        return jwt.getClaim("userId");
    }


    @Override
    public String createRank(CreateRankRequest request) {

        if (rankRepository.existsByRankCode(request.getRankCode())) {
            throw new AppException(ErrorCode.RANK_CODE_EXISTED);
        }

        if (rankRepository.existsByRankName(request.getRankName())) {
            throw new AppException(ErrorCode.RANK_NAME_EXISTED);
        }

        if (rankRepository.existsByPriority(request.getPriority())) {
            throw new AppException(ErrorCode.RANK_PRIORITY_EXISTED);
        }

        Rank rank = rankMapper.toRank(request);

        rank.setCreatedAt(LocalDateTime.now());
        rank.setUpdatedAt(LocalDateTime.now());
        rank.setCreatedBy(getCurrentUserId());
        rank.setUpdatedBy(getCurrentUserId());

        rankRepository.save(rank);

        return "Create rank successfully";
    }


    @Override
    public String updateRank(Integer id, UpdateRankRequest request) {

        Rank rank = rankRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RANK_NOT_FOUND));

        if (!rank.getRankName().equals(request.getRankName())
                && rankRepository.existsByRankName(request.getRankName())) {
            throw new AppException(ErrorCode.RANK_NAME_EXISTED);
        }

        if (!rank.getPriority().equals(request.getPriority())
                && rankRepository.existsByPriority(request.getPriority())) {
            throw new AppException(ErrorCode.RANK_PRIORITY_EXISTED);
        }

        rank.setRankName(request.getRankName());
        rank.setDescription(request.getDescription());
        rank.setIcon(request.getIcon());
        rank.setColor(request.getColor());
        rank.setPriority(request.getPriority());

        rank.setMinTotalBooking(request.getMinTotalBooking());
        rank.setMinTotalRevenue(request.getMinTotalRevenue());
        rank.setLogic(request.getLogic());

        rank.setMaintainMinBooking(request.getMaintainMinBooking());
        rank.setMaintainMinRevenue(request.getMaintainMinRevenue());
        rank.setMaintainLogic(request.getMaintainLogic());

        rank.setUpdatedAt(LocalDateTime.now());
        rank.setUpdatedBy(getCurrentUserId());

        rankRepository.save(rank);

        return "Update rank successfully";
    }

    @Override
    public RankResponse getRankDetail(Integer id) {

        Rank rank = rankRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RANK_NOT_FOUND));

        RankResponse response = rankMapper.toResponse(rank);

        Long count = rankRepository.countAgencyByRankId(id);
        response.setAgencies(count);

        return response;
    }


    @Override
    public List<RankResponse> getAllRanks() {

        List<Rank> ranks = rankRepository.findAllOrderByPriority();

        return ranks.stream().map(rank -> {
            RankResponse res = rankMapper.toResponse(rank);
            res.setAgencies(rankRepository.countAgencyByRankId(rank.getId()));
            return res;
        }).toList();
    }


    @Override
    public String deleteRank(Integer id) {

        Rank rank = rankRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RANK_NOT_FOUND));

        Long count = rankRepository.countAgencyByRankId(id);

        if (count > 0) {
            throw new AppException(ErrorCode.RANK_IN_USE);
        }

        rank.setIsActive(false);
        rank.setUpdatedAt(LocalDateTime.now());
        rank.setUpdatedBy(getCurrentUserId());

        rankRepository.save(rank);

        return "Delete rank successfully";
    }
}