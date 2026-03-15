package com.parea.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration // Tells Spring to load this configuration when the app starts
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // Apply to all our API endpoints
                .allowedOrigins("http://localhost:3000", "http://localhost:5173") // Allow React (CRA or Vite)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS") // Allow these HTTP methods
                .allowedHeaders("*") // Allow any headers (like Auth tokens later)
                .allowCredentials(true); // Needed if we add cookies or advanced auth later
    }
}