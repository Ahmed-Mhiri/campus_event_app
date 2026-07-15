package de.fhdortmund.mystudyapp.events.mapper;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import de.fhdortmund.mystudyapp.events.dto.CategoryDto;
import de.fhdortmund.mystudyapp.events.dto.EventDto;
import de.fhdortmund.mystudyapp.events.dto.EventMediaDto;
import de.fhdortmund.mystudyapp.events.dto.HostDto;
import de.fhdortmund.mystudyapp.events.model.Event;
import de.fhdortmund.mystudyapp.events.model.EventMedia;
import de.fhdortmund.mystudyapp.events.repository.EventRepository;
import de.fhdortmund.mystudyapp.identity.mapper.UserMapper;
import de.fhdortmund.mystudyapp.moderation.repository.ReviewRepository;
import de.fhdortmund.mystudyapp.registration.model.Rsvp;
import de.fhdortmund.mystudyapp.registration.repository.RsvpRepository;
import de.fhdortmund.mystudyapp.weather.dto.WeatherAssessment;
import de.fhdortmund.mystudyapp.weather.repository.CityWeatherRepository;
import de.fhdortmund.mystudyapp.weather.service.WeatherRiskEngine;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class EventMapper {

    private final UserMapper userMapper;
    private final RsvpRepository rsvpRepository;
    private final EventRepository eventRepository;
    private final ReviewRepository reviewRepository;

    // ==================== PHASE 5 – NEW DEPENDENCIES ====================
    private final CityWeatherRepository cityWeatherRepository;
    private final WeatherRiskEngine riskEngine;

    public EventDto toDto(Event event, UUID currentUserId) {
        if (event == null) return null;

        Set<CategoryDto> categories = event.getEventCategories().stream()
                .map(ec -> CategoryDto.builder()
                        .id(ec.getCategory().getId())
                        .name(ec.getCategory().getName())
                        .icon(ec.getCategory().getIcon())
                        .color(ec.getCategory().getColor())
                        .sortOrder(ec.getCategory().getSortOrder())
                        .build())
                .collect(Collectors.toSet());

        boolean isHost = currentUserId != null && event.getHost() != null
                && currentUserId.equals(event.getHost().getId());

        Rsvp myRsvp = null;
        if (currentUserId != null) {
            myRsvp = rsvpRepository.findByEventIdAndUserId(event.getId(), currentUserId).orElse(null);
        }

        HostDto hostDto = buildHostDto(event.getHost());

        // Start building
        EventDto.EventDtoBuilder dtoBuilder = EventDto.builder()
                .id(event.getId())
                .host(hostDto)
                .title(event.getTitle())
                .description(event.getDescription())
                .location(event.getLocation())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .maxCapacity(event.getMaxCapacity())
                .currentRsvpCount(event.getCurrentRsvpCount())
                .status(event.getStatus())
                .categories(categories)
                .media(mapMedia(event))
                .createdAt(event.getCreatedAt())
                .isHost(isHost)
                .deleted(event.getDeletedAt() != null)
                .myRsvpStatus(myRsvp != null ? myRsvp.getStatus() : null)
                // Phase 2 fields
                .slug(event.getSlug())
                .viewCount(event.getViewCount())
                .cancellationReason(event.getCancellationReason())
                // Phase 2 address fields
                .venueName(event.getVenueName())
                .street(event.getStreet())
                .city(event.getCity())
                .postalCode(event.getPostalCode())
                .country(event.getCountry())
                .latitude(event.getLatitude())
                .longitude(event.getLongitude())
                .isOutdoor(event.isOutdoor());

        // ==================== PHASE 5 – WEATHER ASSESSMENT ====================
        if (event.isOutdoor() && event.getCity() != null && event.getStartTime() != null) {
            LocalDate eventDate = event.getStartTime().atZone(ZoneId.systemDefault()).toLocalDate();
            LocalDate now = LocalDate.now();
            // Only if event date is within the next 14 days
            if (!eventDate.isBefore(now) && eventDate.isBefore(now.plusDays(14))) {
                cityWeatherRepository.findByCityAndDate(event.getCity(), eventDate)
                        .ifPresent(forecast -> {
                            WeatherAssessment assessment = riskEngine.assess(forecast);
                            dtoBuilder.weatherRisk(assessment.getRisk())
                                      .weatherRecommendation(assessment.getRecommendation())
                                      .weatherTemperature(forecast.getTempMax())
                                      .weatherRainProbability(forecast.getRainProbability())
                                      .weatherAvailable(assessment.isAvailable());
                        });
            }
        }

        return dtoBuilder.build();
    }

    public EventDto toDto(Event event) {
        return toDto(event, null);
    }

    /**
     * PHASE 0: Builds a HostDto with trust-level aggregates.
     */
    private HostDto buildHostDto(de.fhdortmund.mystudyapp.identity.model.User host) {
        if (host == null) return null;

        UUID hostId = host.getId();

        Long completedEventsWithReviews = eventRepository.countCompletedReviewedEventsByHostId(hostId);
        Double averageHostRating = reviewRepository.calculateAverageRatingByHostId(hostId);
        Long totalHostReviews = reviewRepository.countTotalReviewsByHostId(hostId);

        return HostDto.builder()
                .id(hostId)
                .displayName(host.getDisplayName())
                .profileImageUrl(host.getProfileImageUrl())
                .trustLevel(host.getTrustLevel())
                .averageHostRating(averageHostRating != null ? averageHostRating : 0.0)
                .totalHostReviews(totalHostReviews != null ? totalHostReviews : 0L)
                .completedEventsWithReviews(completedEventsWithReviews != null ? completedEventsWithReviews : 0L)
                .build();
    }

    private List<EventMediaDto> mapMedia(Event event) {
        if (event.getEventMedia() == null) return Collections.emptyList();
        return event.getEventMedia().stream()
                .sorted(Comparator.comparing(EventMedia::getDisplayOrder, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(EventMedia::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(m -> EventMediaDto.builder()
                        .id(m.getId())
                        .url(m.getUrl())
                        .mediaType(m.getMediaType())
                        .filename(m.getFilename())
                        .thumbnailUrl(m.getThumbnailUrl())
                        .mediumUrl(m.getMediumUrl())
                        .displayOrder(m.getDisplayOrder())
                        .build())
                .collect(Collectors.toList());
    }
}