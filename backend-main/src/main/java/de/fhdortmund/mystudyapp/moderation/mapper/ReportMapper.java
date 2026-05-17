package de.fhdortmund.mystudyapp.moderation.mapper;

import org.springframework.stereotype.Component;

import de.fhdortmund.mystudyapp.identity.mapper.UserMapper;
import de.fhdortmund.mystudyapp.moderation.dto.ReportDto;
import de.fhdortmund.mystudyapp.moderation.model.Report;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ReportMapper {

    private final UserMapper userMapper;

    public ReportDto toDto(Report report) {
        if (report == null) return null;
        return ReportDto.builder()
                .id(report.getId())
                .eventId(report.getEvent().getId())
                .eventTitle(report.getEvent().getTitle())
                .reporter(userMapper.toDto(report.getReporter()))
                .reason(report.getReason())
                .details(report.getDetails())
                .status(report.getStatus())
                .createdAt(report.getCreatedAt())
                .build();
    }
}