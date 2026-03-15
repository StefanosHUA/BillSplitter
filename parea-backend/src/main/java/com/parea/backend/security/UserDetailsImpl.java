package com.parea.backend.security;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.parea.backend.entity.AppUser;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class UserDetailsImpl implements UserDetails {
    private static final long serialVersionUID = 1L;

    private Long id;
    private String username;
    private String email;

    @JsonIgnore // Ensures the password never accidentally gets sent in a JSON response!
    private String password;

    public UserDetailsImpl(Long id, String username, String email, String password) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
    }

    // This is the translator method! It takes your AppUser and turns it into UserDetails
    public static UserDetailsImpl build(AppUser user) {
        return new UserDetailsImpl(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPassword());
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    // --- Required Spring Security Overrides ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // We don't have roles (Admin/User) yet, so we just return an empty list
        return Collections.emptyList();
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}