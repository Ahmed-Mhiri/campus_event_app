package de.fhdortmund.mystudyapp.asta;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.integration.annotation.IntegrationComponentScan;

@SpringBootApplication
@IntegrationComponentScan
public class AstaApplication {

    public static void main(String[] args) {
        SpringApplication.run(AstaApplication.class, args);
    }
}