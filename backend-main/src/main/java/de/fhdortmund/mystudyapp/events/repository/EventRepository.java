package de.fhdortmund.mystudyapp.events.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import de.fhdortmund.mystudyapp.events.model.Event;
import de.fhdortmund.mystudyapp.events.model.EventStatus;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {

    /* -------------------- Trust / Review Queries -------------------- */

    @Query("""
            SELECT COUNT(DISTINCT e.id)
            FROM Event e
            JOIN Review r ON r.event.id = e.id
            WHERE e.host.id = :userId
              AND e.status = 'COMPLETED'
            """)
    Long countCompletedReviewedEventsByHostId(@Param("userId") UUID userId);

    @Query("SELECT COUNT(e) FROM Event e WHERE e.host.id = :userId AND e.status = 'COMPLETED'")
    Long countCompletedEventsByHostId(@Param("userId") UUID userId);

    @Query("""
            SELECT COUNT(e) > 0
            FROM Event e
            JOIN Review r ON r.event.id = e.id
            WHERE e.host.id = :userId
              AND e.status = 'COMPLETED'
            """)
    Boolean hasCompletedReviewedEvents(@Param("userId") UUID userId);

    @Query("SELECT e.id FROM Event e WHERE e.host.id = :userId AND e.status = 'COMPLETED'")
    List<UUID> findCompletedEventIdsByHostId(@Param("userId") UUID userId);

    /* -------------------- Host Queries -------------------- */

    List<Event> findByHostId(UUID hostId);

    List<Event> findByHostIdAndStatus(UUID hostId, EventStatus status);

    /* -------------------- Feed / Pagination Queries -------------------- */

    Page<Event> findByStatus(EventStatus status, Pageable pageable);

    Page<Event> findByHostId(UUID hostId, Pageable pageable);
}