package de.fhdortmund.mystudyapp.weather.dto;

import lombok.Data;
import java.time.Instant;
import java.util.List;

@Data
public class WeatherPayload {
    private Instant timestamp;
    private List<CityForecast> forecasts;
}
