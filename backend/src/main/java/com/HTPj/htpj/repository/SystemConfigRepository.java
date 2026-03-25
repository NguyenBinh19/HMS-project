package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.SystemConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SystemConfigRepository extends JpaRepository<SystemConfig, Integer> {

    Optional<SystemConfig> findByConfigCode(String configCode);
}