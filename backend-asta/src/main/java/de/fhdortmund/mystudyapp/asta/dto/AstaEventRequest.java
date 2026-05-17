package de.fhdortmund.mystudyapp.asta.dto;

import lombok.Data;

@Data
public class AstaEventRequest {
    private String activityName;
    private String time;
    private String venue;
    private String organiser;
}