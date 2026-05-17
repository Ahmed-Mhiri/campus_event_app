package de.fhdortmund.mystudyapp.asta.mqtt;

import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.integration.channel.DirectChannel;
import org.springframework.integration.core.MessageProducer;
import org.springframework.integration.mqtt.core.DefaultMqttPahoClientFactory;
import org.springframework.integration.mqtt.inbound.MqttPahoMessageDrivenChannelAdapter;
import org.springframework.integration.mqtt.outbound.MqttPahoMessageHandler;
import org.springframework.integration.mqtt.support.DefaultPahoMessageConverter;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageHandler;

@Configuration
public class MqttPublisherConfig {

    @Value("${mqtt.broker-url:tcp://localhost:1883}")
    private String brokerUrl;

    @Value("${mqtt.client-id:asta-publisher}")
    private String clientId;

    @Value("${mqtt.topic.events:university/events}")
    private String eventsTopic;

    @Value("${mqtt.topic.alerts:university/alerts}")
    private String alertsTopic;

    /* ==================== OUTBOUND: Publish Events ==================== */

    @Bean
    public DefaultMqttPahoClientFactory mqttClientFactory() {
        DefaultMqttPahoClientFactory factory = new DefaultMqttPahoClientFactory();
        MqttConnectOptions options = new MqttConnectOptions();
        options.setServerURIs(new String[]{brokerUrl});
        options.setCleanSession(true);
        options.setAutomaticReconnect(true);
        factory.setConnectionOptions(options);
        return factory;
    }

    @Bean
    @ServiceActivator(inputChannel = "mqttOutboundChannel")
    public MessageHandler mqttOutboundHandler() {
        MqttPahoMessageHandler handler = new MqttPahoMessageHandler(clientId, mqttClientFactory());
        handler.setAsync(true);
        handler.setDefaultTopic(eventsTopic);
        handler.setDefaultQos(1); // At-least-once delivery
        return handler;
    }

    @Bean
    public MessageChannel mqttOutboundChannel() {
        return new DirectChannel();
    }

    /* ==================== INBOUND: Receive Alerts ==================== */

    @Bean
    public MessageChannel mqttAlertInputChannel() {
        return new DirectChannel();
    }

    @Bean
    public MessageProducer mqttAlertInboundAdapter() {
        MqttPahoMessageDrivenChannelAdapter adapter = new MqttPahoMessageDrivenChannelAdapter(
                clientId + "-alerts",
                mqttClientFactory(),
                alertsTopic
        );
        adapter.setCompletionTimeout(5000);
        adapter.setConverter(new DefaultPahoMessageConverter());
        adapter.setQos(1);
        adapter.setOutputChannel(mqttAlertInputChannel());
        return adapter;
    }

    @Bean
    @ServiceActivator(inputChannel = "mqttAlertInputChannel")
    public MessageHandler alertHandler() {
        return message -> {
            String payload = message.getPayload().toString();
            System.out.println("[AStA BACKEND] 🚨 Critical Alert Received: " + payload);
            // In production: send email to AStA admins, push to Slack, etc.
        };
    }
}