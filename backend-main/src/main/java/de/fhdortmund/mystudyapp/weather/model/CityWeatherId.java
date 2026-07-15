package de.fhdortmund.mystudyapp.weather.model;

import java.io.Serializable;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CityWeatherId implements Serializable {
    private String city;
    private LocalDate date;
}