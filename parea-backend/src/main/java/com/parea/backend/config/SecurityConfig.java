package com.parea.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Enable CORS (uses your WebConfig.java settings)
                .cors(Customizer.withDefaults())

                // 2. Disable CSRF - Since we are using JWTs, we don't need CSRF protection
                .csrf(csrf -> csrf.disable())

                // 3. Set Session to Stateless - We won't use Cookies/Sessions on the server
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 4. Set Permissions
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll() // Public: Register & Login
                        .requestMatchers("/api/public/**").permitAll() // Public: Anything else open
                        .anyRequest().authenticated() // Private: Requires a valid JWT to see receipts
                );

        return http.build();
    }
}