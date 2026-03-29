package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.AgencyBooking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

public interface AgencyBookingRepository extends JpaRepository<AgencyBooking, Long> {
    Optional<AgencyBooking> findByAgencyIdAndMonth(Long agencyId, String month);

    List<AgencyBooking> findByAgencyIdAndIsPaidFalse(Long agencyId);
}
