package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Integer> {

    boolean existsByCode(String code);
    Optional<Promotion> findByIdAndIsDeletedFalse(Integer id);
    boolean existsByCodeAndIsDeletedFalse(String code);
}