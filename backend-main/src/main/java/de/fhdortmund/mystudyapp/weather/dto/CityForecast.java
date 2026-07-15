package de.fhdortmund.mystudyapp.weather.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CityForecast {
    private String city;
    private LocalDate date;
    private Integer conditionCode;
    private Integer tempMax;
    private Integer rainProbability;
    private Integer windSpeed;
}
