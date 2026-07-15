package de.fhdortmund.mystudyapp.weather.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CityForecast {
    private String city;
    private LocalDate date;
    private Integer conditionCode;   // WMO weather code
    private Integer tempMax;         // °C
    private Integer rainProbability; // 0-100
    private Integer windSpeed;       // km/h
}