package com.fintrack.repository;

import com.fintrack.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/**
 * User Repository
 * Queries for local and OAuth2 user lookup.
 */
public interface UserRepository extends JpaRepository<User, Long> {

    /** Find user by email (used for local login and OAuth2 lookup) */
    Optional<User> findByEmail(String email);

    /** Check if email is already registered */
    boolean existsByEmail(String email);

    /** Find Google OAuth2 user by their Google sub ID */
    Optional<User> findByProviderAndProviderId(String provider, String providerId);
}
