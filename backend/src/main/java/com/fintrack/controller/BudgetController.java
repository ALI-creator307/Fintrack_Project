package com.fintrack.controller;

import com.fintrack.dto.BudgetDto;
import com.fintrack.dto.BudgetRequest;
import com.fintrack.entity.Budget;
import com.fintrack.entity.Transaction;
import com.fintrack.entity.User;
import com.fintrack.repository.BudgetRepository;
import com.fintrack.repository.TransactionRepository;
import com.fintrack.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Budget Controller
 * Manages monthly spending limits per category.
 * Spent amount is calculated live from transactions.
 *
 * GET    /api/budgets?month=4&year=2024  — list budgets for a month
 * POST   /api/budgets                   — create/upsert budget
 * PUT    /api/budgets/{id}              — update limit
 * DELETE /api/budgets/{id}             — delete
 */
@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetRepository      budgetRepo;
    private final TransactionRepository txnRepo;
    private final UserRepository        userRepo;

    public BudgetController(BudgetRepository budgetRepo,
                            TransactionRepository txnRepo,
                            UserRepository userRepo) {
        this.budgetRepo = budgetRepo;
        this.txnRepo    = txnRepo;
        this.userRepo   = userRepo;
    }

    /** Get all budgets for a month, with live spent amounts */
    @GetMapping
    public List<BudgetDto> getBudgets(
            @AuthenticationPrincipal UserDetails principal,
            @RequestParam int month,
            @RequestParam int year) {

        Long userId = resolveUserId(principal);
        List<Budget> budgets = budgetRepo.findByUserIdAndMonthAndYear(userId, month, year);

        return budgets.stream()
            .map(b -> toDtoWithSpent(b, userId, month, year))
            .collect(Collectors.toList());
    }

    /** Create a new budget (or update if category+month+year already exists) */
    @PostMapping
    public ResponseEntity<BudgetDto> create(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody BudgetRequest req) {

        User user = loadUser(principal);

        // Upsert: update existing or create new
        Budget budget = budgetRepo
            .findByUserIdAndCategoryAndMonthAndYear(
                user.getId(), req.category, req.month, req.year
            )
            .map(existing -> {
                existing.setLimitAmount(req.limitAmount);
                return budgetRepo.save(existing);
            })
            .orElseGet(() -> budgetRepo.save(
                Budget.builder()
                    .user(user)
                    .category(req.category)
                    .limitAmount(req.limitAmount)
                    .month(req.month)
                    .year(req.year)
                    .build()
            ));

        return ResponseEntity.ok(
            toDtoWithSpent(budget, user.getId(), req.month, req.year)
        );
    }

    /** Update an existing budget limit */
    @PutMapping("/{id}")
    public ResponseEntity<BudgetDto> update(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id,
            @Valid @RequestBody BudgetRequest req) {

        Long userId = resolveUserId(principal);

        return budgetRepo.findById(id)
            .filter(b -> b.getUser().getId().equals(userId))
            .map(budget -> {
                budget.setLimitAmount(req.limitAmount);
                budgetRepo.save(budget);
                return ResponseEntity.ok(
                    toDtoWithSpent(budget, userId, budget.getMonth(), budget.getYear())
                );
            })
            .orElse(ResponseEntity.notFound().build());
    }

    /** Delete a budget */
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> delete(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id) {

        Long userId = resolveUserId(principal);

        return budgetRepo.findById(id)
            .filter(b -> b.getUser().getId().equals(userId))
            .map(budget -> {
                budgetRepo.delete(budget);
                return ResponseEntity.<Void>noContent().build();
            })
            .orElse(ResponseEntity.<Void>notFound().build());
    }

    // ── Helpers ──────────────────────────────────────────────

    /**
     * Calculate how much was spent in this category for the given month.
     * Queries transactions directly — no caching needed at this scale.
     */
    private BigDecimal calculateSpent(Long userId, String category, int month, int year) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end   = start.withDayOfMonth(start.lengthOfMonth());

        return txnRepo.findByUserIdAndDateBetweenOrderByDateDesc(userId, start, end)
            .stream()
            .filter(t -> t.getCategory().equals(category) && "expense".equals(t.getType()))
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BudgetDto toDtoWithSpent(Budget b, Long userId, int month, int year) {
        BigDecimal spent = calculateSpent(userId, b.getCategory(), month, year);
        return BudgetDto.builder()
            .id(b.getId())
            .category(b.getCategory())
            .limitAmount(b.getLimitAmount())
            .spentAmount(spent)
            .month(b.getMonth())
            .year(b.getYear())
            .build();
    }

    private Long resolveUserId(UserDetails principal) {
        return loadUser(principal).getId();
    }

    private User loadUser(UserDetails principal) {
        return userRepo.findByEmail(principal.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
