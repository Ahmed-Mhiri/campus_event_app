package de.fhdortmund.mystudyapp.weather.dto;

import java.util.List;

import de.fhdortmund.mystudyapp.weather.model.WeatherRisk;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class WeatherAssessment {
    WeatherRisk risk;
    String recommendation;
    List<String> warnings;
    Integer temperature;           // °C
    Integer rainProbability;       // 0-100
    Integer windSpeed;             // km/h
    Integer conditionCode;         // WMO code (optional)
    boolean available;             // true if forecast exists

    public static WeatherAssessment unavailable() {
        return WeatherAssessment.builder()
                .available(false)
                .risk(WeatherRisk.GOOD)
                .recommendation("Forecast not yet available (check 14 days in advance).")
                .build();
    }
}