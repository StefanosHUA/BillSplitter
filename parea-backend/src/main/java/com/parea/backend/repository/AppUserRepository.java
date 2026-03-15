package com.parea.backend.repository;

import com.parea.backend.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    // Spring Data JPA magically writes the SQL for this just based on the method name!
    Optional<AppUser> findByUsername(String username);
    Boolean existsByEmail(String email);

}