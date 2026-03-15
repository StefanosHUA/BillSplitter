package com.parea.backend.repository;

import com.parea.backend.entity.ReceiptItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReceiptItemRepository extends JpaRepository<ReceiptItem, Long> {

    List<ReceiptItem> findBySessionId(Long sessionId);
}