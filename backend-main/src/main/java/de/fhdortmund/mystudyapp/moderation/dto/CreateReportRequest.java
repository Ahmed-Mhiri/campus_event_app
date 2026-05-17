package de.fhdortmund.mystudyapp.moderation.dto;

import java.util.UUID;

import de.fhdortmund.mystudyapp.moderation.model.ReportReason;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateReportRequest {
    @NotNull(message = "Event ID is required")
    private UUID eventId;

    @NotNull(message = "Reason is required")
    private ReportReason reason;

    @Size(max = 2000, message = "Details must not exceed 2000 characters")
    private String details;
}