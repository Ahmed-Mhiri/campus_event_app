package de.fhdortmund.mystudyapp.weather.model;

public enum WeatherRisk {
    GOOD,       // No severe conditions
    MODERATE,   // Some discomfort, backup plan recommended
    DANGER,     // Severe conditions, strongly consider postponing or moving indoors
    CANCELLED   // Extreme weather warning, event must be cancelled
}