package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.Agency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AgencyRepository extends JpaRepository<Agency,Long> {
    boolean existsByEmail(String email);
    @Query(value = """
        SELECT *
        FROM agencies
        WHERE agency_id = :agencyId
    """, nativeQuery = true)
    Agency findAgenciesFinanceInfo(@Param("agencyId") Long agencyId);

    @Query("""
    SELECT a FROM Agency a
    WHERE a.status = 'ACTIVE'
    """)
    List<Agency> findAllActive();
}
