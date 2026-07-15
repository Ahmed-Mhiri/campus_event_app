package de.fhdortmund.mystudyapp.weather.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import de.fhdortmund.mystudyapp.weather.dto.WeatherAssessment;
import de.fhdortmund.mystudyapp.weather.model.CityWeather;
import de.fhdortmund.mystudyapp.weather.model.WeatherRisk;

@Service
public class WeatherRiskEngine {

    public WeatherAssessment assess(CityWeather forecast) {
        if (forecast == null) {
            return WeatherAssessment.unavailable();
        }

        WeatherRisk risk = WeatherRisk.GOOD;
        List<String> warnings = new ArrayList<>();

        int rain = forecast.getRainProbability();
        int wind = forecast.getWindSpeed();
        int temp = forecast.getTempMax();
        int code = forecast.getConditionCode();

        // Thunderstorm (WMO 95-99) → CANCELLED
        if (code >= 95 && code <= 99) {
            risk = WeatherRisk.CANCELLED;
            warnings.add("Severe thunderstorm warning – outdoor event must be cancelled.");
        }

        // Heavy rain
        if (rain > 70) {
            risk = WeatherRisk.DANGER;
            warnings.add("Heavy rain (>70%) – consider moving indoors or postponing.");
        } else if (rain > 40) {
            if (risk.ordinal() < WeatherRisk.MODERATE.ordinal()) risk = WeatherRisk.MODERATE;
            warnings.add("Moderate rain probability – have a backup plan.");
        }

        // Wind
        if (wind > 60) {
            risk = WeatherRisk.DANGER;
            warnings.add("Strong winds (>60 km/h) – risk of structural damage.");
        } else if (wind > 30) {
            if (risk.ordinal() < WeatherRisk.MODERATE.ordinal()) risk = WeatherRisk.MODERATE;
            warnings.add("Breezy conditions – secure loose items.");
        }

        // Temperature extremes
        if (temp > 35) {
            risk = WeatherRisk.DANGER;
            warnings.add("Extreme heat (>35°C) – health risk; provide shade and hydration.");
        } else if (temp > 30) {
            if (risk.ordinal() < WeatherRisk.MODERATE.ordinal()) risk = WeatherRisk.MODERATE;
            warnings.add("High temperature – stay hydrated.");
        }

        // Generate final recommendation
        String recommendation = generateRecommendation(risk, warnings);

        return WeatherAssessment.builder()
                .risk(risk)
                .recommendation(recommendation)
                .warnings(warnings)
                .temperature(temp)
                .rainProbability(rain)
                .windSpeed(wind)
                .conditionCode(code)
                .available(true)
                .build();
    }

    private String generateRecommendation(WeatherRisk risk, List<String> warnings) {
        if (risk == WeatherRisk.CANCELLED) {
            return "⚠️ Event should be cancelled for safety.";
        }
        if (risk == WeatherRisk.DANGER) {
            return "🔴 We strongly recommend postponing or moving indoors.";
        }
        if (risk == WeatherRisk.MODERATE) {
            return "🟡 Some weather concerns. Have a contingency plan.";
        }
        return "✅ Weather looks good – enjoy your outdoor event!";
    }
}