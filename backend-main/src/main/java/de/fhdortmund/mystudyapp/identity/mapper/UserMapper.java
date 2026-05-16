package de.fhdortmund.mystudyapp.identity.mapper;

import de.fhdortmund.mystudyapp.identity.dto.UserDto;
import de.fhdortmund.mystudyapp.identity.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserDto toDto(User user) {
        if (user == null) return null;
        return UserDto.builder()
                .id(user.getId())
                .universityEmail(user.getUniversityEmail())
                .displayName(user.getDisplayName())
                .bio(user.getBio())
                .role(user.getRole())
                .trustLevel(user.getTrustLevel())
                .createdAt(user.getCreatedAt())
                .build();
    }
}