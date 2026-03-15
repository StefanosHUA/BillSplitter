package com.parea.backend.repository;

import com.parea.backend.entity.PareaSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PareaSessionRepository extends JpaRepository<PareaSession, Long> {

    List<PareaSession> findByHostId(Long hostId);
}