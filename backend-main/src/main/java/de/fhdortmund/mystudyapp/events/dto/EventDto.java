package de.fhdortmund.mystudyapp.events.dto;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import de.fhdortmund.mystudyapp.events.model.EventStatus;
import de.fhdortmund.mystudyapp.registration.model.RsvpStatus;
import de.fhdortmund.mystudyapp.weather.model.WeatherRisk;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EventDto {
    private UUID id;
    private HostDto host;
    private String title;
    private String description;
    private String location;
    private Instant startTime;
    private Instant endTime;
    private Integer maxCapacity;
    private Integer currentRsvpCount;
    private EventStatus status;
    private Set<CategoryDto> categories;
    private List<EventMediaDto> media;
    private Instant createdAt;
    private boolean isHost;
    private RsvpStatus myRsvpStatus;
    private boolean deleted;

    // Phase 2 – slug, views, cancellation
    private String slug;
    private Long viewCount;
    private String cancellationReason;

    // Phase 2 – address & geodata
    private String venueName;
    private String street;
    private String city;
    private String postalCode;
    private String country;
    private Double latitude;
    private Double longitude;
    private boolean isOutdoor;

    // ==================== PHASE 5 – WEATHER FIELDS ====================
    private WeatherRisk weatherRisk;
    private String weatherRecommendation;
    private Integer weatherTemperature;
    private Integer weatherRainProbability;
    private Boolean weatherAvailable;   // true if forecast exists
}