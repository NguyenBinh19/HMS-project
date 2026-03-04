package com.HTPj.htpj.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;


@Entity
@Table(name = "agency_verifications")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgencyVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "reviewed_by", length = 255)
    private String reviewedBy;

    @Column(name = "rejection_reason", length = 1000)
    private String rejectionReason;

    @Column(name = "locked_at")
    private LocalDateTime lockedAt;

    @Column(name = "version", nullable = false)
    private Integer version;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agency_id", nullable = false)
    private Agency agency;

    @OneToOne(mappedBy = "verification", cascade = CascadeType.ALL)
    private AgencyLegalInformation legalInformation;

    @OneToMany(mappedBy = "verification", cascade = CascadeType.ALL)
    private List<KycDocument> documents;
}