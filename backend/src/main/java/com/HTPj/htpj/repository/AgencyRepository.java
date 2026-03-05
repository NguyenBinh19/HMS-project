package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.Agency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AgencyRepository extends JpaRepository<Agency,Long> {
    @Query("SELECT COALESCE(MAX(a.agencyId),0) + 1 FROM Agency a")
    Long generateAgencyId();

}
