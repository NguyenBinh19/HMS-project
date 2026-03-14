package com.HTPj.htpj.configuration;

import com.HTPj.htpj.constant.PredefinedRole;
import com.HTPj.htpj.dto.vault.JwtVaultProps;
import com.HTPj.htpj.entity.Role;
import com.HTPj.htpj.entity.Users;
import com.HTPj.htpj.repository.RoleRepository;
import com.HTPj.htpj.repository.UserRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtVaultProps jwtVaultProps;

    @Value("${jwt.valid-duration}")
    private long validDuration;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String googleId = oAuth2User.getAttribute("sub");
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        if (email == null || email.isBlank()) {
            response.sendRedirect(frontendUrl + "/oauth-callback?error=" +
                    URLEncoder.encode("Không thể lấy email từ Google.", StandardCharsets.UTF_8));
            return;
        }

        // Find or create user
        Users user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            // Create new user with HOTEL_MANAGER role by default (can be changed later)
            Role defaultRole = roleRepository.findById(PredefinedRole.HOTEL_MANAGER_ROLE)
                    .orElseGet(() -> roleRepository.findById(PredefinedRole.USER_ROLE).orElse(null));

            user = Users.builder()
                    .username(generateUniqueUsername(name, email))
                    .email(email)
                    .googleId(googleId)
                    .status("ACTIVE") // Google accounts are pre-verified
                    .roles(defaultRole != null ? new HashSet<>(Set.of(defaultRole)) : new HashSet<>())
                    .build();

            user = userRepository.save(user);
            log.info("Created new user from Google OAuth2: {}", email);
        } else {
            // Link Google ID if not already linked
            if (user.getGoogleId() == null || user.getGoogleId().isBlank()) {
                user.setGoogleId(googleId);
            }
            // Activate if unverified (Google email is verified)
            if ("UNVERIFIED".equals(user.getStatus())) {
                user.setStatus("ACTIVE");
            }
            // Check if banned
            if ("BANNED".equals(user.getStatus())) {
                response.sendRedirect(frontendUrl + "/oauth-callback?error=" +
                        URLEncoder.encode("Tài khoản đã bị khóa.", StandardCharsets.UTF_8));
                return;
            }
            userRepository.save(user);
        }

        // Re-fetch user with roles eagerly loaded to avoid LazyInitializationException
        user = userRepository.findByIdWithRoles(user.getId()).orElse(user);

        // Generate JWT
        String token = generateToken(user);

        // Redirect to frontend with token
        response.sendRedirect(frontendUrl + "/oauth-callback?token=" + token);
    }

    private String generateUniqueUsername(String name, String email) {
        // Try email prefix first
        String base = email.split("@")[0];
        if (!userRepository.existsByUsername(base)) {
            return base;
        }
        // Try name
        if (name != null && !name.isBlank()) {
            String normalized = name.replaceAll("\\s+", "").toLowerCase();
            if (!userRepository.existsByUsername(normalized)) {
                return normalized;
            }
        }
        // Append random suffix
        return base + "_" + UUID.randomUUID().toString().substring(0, 6);
    }

    private String generateToken(Users user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("justin.nguyen")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(validDuration, ChronoUnit.SECONDS).toEpochMilli()))
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", buildScope(user))
                .claim("userId", user.getId())
                .claim("email", user.getEmail())
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(jwtVaultProps.getKey().getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Cannot create token for OAuth2 user", e);
            throw new RuntimeException(e);
        }
    }

    private String buildScope(Users user) {
        StringJoiner stringJoiner = new StringJoiner(" ");
        if (!CollectionUtils.isEmpty(user.getRoles())) {
            user.getRoles().forEach(role -> {
                stringJoiner.add("ROLE_" + role.getName());
                if (!CollectionUtils.isEmpty(role.getPermissions())) {
                    role.getPermissions().forEach(permission -> stringJoiner.add(permission.getName()));
                }
            });
        }
        return stringJoiner.toString();
    }
}
