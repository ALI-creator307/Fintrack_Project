package com.fintrack.security;

import com.fintrack.entity.User;
import com.fintrack.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Custom UserDetailsService
 * Loads user from database by email for Spring Security authentication.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException(
                "User not found with email: " + email
            ));

        return buildUserDetails(user);
    }

    /** Build Spring Security UserDetails from our User entity */
    public static UserDetails buildUserDetails(User user) {
        return new org.springframework.security.core.userdetails.User(
            user.getEmail(),
            user.getPassword() != null ? user.getPassword() : "",
            List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );
    }
}
