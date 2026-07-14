package de.fhdortmund.backend_main;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.integration.annotation.IntegrationComponentScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
@ComponentScan(basePackages = {"de.fhdortmund"})
@EntityScan(basePackages = "de.fhdortmund.mystudyapp")
@EnableJpaRepositories(basePackages = "de.fhdortmund.mystudyapp")
@ConfigurationPropertiesScan(basePackages = {"de.fhdortmund"})
@IntegrationComponentScan(basePackages = {"de.fhdortmund"}) // <-- ADDED THIS to fix the MQTT Gateway
public class BackendMainApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendMainApplication.class, args);
    }

}