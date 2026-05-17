package de.fhdortmund.mystudyapp.mqtt.adapter;

import de.fhdortmund.mystudyapp.events.model.Event;
import de.fhdortmund.mystudyapp.mqtt.dto.OfficialEventMessage;

/**
 * ★ STRUCTURAL PATTERN: Adapter
 * Defines the contract for converting external message formats into internal Event entities.
 * Allows swapping AStA format for other university systems without changing the listener.
 */
public interface EventMessageTarget {
    
    Event adapt(OfficialEventMessage message);
}