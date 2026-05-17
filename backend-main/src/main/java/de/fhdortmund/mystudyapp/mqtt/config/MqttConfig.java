package de.fhdortmund.mystudyapp.mqtt.config;

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
public class MqttConfig {

    @Value("${mqtt.broker-url:tcp://localhost:1883}")
    private String brokerUrl;

    @Value("${mqtt.client-id:main-backend}")
    private String clientId;

    @Value("${mqtt.topic.events:university/events}")
    private String eventsTopic;

    @Value("${mqtt.topic.alerts:university/alerts}")
    private String alertsTopic;

    /* ==================== Shared Client Factory ==================== */

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

    /* ==================== INBOUND: Receive Official Events ==================== */

    @Bean
    public MessageChannel mqttEventInputChannel() {
        return new DirectChannel();
    }

    @Bean
    public MessageProducer mqttEventInboundAdapter() {
        MqttPahoMessageDrivenChannelAdapter adapter = new MqttPahoMessageDrivenChannelAdapter(
                clientId + "-events",
                mqttClientFactory(),
                eventsTopic
        );
        adapter.setCompletionTimeout(5000);
        adapter.setConverter(new DefaultPahoMessageConverter());
        adapter.setQos(1);
        adapter.setOutputChannel(mqttEventInputChannel());
        return adapter;
    }

    /* ==================== OUTBOUND: Publish Alerts ==================== */

    @Bean
    public MessageChannel mqttAlertOutboundChannel() {
        return new DirectChannel();
    }

    @Bean
    @ServiceActivator(inputChannel = "mqttAlertOutboundChannel")
    public MessageHandler mqttAlertOutboundHandler() {
        MqttPahoMessageHandler handler = new MqttPahoMessageHandler(
                clientId + "-alert-publisher",
                mqttClientFactory()
        );
        handler.setAsync(true);
        handler.setDefaultTopic(alertsTopic);
        handler.setDefaultQos(1);
        return handler;
    }
}