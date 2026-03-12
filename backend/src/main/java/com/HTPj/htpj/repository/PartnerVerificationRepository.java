package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.PartnerVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;


public interface PartnerVerificationRepository
        extends JpaRepository<PartnerVerification, Integer> {

    Optional<PartnerVerification>
    findTopBySubmittedByOrderByVersionDesc(String submittedBy);

    @Query("SELECT v FROM PartnerVerification v " +
           "LEFT JOIN FETCH v.legalInformation")
    List<PartnerVerification> findAllWithLegalInformation();

    @Query("SELECT v FROM PartnerVerification v " +
           "LEFT JOIN FETCH v.legalInformation " +
           "WHERE v.status = :status")
    List<PartnerVerification> findByStatusWithLegalInformation(@Param("status") String status);

    @Query("SELECT v FROM PartnerVerification v " +
            "LEFT JOIN FETCH v.legalInformation " +
            "WHERE v.submittedBy = :userId")
    List<PartnerVerification> findByUserIdWithLegalInformation(@Param("userId") String userId);

    @Query("""
       SELECT v
       FROM PartnerVerification v
       LEFT JOIN FETCH v.legalInformation
       LEFT JOIN FETCH v.documents
       WHERE v.id = :id
       """)
    Optional<PartnerVerification> findDetailById(Integer id);

    @Query("""
        SELECT v
        FROM PartnerVerification v
        LEFT JOIN FETCH v.legalInformation
        WHERE v.agency.agencyId = :agencyId
        ORDER BY v.version DESC
    """)
    List<PartnerVerification> findByAgencyOrderByVersionDesc(Long agencyId);

    @Query("""
        SELECT v
        FROM PartnerVerification v
        LEFT JOIN FETCH v.legalInformation
        WHERE v.hotel.hotelId = :hotelId
        ORDER BY v.version DESC
    """)
    List<PartnerVerification> findByHotelOrderByVersionDesc(Integer hotelId);

}