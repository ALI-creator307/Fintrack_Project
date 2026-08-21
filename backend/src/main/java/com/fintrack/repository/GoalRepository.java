package com.fintrack.repository;

import com.fintrack.entity.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

/**
 * Goal Repository
 * All savings goals scoped to a specific user.
 */
public interface GoalRepository extends JpaRepository<Goal, Long> {

    /** All goals for a user, newest first */
    List<Goal> findByUserIdOrderByCreatedAtDesc(Long userId);

    /** Find specific goal — ensures user can only access their own */
    Optional<Goal> findByIdAndUserId(Long id, Long userId);

    /** Filter by status: "active" or "completed" */
    List<Goal> findByUserIdAndStatus(Long userId, String status);
}
