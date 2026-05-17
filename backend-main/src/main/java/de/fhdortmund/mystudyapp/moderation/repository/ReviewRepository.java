package de.fhdortmund.mystudyapp.moderation.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import de.fhdortmund.mystudyapp.moderation.model.Review;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {

    // Average rating across all reviews left for events hosted by this user
    @Query("SELECT AVG(r.rating) FROM Review r JOIN r.event e WHERE e.host.id = :userId")
    Double calculateAverageRatingByHostId(@Param("userId") UUID userId);

    // Find all reviews for a specific event
    List<Review> findByEventId(UUID eventId);

    // Paginated reviews for a specific event
    Page<Review> findByEventId(UUID eventId, Pageable pageable);

    // Find all reviews by a specific user
    List<Review> findByReviewerId(UUID reviewerId);

    // Paginated reviews by a specific user
    Page<Review> findByReviewerId(UUID reviewerId, Pageable pageable);

    // Find all reviews for events hosted by a specific user
    @Query("SELECT r FROM Review r JOIN r.event e WHERE e.host.id = :hostId")
    List<Review> findReviewsForHostEvents(@Param("hostId") UUID hostId);

    // Paginated reviews for events hosted by a specific user
    @Query(value = "SELECT r FROM Review r JOIN r.event e WHERE e.host.id = :hostId",
           countQuery = "SELECT COUNT(r) FROM Review r JOIN r.event e WHERE e.host.id = :hostId")
    Page<Review> findReviewsForHostEvents(@Param("hostId") UUID hostId, Pageable pageable);

    // Get average rating for a specific event
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.event.id = :eventId")
    Double calculateAverageRatingByEventId(@Param("eventId") UUID eventId);

    // Count reviews for a specific event
    long countByEventId(UUID eventId);

    // Check if a user has already reviewed an event (to prevent duplicate reviews)
    boolean existsByEventIdAndReviewerId(UUID eventId, UUID reviewerId);

    // Get rating distribution for a host's events
    @Query("SELECT r.rating, COUNT(r) FROM Review r JOIN r.event e WHERE e.host.id = :hostId GROUP BY r.rating")
    List<Object[]> getRatingDistributionForHost(@Param("hostId") UUID hostId);
}