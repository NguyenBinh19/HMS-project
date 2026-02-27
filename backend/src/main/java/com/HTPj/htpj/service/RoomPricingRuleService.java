package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.pricingrule.RoomPricingRuleRequest;
import com.HTPj.htpj.dto.response.pricingrule.RoomPricingRuleResponse;
import com.HTPj.htpj.entity.RoomPricingRule;
import com.HTPj.htpj.mapper.RoomPricingRuleMapper;
import com.HTPj.htpj.repository.RoomPricingRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomPricingRuleService {

    private final RoomPricingRuleRepository repository;

    /* ================= CREATE ================= */
    public RoomPricingRuleResponse create(RoomPricingRuleRequest request) {
        RoomPricingRule rule = RoomPricingRuleMapper.toEntity(request);
        return RoomPricingRuleMapper.toResponse(repository.save(rule));
    }

    /* ================= UPDATE ================= */
    public RoomPricingRuleResponse update(Integer ruleId, RoomPricingRuleRequest request) {
        RoomPricingRule rule = repository.findById(ruleId)
                .orElseThrow(() -> new RuntimeException("Room pricing rule not found"));

        RoomPricingRuleMapper.update(rule, request);
        return RoomPricingRuleMapper.toResponse(repository.save(rule));
    }

    public void delete(Integer ruleId) {
        repository.deleteById(ruleId);
    }

    public RoomPricingRuleResponse getById(Integer ruleId) {
        return repository.findById(ruleId)
                .map(RoomPricingRuleMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Room pricing rule not found"));
    }


    public List<RoomPricingRuleResponse> getByRoomType(Integer roomTypeId) {
        return repository.findByRoomTypeId(roomTypeId)
                .stream()
                .map(RoomPricingRuleMapper::toResponse)
                .toList();
    }
}
