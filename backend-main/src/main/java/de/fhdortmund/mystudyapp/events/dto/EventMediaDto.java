package de.fhdortmund.mystudyapp.events.dto;

import de.fhdortmund.mystudyapp.events.model.MediaType;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class EventMediaDto {
    private UUID id;
    private String url;
    private MediaType mediaType;
    private String filename;
}