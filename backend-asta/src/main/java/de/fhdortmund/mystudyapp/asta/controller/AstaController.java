package de.fhdortmund.mystudyapp.asta.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import de.fhdortmund.mystudyapp.asta.dto.AstaEventRequest;
import de.fhdortmund.mystudyapp.asta.service.AstaPublisherService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/asta")
@RequiredArgsConstructor
public class AstaController {

    private final AstaPublisherService publisherService;

    @PostMapping("/publish-event")
    public ResponseEntity<String> publishEvent(@RequestBody AstaEventRequest request) {
        publisherService.publishOfficialEvent(request);
        return ResponseEntity.ok("Event published to MQTT broker");
    }
}