package de.fhdortmund.mystudyapp.identity.dto;

import de.fhdortmund.mystudyapp.identity.model.Role;
import de.fhdortmund.mystudyapp.identity.model.TrustLevel;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class UserDto {

    private UUID id;
    private String universityEmail;
    private String displayName;
    private String bio;
    private Role role;
    private TrustLevel trustLevel;
    private Instant createdAt;
}