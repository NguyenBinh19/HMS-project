package com.HTPj.htpj.entity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "agencies")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Agency {

    @Id
    @Column(name = "agency_id")
    private Long agencyId;

    @Column(name = "agency_name", nullable = false, length = 255)
    private String agencyName;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "phone", length = 50)
    private String phone;

    @Column(name = "address")
    private String address;

    @Column(name = "credit_limit")
    private BigDecimal creditLimit;

    @Column(name = "current_credit")
    private BigDecimal currentCredit;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "agency", cascade = CascadeType.ALL)
    private List<PartnerVerification> verifications;
}
