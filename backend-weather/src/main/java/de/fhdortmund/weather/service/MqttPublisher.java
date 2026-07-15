package de.fhdortmund.weather.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.fhdortmund.mystudyapp.weather.dto.CityForecast;   // ✅ fixed
import de.fhdortmund.mystudyapp.weather.dto.WeatherPayload; // ✅ fixed
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.integration.annotation.MessagingGateway;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class MqttPublisher {

    @MessagingGateway(defaultRequestChannel = "mqttWeatherOutboundChannel")
    public interface WeatherMqttGateway {
        void sendWeather(String payload);
    }

    private final WeatherMqttGateway gateway;
    private final ObjectMapper objectMapper;

    public void publishForecasts(List<CityForecast> forecasts) {
        try {
            WeatherPayload payload = new WeatherPayload();
            payload.setTimestamp(Instant.now());
            payload.setForecasts(forecasts);
            String json = objectMapper.writeValueAsString(payload);
            gateway.sendWeather(json);
            log.info("Published weather forecasts for {} city-days", forecasts.size());
        } catch (Exception e) {
            log.error("Failed to publish weather", e);
        }
    }
}