package de.fhdortmund.mystudyapp.identity.service;

import java.time.Instant;
import java.util.Collections;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
import de.fhdortmund.mystudyapp.common.security.JwtUtil;
import de.fhdortmund.mystudyapp.common.service.FileStorageService;
import de.fhdortmund.mystudyapp.events.repository.EventRepository;
import de.fhdortmund.mystudyapp.identity.dto.AuthResponse;
import de.fhdortmund.mystudyapp.identity.dto.ForgotPasswordRequest;
import de.fhdortmund.mystudyapp.identity.dto.LoginRequest;
import de.fhdortmund.mystudyapp.identity.dto.PublicProfileDto;
import de.fhdortmund.mystudyapp.identity.dto.RegisterRequest;
import de.fhdortmund.mystudyapp.identity.dto.ResetPasswordRequest;
import de.fhdortmund.mystudyapp.identity.dto.TrustQualificationStatus;
import de.fhdortmund.mystudyapp.identity.dto.UpdateProfileRequest;
import de.fhdortmund.mystudyapp.identity.dto.UserDto;
import de.fhdortmund.mystudyapp.identity.mapper.PublicProfileMapper;
import de.fhdortmund.mystudyapp.identity.mapper.UserMapper;
import de.fhdortmund.mystudyapp.identity.model.PasswordResetToken;
import de.fhdortmund.mystudyapp.identity.model.Role;
import de.fhdortmund.mystudyapp.identity.model.TrustLevel;
import de.fhdortmund.mystudyapp.identity.model.User;
import de.fhdortmund.mystudyapp.identity.model.VerificationToken;
import de.fhdortmund.mystudyapp.identity.repository.PasswordResetTokenRepository;
import de.fhdortmund.mystudyapp.identity.repository.UserRepository;
import de.fhdortmund.mystudyapp.identity.repository.VerificationTokenRepository;
import de.fhdortmund.mystudyapp.moderation.repository.ReviewRepository;
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
    private final PublicProfileMapper publicProfileMapper;
    private final JwtUtil jwtUtil;
    private final FileStorageService fileStorageService;
    private final EventRepository eventRepository;
    private final ReviewRepository reviewRepository;
    private final TrustLevelService trustLevelService;
    private final VerificationTokenRepository verificationTokenRepository;
    private final EmailService emailService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    private final Set<String> blacklistedTokens = ConcurrentHashMap.newKeySet();

    /* ============================================================
       AUTHENTICATION
       ============================================================ */

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
                .isVerified(false)          // explicit, though @Builder.Default covers it
                .build();

        User saved = userRepository.save(user);

        // Create a 24-hour verification token and email it
        String tokenStr = UUID.randomUUID().toString();
        VerificationToken vToken = VerificationToken.builder()
                .token(tokenStr)
                .user(saved)
                .expiryDate(Instant.now().plusSeconds(86_400))
                .build();
        verificationTokenRepository.save(vToken);
        emailService.sendVerificationEmail(saved.getUniversityEmail(), tokenStr);

        // Do NOT return a JWT yet — the account must be verified first.
        return AuthResponse.builder().build();
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

            return buildAuthResponse(user, authentication);

        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Invalid email or password");
        }
    }

    @Transactional
    public void verifyAccount(String token) {
        VerificationToken vToken = verificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or already-used verification link"));

        if (vToken.getExpiryDate().isBefore(Instant.now())) {
            verificationTokenRepository.delete(vToken); // clean up expired token
            throw new IllegalArgumentException("Verification link has expired. Please register again.");
        }

        User user = vToken.getUser();
        user.setVerified(true);
        userRepository.save(user);

        verificationTokenRepository.delete(vToken); // one-time use
        log.info("User {} successfully verified", user.getUniversityEmail());
    }

    /**
     * Initiates the forgot-password flow.
     *
     * SECURITY: We always return success even when the email is not found.
     * This prevents user-enumeration attacks — an attacker cannot tell whether
     * a given email address is registered by watching the response.
     */
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        String email = request.getUniversityEmail().toLowerCase().trim();

        userRepository.findByUniversityEmail(email).ifPresent(user -> {
            // Invalidate any existing reset tokens for this user first.
            // This means clicking an old reset link after requesting a new one
            // will correctly fail, with no confusion about which link to use.
            passwordResetTokenRepository.deleteAllByUserId(user.getId());

            String tokenStr = UUID.randomUUID().toString();
            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .token(tokenStr)
                    .user(user)
                    .expiryDate(Instant.now().plusSeconds(3_600)) // 1 hour
                    .build();
            passwordResetTokenRepository.save(resetToken);

            emailService.sendPasswordResetEmail(email, tokenStr);
            log.info("Password reset token created for user {}", user.getId());
        });
    }

    /**
     * Validates the reset token and updates the user's password.
     */
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or already-used reset link"));

        if (resetToken.getExpiryDate().isBefore(Instant.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new IllegalArgumentException("Reset link has expired. Please request a new one.");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // One-time use — delete immediately after a successful reset.
        passwordResetTokenRepository.delete(resetToken);

        log.info("Password successfully reset for user {}", user.getId());
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

        // NEW: Block refresh for flagged accounts
        if (user.getTrustLevel() == TrustLevel.FLAGGED) {
            throw new LockedException("Account has been flagged. Contact support.");
        }

        Authentication authentication = createAuthentication(email);
        AuthResponse response = buildAuthResponse(user, authentication);

        blacklistedTokens.add(refreshToken);
        return response;
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
        User user = findUserByEmail(email);
        return userMapper.toDto(user);
    }

    /* ============================================================
       PROFILE MANAGEMENT
       ============================================================ */

    @Transactional(readOnly = true)
    public User findUserByEmail(String email) {
        return userRepository.findByUniversityEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Transactional
    public UserDto updateProfile(String email, UpdateProfileRequest request) {
        User user = findUserByEmail(email);

        userMapper.updateEntity(user, request);

        if (request.getProfileImage() != null && !request.getProfileImage().isEmpty()) {
            if (user.getProfileImageUrl() != null) {
                fileStorageService.deleteAvatar(user.getProfileImageUrl());
            }
            String imageUrl = fileStorageService.storeAvatar(request.getProfileImage(), user.getId());
            user.setProfileImageUrl(imageUrl);
        }

        return userMapper.toDto(userRepository.save(user));
    }

    @Transactional
    public void deleteAccount(String email, String currentToken) {
        User user = findUserByEmail(email);

        if (user.getProfileImageUrl() != null) {
            fileStorageService.deleteAvatar(user.getProfileImageUrl());
        }

        if (currentToken != null) {
            blacklistedTokens.add(currentToken);
        }

        userRepository.delete(user);
        SecurityContextHolder.clearContext();
        log.info("Account deleted: {}", user.getId());
    }

    /* ============================================================
       PUBLIC PROFILES - CLEAN WITH PROPER METRICS
       ============================================================ */

    /**
     * Get public profile with trust metrics based on COMPLETED events with reviews.
     * This prevents the exploit where users could create future events to get promoted.
     */
    @Transactional(readOnly = true)
    public PublicProfileDto getPublicProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Get metrics from completed events with reviews (secure criteria)
        Long completedEventsWithReviews = eventRepository.countCompletedReviewedEventsByHostId(userId);
        Double averageRating = reviewRepository.calculateAverageRatingByHostId(userId);
        
        return publicProfileMapper.toDto(user, completedEventsWithReviews, averageRating);
    }

    /**
     * Get detailed trust qualification status for transparency
     */
    @Transactional(readOnly = true)
    public TrustQualificationStatus getTrustQualificationStatus(UUID userId) {
        return trustLevelService.getQualificationStatus(userId);
    }

    /**
     * Check qualification without side effects
     */
    @Transactional(readOnly = true)
    public boolean qualifiesForTrustedHost(UUID userId) {
        return trustLevelService.qualifiesForTrustedHost(userId);
    }

    @Transactional(readOnly = true)
    public Page<UserDto> searchUsers(String query, Pageable pageable) {
        if (query != null && !query.isBlank()) {
            return userRepository.searchByDisplayNameOrEmail(query, pageable)
                    .map(userMapper::toDto);
        }
        return userRepository.findAll(pageable).map(userMapper::toDto);
    }

    /* ============================================================
       PRIVATE HELPERS
       ============================================================ */

    private Authentication createAuthentication(String email) {
        return new UsernamePasswordAuthenticationToken(
                email, null, Collections.emptyList()
        );
    }

    private AuthResponse buildAuthResponse(User user, Authentication authentication) {
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
    }
}