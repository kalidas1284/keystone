package com.keystone.platform.backend.repository;

import com.keystone.platform.backend.entity.Schedule;
import com.keystone.platform.backend.entity.ScheduleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByScheduledDateBetweenOrderByScheduledDateAscStartTimeAsc(LocalDate start, LocalDate end);

    List<Schedule> findByTechnicianIdAndScheduledDateOrderByStartTimeAsc(Long technicianId, LocalDate date);

    @Query("""
            SELECT s FROM Schedule s
            WHERE s.technician.id = :technicianId
              AND s.scheduledDate = :date
              AND s.status <> :cancelled
              AND s.startTime < :endTime
              AND s.endTime > :startTime
              AND (:excludeId IS NULL OR s.id <> :excludeId)
            """)
    List<Schedule> findConflicts(
            @Param("technicianId") Long technicianId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("cancelled") ScheduleStatus cancelled,
            @Param("excludeId") Long excludeId
    );
}
