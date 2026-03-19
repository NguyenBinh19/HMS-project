package com.HTPj.htpj.controller;

import com.HTPj.htpj.dto.request.ApiResponse;
import com.HTPj.htpj.dto.request.rank.CreateRankRequest;
import com.HTPj.htpj.dto.request.rank.UpdateRankRequest;
import com.HTPj.htpj.dto.response.rank.RankResponse;
import com.HTPj.htpj.service.RankService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ranks")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RankController {

    RankService rankService;

    @PostMapping
    public ApiResponse<String> createRank(@RequestBody CreateRankRequest request) {
        return ApiResponse.<String>builder()
                .result(rankService.createRank(request))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<String> updateRank(
            @PathVariable Integer id,
            @RequestBody UpdateRankRequest request) {

        return ApiResponse.<String>builder()
                .result(rankService.updateRank(id, request))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<RankResponse> getDetail(@PathVariable Integer id) {
        return ApiResponse.<RankResponse>builder()
                .result(rankService.getRankDetail(id))
                .build();
    }

    @GetMapping
    public ApiResponse<List<RankResponse>> getAll() {
        return ApiResponse.<List<RankResponse>>builder()
                .result(rankService.getAllRanks())
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> delete(@PathVariable Integer id) {
        return ApiResponse.<String>builder()
                .result(rankService.deleteRank(id))
                .build();
    }
}