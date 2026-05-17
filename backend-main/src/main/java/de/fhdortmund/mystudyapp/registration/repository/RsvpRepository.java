package de.fhdortmund.mystudyapp.registration.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import de.fhdortmund.mystudyapp.registration.model.Rsvp;
import de.fhdortmund.mystudyapp.registration.model.RsvpStatus;

@Repository
public interface RsvpRepository extends JpaRepository<Rsvp, UUID> {

    /* -------------------- Single lookup -------------------- */

    Optional<Rsvp> findByEventIdAndUserId(UUID eventId, UUID userId);

    boolean existsByEventIdAndUserId(UUID eventId, UUID userId);

    /* -------------------- By Event -------------------- */

    List<Rsvp> findByEventId(UUID eventId);

    Page<Rsvp> findByEventId(UUID eventId, Pageable pageable);

    List<Rsvp> findByEventIdAndStatus(UUID eventId, RsvpStatus status);

    Page<Rsvp> findByEventIdAndStatus(UUID eventId, RsvpStatus status, Pageable pageable);

    /**
     * Ordered by creation time (FIFO) for waitlist promotion.
     */
    List<Rsvp> findByEventIdAndStatusOrderByCreatedAtAsc(UUID eventId, RsvpStatus status);

    /**
     * Get the first waitlisted user to promote when a spot opens.
     */
    Optional<Rsvp> findFirstByEventIdAndStatusOrderByCreatedAtAsc(UUID eventId, RsvpStatus status);

    /* -------------------- Capacity & Counts -------------------- */

    long countByEventIdAndStatus(UUID eventId, RsvpStatus status);

    /**
     * Count all active RSVPs (GOING + WAITLISTED) for an event.
     * Useful for admin dashboards or interest metrics.
     */
    @Query("SELECT COUNT(r) FROM Rsvp r WHERE r.event.id = :eventId AND r.status IN ('GOING', 'WAITLISTED')")
    long countActiveByEventId(@Param("eventId") UUID eventId);

    /* -------------------- By User -------------------- */

    List<Rsvp> findByUserId(UUID userId);

    Page<Rsvp> findByUserId(UUID userId, Pageable pageable);

    List<Rsvp> findByUserIdAndStatus(UUID userId, RsvpStatus status);

    Page<Rsvp> findByUserIdAndStatus(UUID userId, RsvpStatus status, Pageable pageable);

    /* -------------------- Bulk / Admin -------------------- */

    /**
     * Find all RSVPs across events hosted by a specific user.
     * Useful for hosts managing their event attendance.
     */
    @Query("SELECT r FROM Rsvp r JOIN r.event e WHERE e.host.id = :hostId AND r.status = :status")
    List<Rsvp> findByHostIdAndStatus(@Param("hostId") UUID hostId, @Param("status") RsvpStatus status);

    /**
     * Find all attended RSVPs for a specific event — used for attendance marking.
     */
    @Query("SELECT r FROM Rsvp r WHERE r.event.id = :eventId AND r.status = 'ATTENDED'")
    List<Rsvp> findAttendedByEventId(@Param("eventId") UUID eventId);
}