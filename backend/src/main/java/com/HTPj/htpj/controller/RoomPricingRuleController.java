package com.HTPj.htpj.controller;

import com.HTPj.htpj.dto.request.pricingrule.RoomPricingRuleRequest;
import com.HTPj.htpj.dto.response.pricingrule.RoomPricingRuleResponse;
import com.HTPj.htpj.service.RoomPricingRuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/room-pricing-rules")
@RequiredArgsConstructor
public class RoomPricingRuleController {

    private final RoomPricingRuleService service;

    @PostMapping
    public RoomPricingRuleResponse create(@RequestBody RoomPricingRuleRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public RoomPricingRuleResponse update(
            @PathVariable Integer id,
            @RequestBody RoomPricingRuleRequest request
    ) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        service.delete(id);
    }

    @GetMapping("/{id}")
    public RoomPricingRuleResponse getById(@PathVariable Integer id) {
        return service.getById(id);
    }

    @GetMapping("/room-type/{roomTypeId}")
    public List<RoomPricingRuleResponse> getByRoomType(
            @PathVariable Integer roomTypeId
    ) {
        return service.getByRoomType(roomTypeId);
    }
}
