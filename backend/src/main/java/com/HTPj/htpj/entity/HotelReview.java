package com.HTPj.htpj.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "hotel_reviews")
public class HotelReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_id")
    private Integer reviewId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    // người đánh giá (agent/user)
    @Column(name = "reviewer_name", length = 100)
    private String reviewerName;

    // điểm đánh giá: 1–5
    @Column(name = "rating_score", nullable = false)
    private Integer ratingScore;

    @Column(name = "comment", columnDefinition = "NVARCHAR(MAX)")
    private String comment;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
