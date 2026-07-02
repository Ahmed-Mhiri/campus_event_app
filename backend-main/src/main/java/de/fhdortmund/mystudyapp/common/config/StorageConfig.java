package de.fhdortmund.mystudyapp.common.config;

import java.nio.file.Paths;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class StorageConfig implements WebMvcConfigurer {

    private final StorageProperties storageProperties;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Convert the relative "uploads" path to a reliable, absolute file system path
        // This guarantees Spring finds the folder regardless of how/where you launch the app
        String avatarPath = Paths.get(storageProperties.getAvatarLocation(), "avatars")
                .toFile().getAbsolutePath();
        String eventMediaPath = Paths.get(storageProperties.getEventMediaLocation(), "events")
                .toFile().getAbsolutePath();

        // Map the HTTP route to the absolute directory (trailing slash is mandatory)
        registry.addResourceHandler("/uploads/avatars/**")
                .addResourceLocations("file:" + avatarPath + "/");

        registry.addResourceHandler("/uploads/events/**")
                .addResourceLocations("file:" + eventMediaPath + "/");
    }
}