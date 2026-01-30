package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.Amenity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AmenityRepository extends JpaRepository<Amenity, Integer> {
    List<Amenity> findByAmenityIdIn(List<Integer> amenityIds);
}
