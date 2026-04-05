import React from 'react';
import EventCard, { EventData } from './EventCard';

interface EventGridProps {
  events: EventData[];
}

export default function EventGrid({ events }: EventGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
