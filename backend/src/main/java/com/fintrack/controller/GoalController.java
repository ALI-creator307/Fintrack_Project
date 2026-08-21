package com.fintrack.controller;

import com.fintrack.dto.ContributeRequest;
import com.fintrack.dto.GoalDto;
import com.fintrack.dto.GoalRequest;
import com.fintrack.entity.Goal;
import com.fintrack.entity.User;
import com.fintrack.repository.GoalRepository;
import com.fintrack.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Goal Controller
 * Savings goals management per user.
 *
 * GET    /api/goals              — list all goals
 * POST   /api/goals              — create new goal
 * PUT    /api/goals/{id}         — update goal info
 * POST   /api/goals/{id}/contribute — add contribution amount
 * DELETE /api/goals/{id}         — delete goal
 */
@RestController
@RequestMapping("/api/goals")
public class GoalController {

    private final GoalRepository goalRepo;
    private final UserRepository userRepo;

    public GoalController(GoalRepository goalRepo, UserRepository userRepo) {
        this.goalRepo = goalRepo;
        this.userRepo = userRepo;
    }

    /** List all goals for the current user */
    @GetMapping
    public List<GoalDto> getAll(@AuthenticationPrincipal UserDetails principal) {
        Long userId = resolveUserId(principal);
        return goalRepo.findByUserIdOrderByCreatedAtDesc(userId)
            .stream().map(this::toDto).collect(Collectors.toList());
    }

    /** Create a new savings goal */
    @PostMapping
    public ResponseEntity<GoalDto> create(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody GoalRequest req) {

        User user = loadUser(principal);

        Goal goal = goalRepo.save(
            Goal.builder()
                .user(user)
                .name(req.name)
                .icon(req.icon != null ? req.icon : "🎯")
                .bg(req.bg != null ? req.bg : "#f0eeff")
                .targetAmount(req.targetAmount)
                .savedAmount(BigDecimal.ZERO)
                .deadline(req.deadline)
                .status("active")
                .build()
        );

        return ResponseEntity.ok(toDto(goal));
    }

    /**
     * Add a contribution amount to a goal.
     * Automatically marks as "completed" when target is reached.
     */
    @PostMapping("/{id}/contribute")
    public ResponseEntity<GoalDto> contribute(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id,
            @Valid @RequestBody ContributeRequest req) {

        Long userId = resolveUserId(principal);

        return goalRepo.findByIdAndUserId(id, userId)
            .map(goal -> {
                // Add contribution, capped at target
                BigDecimal newSaved = goal.getSavedAmount()
                    .add(req.amount)
                    .min(goal.getTargetAmount());

                goal.setSavedAmount(newSaved);

                // Auto-complete if target reached
                if (newSaved.compareTo(goal.getTargetAmount()) >= 0) {
                    goal.setStatus("completed");
                }

                return ResponseEntity.ok(toDto(goalRepo.save(goal)));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    /** Update goal name/icon/deadline/target */
    @PutMapping("/{id}")
    public ResponseEntity<GoalDto> update(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id,
            @Valid @RequestBody GoalRequest req) {

        Long userId = resolveUserId(principal);

        return goalRepo.findByIdAndUserId(id, userId)
            .map(goal -> {
                goal.setName(req.name);
                if (req.icon != null) goal.setIcon(req.icon);
                if (req.bg != null) goal.setBg(req.bg);
                goal.setTargetAmount(req.targetAmount);
                if (req.deadline != null) goal.setDeadline(req.deadline);
                return ResponseEntity.ok(toDto(goalRepo.save(goal)));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    /** Delete a goal */
    @DeleteMapping("/{id}")
    public Object delete(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id) {

        Long userId = resolveUserId(principal);

        return goalRepo.findByIdAndUserId(id, userId)
            .map(goal -> {
                goalRepo.delete(goal);
                return ResponseEntity.<Void>noContent().build();
            })
            .orElse(ResponseEntity.<Void>notFound().build());
    }

    // ── Helpers ──────────────────────────────────────────────

    private GoalDto toDto(Goal g) {
        int percent = g.getTargetAmount().compareTo(BigDecimal.ZERO) > 0
            ? g.getSavedAmount()
                 .multiply(BigDecimal.valueOf(100))
                 .divide(g.getTargetAmount(), 0, RoundingMode.HALF_UP)
                 .min(BigDecimal.valueOf(100))
                 .intValue()
            : 0;

        return GoalDto.builder()
            .id(g.getId())
            .name(g.getName())
            .icon(g.getIcon())
            .bg(g.getBg())
            .targetAmount(g.getTargetAmount())
            .savedAmount(g.getSavedAmount())
            .deadline(g.getDeadline())
            .status(g.getStatus())
            .percentComplete(percent)
            .createdAt(g.getCreatedAt())
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
