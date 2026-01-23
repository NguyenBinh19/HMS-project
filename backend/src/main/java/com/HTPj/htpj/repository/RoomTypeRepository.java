package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomTypeRepository extends JpaRepository<RoomType, Integer> {
    boolean existsByRoomCode(String roomCode);
}
