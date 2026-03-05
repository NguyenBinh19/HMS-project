package com.HTPj.htpj.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;


@Entity
@Table(name = "agency_legal_information")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgencyLegalInformation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "legal_name", nullable = false, length = 255)
    private String legalName;

    @Column(name = "tax_code", nullable = false, length = 50)
    private String taxCode;

    @Column(name = "business_address", nullable = false, length = 500)
    private String businessAddress;

    @Column(name = "representative_name", nullable = false, length = 255)
    private String representativeName;

    @Column(name = "representative_CIC_number", nullable = false, length = 50)
    private String representativeCICNumber;

    @Column(name = "business_license_number", length = 100)
    private String businessLicenseNumber;

    @Column(name = "representative_CIC_date")
    private LocalDate representativeCICDate;

    @Column(name = "representative_CIC_place", length = 255)
    private String representativeCICPlace;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verification_id", nullable = false, unique = true)
    private AgencyVerification verification;
}