package de.fhdortmund.mystudyapp.weather.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "city_weather")
@IdClass(CityWeatherId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CityWeather {

    @Id
    private String city;

    @Id
    private LocalDate date;

    private Integer conditionCode;

    private Integer tempMax;

    private Integer rainProbability;

    private Integer windSpeed;

    private Instant updatedAt;
}