package de.fhdortmund.mystudyapp.events.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import de.fhdortmund.mystudyapp.events.model.EventMedia;

@Repository
public interface EventMediaRepository extends JpaRepository<EventMedia, UUID> {
}