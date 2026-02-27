package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.RoomPricingRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomPricingRuleRepository
        extends JpaRepository<RoomPricingRule, Integer> {

    List<RoomPricingRule> findByRoomTypeId(Integer roomTypeId);

    List<RoomPricingRule> findByRoomTypeIdAndIsActiveTrueOrderByPriorityDesc(Integer roomTypeId);
    List<RoomPricingRule> findByRoomTypeIdAndIsActiveTrue(Integer roomTypeId);
}
