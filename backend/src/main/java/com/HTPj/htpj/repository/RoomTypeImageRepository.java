package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.RoomTypeImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoomTypeImageRepository extends JpaRepository<RoomTypeImage, Integer> {
    List<RoomTypeImage> findByRoomType_RoomTypeId(Integer roomTypeId);
}