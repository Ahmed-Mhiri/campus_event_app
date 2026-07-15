package de.fhdortmund.mystudyapp.weather.dto;

import java.time.Instant;
import java.util.List;

import lombok.Data;

@Data
public class WeatherPayload {
    private Instant timestamp;
    private List<CityForecast> forecasts;
}