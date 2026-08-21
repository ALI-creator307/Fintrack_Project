package com.fintrack.security;

import com.fintrack.entity.User;
import com.fintrack.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

/**
 * OAuth2 Success Handler
 * Called after Google login succeeds.
 * Finds or creates the user in DB, generates a JWT,
 * then redirects to the frontend with the token as a query param.
 *
 * Frontend catches: /oauth2/callback?token=<JWT>
 */
@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private static final Logger log = LoggerFactory.getLogger(OAuth2SuccessHandler.class);

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.oauth2.redirect-uri}")
    private String redirectUri;

    public OAuth2SuccessHandler(UserRepository userRepository,
                                JwtTokenProvider jwtTokenProvider) {
        this.userRepository   = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();

        // Extract Google profile attributes
        String email      = oauthUser.getAttribute("email");
        String name       = oauthUser.getAttribute("name");
        String picture    = oauthUser.getAttribute("picture");
        String providerId = oauthUser.getAttribute("sub"); // Google's user ID
        if (email == null || email.isBlank()) {
            throw new IOException("Google account did not provide a valid email");
        }
        String normalizedEmail = email.trim().toLowerCase();

        // Find existing user or create new one
        User user = userRepository.findByEmail(normalizedEmail).orElse(null);
        if (user == null) {
            log.info("New Google user registered: {}", normalizedEmail);
            user = userRepository.save(
                User.builder()
                    .email(normalizedEmail)
                    .name(name)
                    .pictureUrl(picture)
                    .provider("google")
                    .providerId(providerId)
                    .build()
            );
        }

        // Update profile picture if changed
        if (name != null && !name.equals(user.getName())) {
            user.setName(name);
        }
        if (picture != null && !picture.equals(user.getPictureUrl())) {
            user.setPictureUrl(picture);
        }
        userRepository.save(user);

        // Generate JWT and redirect to frontend
        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail());

        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
            .queryParam("token", token)
            .build().toUriString();

        log.info("OAuth2 login success for {}. Redirecting to frontend.", normalizedEmail);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
