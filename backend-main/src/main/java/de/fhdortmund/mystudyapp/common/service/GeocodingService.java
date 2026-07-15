package de.fhdortmund.mystudyapp.common.service;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class GeocodingService {

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

    /**
     * Converts address components into latitude/longitude using Nominatim (OpenStreetMap).
     * Returns {lat, lon} or null if geocoding fails.
     */
    public double[] getCoordinates(String street, String city, String postalCode, String country) {
        // Build a query string: "street, city, postalCode country"
        String query = String.format("%s, %s, %s %s",
                street != null ? street : "",
                city != null ? city : "",
                postalCode != null ? postalCode : "",
                country != null ? country : "DE"
        ).trim().replaceAll("\\s+,", ","); // clean up

        if (query.isEmpty()) {
            log.warn("Geocoding query is empty – cannot resolve coordinates.");
            return null;
        }

        String url = UriComponentsBuilder.fromHttpUrl(NOMINATIM_URL)
                .queryParam("q", query)
                .queryParam("format", "json")
                .queryParam("limit", 1)
                .build().toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "MyStudyApp/1.0 (contact@mystudyapp.de)");
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, JsonNode.class);
            JsonNode body = response.getBody();
            if (body != null && body.isArray() && body.size() > 0) {
                JsonNode first = body.get(0);
                double lat = first.get("lat").asDouble();
                double lon = first.get("lon").asDouble();
                log.debug("Geocoded '{}' → lat={}, lon={}", query, lat, lon);
                return new double[]{lat, lon};
            } else {
                log.warn("No geocoding results for '{}'", query);
            }
        } catch (Exception e) {
            log.warn("Geocoding failed for '{}': {}", query, e.getMessage());
        }
        return null;
    }
}