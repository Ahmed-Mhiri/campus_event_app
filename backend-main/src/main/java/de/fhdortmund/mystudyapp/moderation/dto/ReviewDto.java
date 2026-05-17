package de.fhdortmund.mystudyapp.moderation.dto;

import java.time.Instant;
import java.util.UUID;

import de.fhdortmund.mystudyapp.identity.dto.UserDto;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReviewDto {
    private UUID id;
    private UUID eventId;
    private UserDto reviewer;
    private Integer rating;
    private String comment;
    private Instant createdAt;
}