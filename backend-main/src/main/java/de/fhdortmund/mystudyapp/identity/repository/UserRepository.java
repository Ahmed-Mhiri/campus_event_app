package de.fhdortmund.mystudyapp.identity.repository;

import de.fhdortmund.mystudyapp.identity.model.TrustLevel;
import de.fhdortmund.mystudyapp.identity.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    // ─── Auth Essentials ───

    Optional<User> findByUniversityEmail(String universityEmail);

    boolean existsByUniversityEmail(String universityEmail);

    // ─── Admin & Moderation ───

    Page<User> findByTrustLevel(TrustLevel trustLevel, Pageable pageable);

    @Modifying
    @Query("UPDATE User u SET u.trustLevel = :trustLevel WHERE u.id = :userId")
    void updateTrustLevel(@Param("userId") UUID userId, @Param("trustLevel") TrustLevel trustLevel);

    // ─── Search ───

    @Query("SELECT u FROM User u WHERE LOWER(u.displayName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(u.universityEmail) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<User> searchByDisplayNameOrEmail(@Param("query") String query, Pageable pageable);
}