package de.fhdortmund.mystudyapp.moderation.controller;

import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import de.fhdortmund.mystudyapp.common.response.ApiResponse;
import de.fhdortmund.mystudyapp.common.response.PageResponse;
import de.fhdortmund.mystudyapp.moderation.dto.CreateReviewRequest;
import de.fhdortmund.mystudyapp.moderation.dto.ReviewDto;
import de.fhdortmund.mystudyapp.moderation.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/reviews")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ReviewDto>> createReview(
            @Valid @RequestBody CreateReviewRequest request,
            @AuthenticationPrincipal User principal) {
        ReviewDto review = reviewService.createReview(request, principal.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(review, "Review submitted successfully"));
    }

    @GetMapping("/reviews/event/{eventId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PageResponse<ReviewDto>>> getEventReviews(
            @PathVariable UUID eventId,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        PageResponse<ReviewDto> reviews = reviewService.getReviewsByEventId(eventId, pageable);
        return ResponseEntity.ok(ApiResponse.success(reviews, "Reviews retrieved"));
    }

    @GetMapping("/reviews/host/{hostId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PageResponse<ReviewDto>>> getHostReviews(
            @PathVariable UUID hostId,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        PageResponse<ReviewDto> reviews = reviewService.getReviewsByHostId(hostId, pageable);
        return ResponseEntity.ok(ApiResponse.success(reviews, "Host reviews retrieved"));
    }

    @DeleteMapping("/reviews/{reviewId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @PathVariable UUID reviewId,
            @AuthenticationPrincipal User principal) {
        reviewService.deleteReview(reviewId, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success(null, "Review deleted successfully"));
    }
}