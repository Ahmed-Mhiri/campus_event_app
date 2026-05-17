package de.fhdortmund.mystudyapp.events.controller;

import de.fhdortmund.mystudyapp.common.response.ApiResponse;
import de.fhdortmund.mystudyapp.common.response.PageResponse;
import de.fhdortmund.mystudyapp.events.dto.CreateEventRequest;
import de.fhdortmund.mystudyapp.events.dto.EventDto;
import de.fhdortmund.mystudyapp.events.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    /* -------------------- CRUD -------------------- */

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<EventDto>> createEvent(
            @Valid @RequestBody CreateEventRequest request,
            @AuthenticationPrincipal User principal) {
        EventDto event = eventService.createEvent(request, principal.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(event, "Event created successfully"));
    }

    @GetMapping("/{eventId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<EventDto>> getEvent(
            @PathVariable UUID eventId,
            @AuthenticationPrincipal User principal) {
        EventDto event = eventService.getEvent(eventId, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success(event, "Event retrieved"));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PageResponse<EventDto>>> getPublishedEvents(
            @PageableDefault(size = 20, sort = "startTime") Pageable pageable,
            @AuthenticationPrincipal User principal) {
        PageResponse<EventDto> events = eventService.getPublishedEvents(pageable, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success(events, "Events retrieved"));
    }

    @GetMapping("/my-events")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PageResponse<EventDto>>> getMyEvents(
            @PageableDefault(size = 20, sort = "startTime") Pageable pageable,
            @AuthenticationPrincipal User principal) {
        PageResponse<EventDto> events = eventService.getMyEvents(principal.getUsername(), pageable);
        return ResponseEntity.ok(ApiResponse.success(events, "My events retrieved"));
    }

    @PutMapping("/{eventId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<EventDto>> updateEvent(
            @PathVariable UUID eventId,
            @Valid @RequestBody CreateEventRequest request,
            @AuthenticationPrincipal User principal) {
        EventDto event = eventService.updateEvent(eventId, request, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success(event, "Event updated successfully"));
    }

    @PatchMapping("/{eventId}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<EventDto>> cancelEvent(
            @PathVariable UUID eventId,
            @AuthenticationPrincipal User principal) {
        EventDto event = eventService.cancelEvent(eventId, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success(event, "Event cancelled successfully"));
    }

    @DeleteMapping("/{eventId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(
            @PathVariable UUID eventId,
            @AuthenticationPrincipal User principal) {
        eventService.deleteEvent(eventId, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success(null, "Event deleted successfully"));
    }

    /* -------------------- Media -------------------- */

    @PostMapping(value = "/{eventId}/media", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<EventDto>> uploadMedia(
            @PathVariable UUID eventId,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @RequestParam(value = "videos", required = false) List<MultipartFile> videos,
            @AuthenticationPrincipal User principal) {
        EventDto event = eventService.addMedia(eventId, images, videos, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success(event, "Media uploaded successfully"));
    }

    @DeleteMapping("/{eventId}/media/{mediaId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<EventDto>> deleteMedia(
            @PathVariable UUID eventId,
            @PathVariable UUID mediaId,
            @AuthenticationPrincipal User principal) {
        EventDto event = eventService.removeMedia(eventId, mediaId, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success(event, "Media removed successfully"));
    }
}