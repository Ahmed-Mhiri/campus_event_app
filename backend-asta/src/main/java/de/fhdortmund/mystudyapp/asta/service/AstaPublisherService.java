package de.fhdortmund.mystudyapp.asta.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.fhdortmund.mystudyapp.asta.dto.AstaEventRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.integration.annotation.MessagingGateway;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AstaPublisherService {

    private final MqttGateway mqttGateway;
    private final ObjectMapper objectMapper;

    @MessagingGateway(defaultRequestChannel = "mqttOutboundChannel")
    public interface MqttGateway {
        void sendToMqtt(String data);
    }

    public void publishOfficialEvent(AstaEventRequest request) {
        try {
            String payload = objectMapper.writeValueAsString(request);
            mqttGateway.sendToMqtt(payload);
            log.info("Published official event to MQTT: {}", request.getActivityName());
        } catch (Exception e) {
            log.error("Failed to publish event to MQTT", e);
            throw new RuntimeException("Failed to publish event", e);
        }
    }
}