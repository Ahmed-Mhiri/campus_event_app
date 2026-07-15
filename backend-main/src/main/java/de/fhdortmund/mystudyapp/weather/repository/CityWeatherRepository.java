package de.fhdortmund.mystudyapp.weather.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import de.fhdortmund.mystudyapp.weather.model.CityWeather;
import de.fhdortmund.mystudyapp.weather.model.CityWeatherId;

public interface CityWeatherRepository extends JpaRepository<CityWeather, CityWeatherId> {

    Optional<CityWeather> findByCityAndDate(String city, LocalDate date);

    List<CityWeather> findByCityAndDateBetween(String city, LocalDate start, LocalDate end);
}