package com.parea.backend.controller;

import com.parea.backend.dto.Requests.LoginReq;
import com.parea.backend.dto.Requests.RegisterReq;
import com.parea.backend.dto.Responses.AuthRes;
import com.parea.backend.entity.AppUser;
import com.parea.backend.repository.AppUserRepository;
import com.parea.backend.security.JwtUtils;
import com.parea.backend.security.UserDetailsImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final org.springframework.security.authentication.AuthenticationManager authenticationManager;

    public AuthController(AppUserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils, org.springframework.security.authentication.AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterReq req) {
        // 1. Validate Passwords Match
        if (!req.password().equals(req.confirmPassword())) {
            return ResponseEntity.badRequest().body("Error: Passwords do not match!");
        }

        // 2. Check for existing user
        if (userRepository.findByUsername(req.username()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(req.email())) {
            return ResponseEntity.badRequest().body("Error: You have already signed up!");
        }

        // 3. Save New User
        AppUser user = new AppUser();
        user.setUsername(req.username());
        user.setEmail(req.email());
        user.setPassword(passwordEncoder.encode(req.password()));
        userRepository.save(user);

        // 4. AUTO-LOGIN: Generate the JWT immediately
        // Use the method name 'generateJwtToken' found in your JwtUtils
        String jwt = jwtUtils.generateJwtToken(user.getUsername());

        // 5. Return AuthRes (Matching your frontend expectations)
        return ResponseEntity.ok(new AuthRes(
                jwt,
                user.getId(),
                user.getUsername(),
                user.getEmail()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginReq req) {

        // 1. Ask Spring Security's Bouncer to verify the username and password
        org.springframework.security.core.Authentication authentication = authenticationManager.authenticate(
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(req.username(), req.password()));

        // 2. If it succeeds, grab the User Details
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        // 3. Generate the 1-hour VIP Wristband (JWT)
        String jwt = jwtUtils.generateJwtToken(userDetails.getUsername());

        // 4. Send the Wristband back to React!
        return ResponseEntity.ok(new AuthRes(jwt, userDetails.getId(), userDetails.getUsername(), userDetails.getEmail()));
    }

    // 3. GOOGLE SINGLE SIGN-ON (SSO)
    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody com.parea.backend.dto.Requests.GoogleLoginReq req) {
        try {
            // 1. Call Google's official servers to verify the token is real
            String googleUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + req.token();
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            java.util.Map<String, Object> googlePayload = restTemplate.getForObject(googleUrl, java.util.Map.class);

            // 2. If Google says it's invalid, kick them out
            if (googlePayload == null || !googlePayload.containsKey("email")) {
                return ResponseEntity.status(401).body("Invalid Google Token");
            }

            // 3. Extract the user's secure info from Google
            String email = (String) googlePayload.get("email");
            String name = (String) googlePayload.get("name");
            if (name == null) name = email.split("@")[0]; // Fallback if name is hidden

            // 4. Find the user in our database, or automatically CREATE an account for them!
            AppUser user = userRepository.findByUsername(email).orElseGet(() -> {
                AppUser newUser = new AppUser();
                newUser.setUsername(email); // We use their Google email as their unique username
                newUser.setEmail(email);
                // Give them a random, impossible-to-guess password since they log in via Google
                newUser.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
                return userRepository.save(newUser);
            });

            // 5. Generate our standard Parea VIP Wristband (JWT)
            String jwt = jwtUtils.generateJwtToken(user.getUsername());

            // 6. Welcome them to the app!
            return ResponseEntity.ok(new AuthRes(jwt, user.getId(), user.getUsername(), user.getEmail()));

        } catch (Exception e) {
            System.err.println("Google Auth Error: " + e.getMessage());
            return ResponseEntity.status(401).body("Google Authentication Failed");
        }
    }


    // 2. REFRESH TOKEN (For your 1-hour sliding session requirement)
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String authHeader) {
        // Remove "Bearer " prefix to get the actual token
        String token = authHeader.substring(7);

        // If the old token is still mathematically valid, issue a fresh 1-hour token!
        if (jwtUtils.validateJwtToken(token)) {
            String username = jwtUtils.getUserNameFromJwtToken(token);
            String newToken = jwtUtils.generateJwtToken(username);
            return ResponseEntity.ok(new AuthRes(newToken, null, username, null)); // Just sending the new token back
        }

        return ResponseEntity.status(401).body("Error: Token is invalid or has already expired. Please log in again.");
    }
}