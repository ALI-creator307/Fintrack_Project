package com.fintrack.repository;

import com.fintrack.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

/**
 * Budget Repository
 * Fetches budgets scoped to a specific user and month/year.
 */
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    /** All budgets for a user in a given month/year */
    List<Budget> findByUserIdAndMonthAndYear(Long userId, int month, int year);

    /** Find specific category budget for a user/month */
    Optional<Budget> findByUserIdAndCategoryAndMonthAndYear(
        Long userId, String category, int month, int year
    );

    /** Check if budget exists */
    boolean existsByUserIdAndCategoryAndMonthAndYear(
        Long userId, String category, int month, int year
    );
}
