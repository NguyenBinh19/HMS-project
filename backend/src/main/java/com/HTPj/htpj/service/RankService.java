package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.rank.CreateRankRequest;
import com.HTPj.htpj.dto.request.rank.UpdateRankRequest;
import com.HTPj.htpj.dto.response.rank.RankResponse;

import java.util.List;

public interface RankService {
    String createRank(CreateRankRequest request);

    String updateRank(Integer id, UpdateRankRequest request);

    RankResponse getRankDetail(Integer id);

    List<RankResponse> getAllRanks();

    String deleteRank(Integer id);
}
