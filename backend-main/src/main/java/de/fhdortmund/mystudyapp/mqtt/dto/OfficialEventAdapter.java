package de.fhdortmund.mystudyapp.mqtt.dto;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Component;

import de.fhdortmund.mystudyapp.events.model.Event;
import de.fhdortmund.mystudyapp.events.model.EventStatus;
import de.fhdortmund.mystudyapp.identity.model.Role;
import de.fhdortmund.mystudyapp.identity.model.TrustLevel;
import de.fhdortmund.mystudyapp.identity.model.User;
import de.fhdortmund.mystudyapp.mqtt.adapter.EventMessageTarget;

/**
 * ★ STRUCTURAL PATTERN: Adapter
 * Converts AStA's JSON format (activity_name, time, venue) into our internal Event entity.
 */
@Component
public class OfficialEventAdapter implements EventMessageTarget {

    private static final DateTimeFormatter ASTA_TIME_FORMAT = 
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @Override
    public Event adapt(OfficialEventMessage message) {
        // Parse AStA's flat format into our rich domain model
        LocalDateTime startLocal = LocalDateTime.parse(message.getTime(), ASTA_TIME_FORMAT);
        Instant startTime = startLocal.atZone(ZoneId.of("Europe/Berlin")).toInstant();
        Instant endTime = startTime.plusSeconds(7200); // Default 2-hour duration

        // Create a synthetic "AStA Official" host user
        User astaHost = createAstaHost();

        return Event.builder()
                .host(astaHost)
                .title(message.getActivityName())
                .description("Official AStA event: " + message.getActivityName())
                .location(message.getVenue())
                .startTime(startTime)
                .endTime(endTime)
                .maxCapacity(100) // Default for official events
                .currentRsvpCount(0)
                .status(EventStatus.PUBLISHED) // Official events skip review
                .build();
    }

    private User createAstaHost() {
        return User.builder()
                .universityEmail("asta@fh-dortmund.de")
                .displayName("AStA Official")
                .role(Role.ADMIN)
                .trustLevel(TrustLevel.TRUSTED_HOST)
                .build();
    }
}