package com.fintrack.config;

import com.fintrack.security.CustomUserDetailsService;
import com.fintrack.security.JwtAuthFilter;
import com.fintrack.security.OAuth2SuccessHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Security Configuration
 * - JWT stateless sessions
 * - Google OAuth2 login
 * - CORS for React dev server
 * - Public routes: /api/auth/**
 * - Protected routes: everything else requires valid JWT
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthFilter jwtAuthFilter;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    public SecurityConfig(CustomUserDetailsService userDetailsService,
                          JwtAuthFilter jwtAuthFilter,
                          OAuth2SuccessHandler oAuth2SuccessHandler) {
        this.userDetailsService  = userDetailsService;
        this.jwtAuthFilter       = jwtAuthFilter;
        this.oAuth2SuccessHandler = oAuth2SuccessHandler;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // ── Disable CSRF (using JWT, not sessions) ──
            .csrf(AbstractHttpConfigurer::disable)

            // ── CORS ──
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // ── Session: stateless (JWT) ──
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // ── URL Authorization ──
            .authorizeHttpRequests(auth -> auth
                // Public: local auth endpoints
                .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login").permitAll()
                // Public: OAuth2 endpoints (Spring handles these internally)
                .requestMatchers("/oauth2/**", "/login/oauth2/**", "/api/auth/oauth2/**").permitAll()
                // All other API calls require authentication
                .anyRequest().authenticated()
            )

            // ── Google OAuth2 Login ──
            .oauth2Login(oauth2 -> oauth2
                .authorizationEndpoint(endpoint ->
                    endpoint.baseUri("/api/auth/oauth2/authorize")
                )
                .redirectionEndpoint(endpoint ->
                    endpoint.baseUri("/api/auth/oauth2/callback/*")
                )
                .successHandler(oAuth2SuccessHandler)
            )

            // ── Add JWT filter before Spring's username/password filter ──
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /** BCrypt password encoder for local login */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /** Authentication provider for local login */
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    /** Expose AuthenticationManager bean for AuthController */
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * CORS configuration — allows React dev server (port 5173)
     * to make cross-origin requests to Spring Boot (port 8080).
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(allowedOrigins));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
