package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.PartnerVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface PartnerVerificationRepository
        extends JpaRepository<PartnerVerification, Integer> {

    Optional<PartnerVerification>
    findTopBySubmittedByOrderByVersionDesc(String submittedBy);

}