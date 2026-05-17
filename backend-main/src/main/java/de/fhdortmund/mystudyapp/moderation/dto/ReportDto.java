package de.fhdortmund.mystudyapp.moderation.dto;

import java.time.Instant;
import java.util.UUID;

import de.fhdortmund.mystudyapp.identity.dto.UserDto;
import de.fhdortmund.mystudyapp.moderation.model.ReportReason;
import de.fhdortmund.mystudyapp.moderation.model.ReportStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReportDto {
    private UUID id;
    private UUID eventId;
    private String eventTitle;
    private UserDto reporter;
    private ReportReason reason;
    private String details;
    private ReportStatus status;
    private Instant createdAt;
}