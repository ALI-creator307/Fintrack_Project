package com.fintrack.controller;

import com.fintrack.dto.AuthResponse;
import com.fintrack.dto.LoginRequest;
import com.fintrack.dto.RegisterRequest;
import com.fintrack.dto.UserDto;
import com.fintrack.entity.User;
import com.fintrack.repository.UserRepository;
import com.fintrack.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

/**
 * Auth Controller
 * Handles:
 *   POST /api/auth/register  — local registration
 *   POST /api/auth/login     — local login → returns JWT
 *
 * Google OAuth2 flow is handled automatically by Spring Security:
 *   GET /api/auth/oauth2/authorize/google  → redirects to Google
 *   GET /api/auth/oauth2/callback/google   → OAuth2SuccessHandler issues JWT
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository     userRepository;
    private final PasswordEncoder    passwordEncoder;
    private final JwtTokenProvider   jwtTokenProvider;
    private final AuthenticationManager authManager;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtTokenProvider jwtTokenProvider,
                          AuthenticationManager authManager) {
        this.userRepository   = userRepository;
        this.passwordEncoder  = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authManager      = authManager;
    }

    /**
     * Register a new user with email + password.
     * Returns JWT token immediately (auto-login after register).
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest req) {
        String normalizedEmail = req.email.trim().toLowerCase();

        // Reject if email already taken
        if (userRepository.existsByEmail(normalizedEmail)) {
            return ResponseEntity.badRequest().build();
        }

        // Save user with hashed password
        User user = userRepository.save(
            User.builder()
                .name(req.name)
                .email(normalizedEmail)
                .password(passwordEncoder.encode(req.password))
                .provider("local")
                .build()
        );

        // Issue JWT
        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail());

        return ResponseEntity.ok(buildAuthResponse(user, token));
    }

    /**
     * Local login with email + password.
     * Returns JWT token on success.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest req) {
        String normalizedEmail = req.email.trim().toLowerCase();

        // Spring Security validates credentials
        authManager.authenticate(
            new UsernamePasswordAuthenticationToken(normalizedEmail, req.password)
        );

        // Load user from DB to build response
        User user = userRepository.findByEmail(normalizedEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail());

        return ResponseEntity.ok(buildAuthResponse(user, token));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> me(@AuthenticationPrincipal UserDetails principal) {
        User user = userRepository.findByEmail(principal.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(UserDto.builder()
            .id(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .pictureUrl(user.getPictureUrl())
            .provider(user.getProvider())
            .createdAt(user.getCreatedAt())
            .build());
    }

    /** Helper: build AuthResponse from User + token */
    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
            .token(token)
            .type("Bearer")
            .id(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .pictureUrl(user.getPictureUrl())
            .provider(user.getProvider())
            .build();
    }
}
