package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.AgencyVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;


public interface AgencyVerificationRepository
        extends JpaRepository<AgencyVerification, Integer> {

    Optional<AgencyVerification> findTopByAgency_AgencyIdOrderByVersionDesc(Long agencyId);
}