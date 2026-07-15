package de.fhdortmund.weather.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import de.fhdortmund.mystudyapp.weather.dto.CityForecast;
import de.fhdortmund.weather.config.CityList;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class WeatherFetcher {

    private final MqttPublisher mqttPublisher;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();  // used in previous version, kept for now

    private static final String OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

    @Scheduled(cron = "0 0 */6 * * *")
    public void fetchAndPublish() {
        List<CityForecast> allForecasts = new ArrayList<>();

        for (var entry : CityList.CITIES.entrySet()) {
            String city = entry.getKey();
            double lat = entry.getValue()[0];
            double lon = entry.getValue()[1];

            String url = UriComponentsBuilder
                    .fromUriString(OPEN_METEO_URL)           // ← Changed from fromHttpUrl
                    .queryParam("latitude", lat)
                    .queryParam("longitude", lon)
                    .queryParam("daily", "weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max")
                    .queryParam("timezone", "Europe/Berlin")
                    .queryParam("forecast_days", 14)
                    .build()
                    .toUriString();

            try {
                JsonNode response = restTemplate.getForObject(url, JsonNode.class);
                if (response == null) continue;

                JsonNode daily = response.get("daily");
                JsonNode times = daily.get("time");

                for (int i = 0; i < times.size(); i++) {
                    CityForecast cf = new CityForecast();
                    cf.setCity(city);
                    cf.setDate(LocalDate.parse(times.get(i).asText()));
                    cf.setConditionCode(daily.get("weathercode").get(i).asInt());
                    cf.setTempMax((int) daily.get("temperature_2m_max").get(i).asDouble());
                    cf.setRainProbability(daily.get("precipitation_probability_max").get(i).asInt());
                    cf.setWindSpeed((int) daily.get("windspeed_10m_max").get(i).asDouble());

                    allForecasts.add(cf);
                }
            } catch (Exception e) {
                log.error("Failed to fetch weather for {}: {}", city, e.getMessage());
            }
        }

        if (!allForecasts.isEmpty()) {
            mqttPublisher.publishForecasts(allForecasts);
        }
    }
}