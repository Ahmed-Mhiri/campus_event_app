package de.fhdortmund.mystudyapp.mqtt.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * JSON shape published by backend-asta:
 * {
 *   "activity_name": "Campus Festival",
 *   "time": "2024-06-15 18:00",
 *   "venue": "Campusplatz",
 *   "organiser": "AStA Kultur"
 * }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OfficialEventMessage {
    private String activityName;
    private String time;
    private String venue;
    private String organiser;
}