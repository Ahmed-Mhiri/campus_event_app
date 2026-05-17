package de.fhdortmund.mystudyapp.moderation.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import de.fhdortmund.mystudyapp.moderation.model.Report;
import de.fhdortmund.mystudyapp.moderation.model.ReportReason;
import de.fhdortmund.mystudyapp.moderation.model.ReportStatus;

@Repository
public interface ReportRepository extends JpaRepository<Report, UUID> {
    Page<Report> findByStatus(ReportStatus status, Pageable pageable);
    Page<Report> findByReason(ReportReason reason, Pageable pageable);
    Page<Report> findByStatusAndReason(ReportStatus status, ReportReason reason, Pageable pageable);
}