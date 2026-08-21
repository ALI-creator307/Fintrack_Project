package com.fintrack.repository;

import com.fintrack.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Transaction Repository
 * All queries are scoped to the authenticated user's data.
 */
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    /** Get all transactions for a user, newest first */
    List<Transaction> findByUserIdOrderByDateDesc(Long userId);

    /** Filter by type: "income" or "expense" */
    List<Transaction> findByUserIdAndTypeOrderByDateDesc(Long userId, String type);

    /** Filter by category */
    List<Transaction> findByUserIdAndCategoryOrderByDateDesc(Long userId, String category);

    /** Transactions within a date range (for monthly reports) */
    List<Transaction> findByUserIdAndDateBetweenOrderByDateDesc(
        Long userId, LocalDate start, LocalDate end
    );

    /** Sum of amounts by type for a user (income or expense total) */
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.user.id = :userId AND t.type = :type")
    BigDecimal sumAmountByType(@Param("userId") Long userId, @Param("type") String type);

    /** Sum of expenses by category for a given date range */
    @Query("SELECT t.category, COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.user.id = :userId AND t.type = 'expense' " +
           "AND t.date BETWEEN :startDate AND :endDate " +
           "GROUP BY t.category")
    List<Object[]> sumExpenseByCategory(
        @Param("userId") Long userId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
}
