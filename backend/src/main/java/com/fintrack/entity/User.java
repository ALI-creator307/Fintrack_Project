package com.fintrack.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * User Entity
 * Supports both local (email+password) and Google OAuth2 login.
 * Each user has their own isolated transactions, budgets, and goals.
 */
@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Display name (from Google profile or registration) */
    @Column(nullable = false)
    private String name;

    /** Email — unique identifier across all auth providers */
    @Column(nullable = false, unique = true)
    private String email;

    /**
     * Hashed password — NULL for Google OAuth2 users.
     * Local users must have a password.
     */
    @Column
    private String password;

    /**
     * Auth provider: "local" or "google"
     * Used to distinguish login flow.
     */
    @Column(nullable = false)
    @Builder.Default
    private String provider = "local";

    /** Google sub (subject ID) — only set for Google OAuth2 users */
    @Column(name = "provider_id")
    private String providerId;

    /** Profile picture URL from Google */
    @Column(name = "picture_url")
    private String pictureUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
