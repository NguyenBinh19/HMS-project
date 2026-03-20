package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.Commission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommissionRepository extends JpaRepository<Commission, Long> {

    @Query("SELECT c FROM Commission c WHERE c.commissionType = 'DEFAULT'")
    Optional<Commission> findDefault();
}