package de.fhdortmund.mystudyapp.moderation.mapper;

import org.springframework.stereotype.Component;

import de.fhdortmund.mystudyapp.identity.mapper.UserMapper;
import de.fhdortmund.mystudyapp.moderation.dto.ReviewDto;
import de.fhdortmund.mystudyapp.moderation.model.Review;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ReviewMapper {

    private final UserMapper userMapper;

    public ReviewDto toDto(Review review) {
        if (review == null) return null;
        return ReviewDto.builder()
                .id(review.getId())
                .eventId(review.getEvent().getId())
                .reviewer(userMapper.toDto(review.getReviewer()))
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}