package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.Agency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AgencyRepository extends JpaRepository<Agency,Long> {
    boolean existsByEmail(String email);
}
