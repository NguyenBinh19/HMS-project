package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.RoomHold;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface RoomHoldRepository extends JpaRepository<RoomHold, Long> {

    Optional<RoomHold> findByHoldCode(String holdCode);

}