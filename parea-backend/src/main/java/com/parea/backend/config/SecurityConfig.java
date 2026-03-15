package com.parea.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Tell Security to use the CORS configuration from your WebConfig
                .cors(Customizer.withDefaults())

                // 2. Disable CSRF (Cross-Site Request Forgery) so your POST/PUT requests work
                .csrf(csrf -> csrf.disable())

                // 3. Allow everyone to access the registration and login paths
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**", "/register/**").permitAll()
                        .anyRequest().authenticated() // Protect everything else
                )

                // 4. Basic Auth (temporary so you can test)
                .httpBasic(Customizer.withDefaults());

        return http.build();
    }
}