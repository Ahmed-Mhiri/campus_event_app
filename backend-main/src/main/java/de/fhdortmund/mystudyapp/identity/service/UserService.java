package de.fhdortmund.mystudyapp.identity.service;

import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import de.fhdortmund.mystudyapp.common.exception.ResourceNotFoundException;
import de.fhdortmund.mystudyapp.identity.dto.AuthResponse;
import de.fhdortmund.mystudyapp.identity.dto.LoginRequest;
import de.fhdortmund.mystudyapp.identity.dto.RegisterRequest;
import de.fhdortmund.mystudyapp.identity.dto.UserDto;
import de.fhdortmund.mystudyapp.identity.mapper.UserMapper;
import de.fhdortmund.mystudyapp.identity.model.Role;
import de.fhdortmund.mystudyapp.identity.model.TrustLevel;
import de.fhdortmund.mystudyapp.identity.model.User;
import de.fhdortmund.mystudyapp.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;
    private final de.fhdortmund.mystudyapp.common.security.JwtUtil jwtUtil;

    // Simple in-memory token blacklist for logout (use Redis in production)
    private final Set<String> blacklistedTokens = ConcurrentHashMap.newKeySet();

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUniversityEmail(request.getUniversityEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = User.builder()
                .universityEmail(request.getUniversityEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .displayName(request.getDisplayName().trim())
                .role(Role.STUDENT)
                .trustLevel(TrustLevel.NEW)
                .build();

        User saved = userRepository.save(user);

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                saved.getUniversityEmail(), null, java.util.Collections.emptyList()
        );

        String accessToken = jwtUtil.generateAccessToken(
                authentication, saved.getId(), saved.getRole().name(), saved.getTrustLevel().name()
        );
        String refreshToken = jwtUtil.generateRefreshToken(authentication, saved.getId());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(900)
                .user(userMapper.toDto(saved))
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUniversityEmail().toLowerCase().trim(),
                            request.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            User user = userRepository.findByUniversityEmail(authentication.getName())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            if (user.getTrustLevel() == TrustLevel.FLAGGED) {
                throw new LockedException("Account has been flagged. Contact support.");
            }

            String accessToken = jwtUtil.generateAccessToken(
                    authentication, user.getId(), user.getRole().name(), user.getTrustLevel().name()
            );
            String refreshToken = jwtUtil.generateRefreshToken(authentication, user.getId());

            return AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(900)
                    .user(userMapper.toDto(user))
                    .build();

        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Invalid email or password");
        }
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtUtil.validateToken(refreshToken) || !jwtUtil.isRefreshToken(refreshToken)) {
            throw new BadCredentialsException("Invalid refresh token");
        }

        if (blacklistedTokens.contains(refreshToken)) {
            throw new BadCredentialsException("Token has been revoked");
        }

        String email = jwtUtil.getEmailFromToken(refreshToken);
        UUID userId = jwtUtil.getUserIdFromToken(refreshToken);

        User user = userRepository.findByUniversityEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                email, null, java.util.Collections.emptyList()
        );

        String newAccessToken = jwtUtil.generateAccessToken(
                authentication, userId, user.getRole().name(), user.getTrustLevel().name()
        );
        String newRefreshToken = jwtUtil.generateRefreshToken(authentication, userId);

        // Rotate refresh token: blacklist old one
        blacklistedTokens.add(refreshToken);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(900)
                .user(userMapper.toDto(user))
                .build();
    }

    public void logout(String token) {
        if (token != null && jwtUtil.validateToken(token)) {
            blacklistedTokens.add(token);
        }
        SecurityContextHolder.clearContext();
    }

    public boolean isTokenBlacklisted(String token) {
        return blacklistedTokens.contains(token);
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(String email) {
        User user = userRepository.findByUniversityEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return userMapper.toDto(user);
    }
}