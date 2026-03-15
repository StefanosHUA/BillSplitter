package com.parea.backend.seeder;

import com.parea.backend.entity.AppUser;
import com.parea.backend.entity.PareaSession;
import com.parea.backend.entity.Participant;
import com.parea.backend.entity.ReceiptItem;
import com.parea.backend.repository.AppUserRepository;
import com.parea.backend.repository.PareaSessionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component // Tells Spring to manage this class and run it on startup
public class DatabaseSeeder implements CommandLineRunner {

    private final AppUserRepository userRepository;
    private final PareaSessionRepository sessionRepository;

    public DatabaseSeeder(AppUserRepository userRepository, PareaSessionRepository sessionRepository) {
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Only seed data if the database is empty
        if (userRepository.count() == 0) {

            // 1. Create the Host
            AppUser host = new AppUser();
            host.setUsername("Stefanos");
            host.setEmail("stefanos@example.com");
            host.setPassword("password123");
            userRepository.save(host);

            // 2. Create the Session
            PareaSession session = new PareaSession();
            session.setTitle("Friday Night at Klimataria");
            session.setHost(host);

            // 3. Create the Friends
            Participant p1 = new Participant(); p1.setName("Yiannis"); p1.setSession(session);
            Participant p2 = new Participant(); p2.setName("Maria"); p2.setSession(session);
            Participant p3 = new Participant(); p3.setName("Kostas"); p3.setSession(session);

            session.getParticipants().addAll(Arrays.asList(p1, p2, p3));

            // 4. Create the Items and Assign Who Shared Them
            ReceiptItem wine = new ReceiptItem();
            wine.setItemName("Kilo of White Wine");
            wine.setPrice(12.00);
            wine.setSession(session);
            wine.getSharedBy().addAll(Arrays.asList(p1, p2, p3)); // All 3 shared the wine

            ReceiptItem paidakia = new ReceiptItem();
            paidakia.setItemName("Kilo of Paidakia");
            paidakia.setPrice(20.00);
            paidakia.setSession(session);
            paidakia.getSharedBy().addAll(Arrays.asList(p1, p3)); // Only Yiannis & Kostas ate meat

            session.getReceiptItems().addAll(Arrays.asList(wine, paidakia));

            // 5. Save the session (Because of CascadeType.ALL, this saves the friends and items too!)
            sessionRepository.save(session);

            System.out.println("✅ Dummy Data Successfully Seeded!");
        }
    }
}