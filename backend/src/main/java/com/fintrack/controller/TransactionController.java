package com.fintrack.controller;

import com.fintrack.dto.TransactionDto;
import com.fintrack.dto.TransactionRequest;
import com.fintrack.dto.TransactionSummaryDto;
import com.fintrack.entity.Transaction;
import com.fintrack.entity.User;
import com.fintrack.repository.TransactionRepository;
import com.fintrack.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Transaction Controller
 * All endpoints are user-scoped — users can only see/modify their own data.
 *
 * GET    /api/transactions           — list all (optional ?type=income|expense)
 * POST   /api/transactions           — create
 * PUT    /api/transactions/{id}      — update
 * DELETE /api/transactions/{id}      — delete
 * GET    /api/transactions/summary   — income/expense/balance totals
 */
@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionRepository transactionRepo;
    private final UserRepository        userRepo;

    public TransactionController(TransactionRepository transactionRepo,
                                 UserRepository userRepo) {
        this.transactionRepo = transactionRepo;
        this.userRepo        = userRepo;
    }

    /** List all transactions for current user, optionally filtered by type */
    @GetMapping
    public List<TransactionDto> getAll(
            @AuthenticationPrincipal UserDetails principal,
            @RequestParam(required = false) String type) {

        Long userId = resolveUserId(principal);

        List<Transaction> txns = (type != null)
            ? transactionRepo.findByUserIdAndTypeOrderByDateDesc(userId, type)
            : transactionRepo.findByUserIdOrderByDateDesc(userId);

        return txns.stream().map(this::toDto).collect(Collectors.toList());
    }

    /** Create a new transaction */
    @PostMapping
    public ResponseEntity<TransactionDto> create(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody TransactionRequest req) {

        User user = loadUser(principal);

        Transaction txn = transactionRepo.save(
            Transaction.builder()
                .user(user)
                .name(req.name)
                .category(req.category)
                .date(req.date)
                .amount(req.amount)
                .type(req.type)
                .note(req.note)
                .build()
        );

        return ResponseEntity.ok(toDto(txn));
    }

    /** Update an existing transaction — only if it belongs to current user */
    @PutMapping("/{id}")
    public ResponseEntity<TransactionDto> update(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequest req) {

        Long userId = resolveUserId(principal);

        return transactionRepo.findById(id)
            .filter(t -> t.getUser().getId().equals(userId)) // ownership check
            .map(txn -> {
                txn.setName(req.name);
                txn.setCategory(req.category);
                txn.setDate(req.date);
                txn.setAmount(req.amount);
                txn.setType(req.type);
                txn.setNote(req.note);
                return ResponseEntity.ok(toDto(transactionRepo.save(txn)));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    /** Delete a transaction — only if it belongs to current user */
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> delete(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id) {

        Long userId = resolveUserId(principal);

        return transactionRepo.findById(id)
            .filter(t -> t.getUser().getId().equals(userId))
            .map(txn -> {
                transactionRepo.delete(txn);
                return ResponseEntity.<Void>noContent().build();
            })
            .orElse(ResponseEntity.<Void>notFound().build());
    }

    /**
     * Dashboard summary: total income, expense, balance, savings.
     * Balance = total income - total expense
     * Savings = same as balance (can be customized later)
     */
    @GetMapping("/summary")
    public TransactionSummaryDto getSummary(
            @AuthenticationPrincipal UserDetails principal) {

        Long userId = resolveUserId(principal);

        BigDecimal income  = transactionRepo.sumAmountByType(userId, "income");
        BigDecimal expense = transactionRepo.sumAmountByType(userId, "expense");
        BigDecimal balance = income.subtract(expense);

        return TransactionSummaryDto.builder()
            .totalIncome(income)
            .totalExpense(expense)
            .balance(balance)
            .savings(balance)
            .build();
    }

    // ── Helpers ──────────────────────────────────────────────

    /** Map Transaction entity → DTO */
    private TransactionDto toDto(Transaction t) {
        return TransactionDto.builder()
            .id(t.getId())
            .name(t.getName())
            .category(t.getCategory())
            .date(t.getDate())
            .amount(t.getAmount())
            .type(t.getType())
            .note(t.getNote())
            .createdAt(t.getCreatedAt())
            .build();
    }

    /** Get userId from Spring Security principal */
    private Long resolveUserId(UserDetails principal) {
        return loadUser(principal).getId();
    }

    /** Load full User entity from DB */
    private User loadUser(UserDetails principal) {
        return userRepo.findByEmail(principal.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
