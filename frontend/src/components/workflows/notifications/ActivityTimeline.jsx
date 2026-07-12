import React from 'react';
import TimelineItem from './TimelineItem';
import { Card } from '../../common';

const ActivityTimeline = ({ events }) => {
  if (!events || events.length === 0) return null;

  return (
    <Card variant="flat" className="p-lg">
      <div className="chart-title-wrapper mb-md border-bottom pb-xs">
        <h4 className="chart-title">Activity Timeline</h4>
      </div>
      <div className="timeline-container d-flex flex-col mt-md">
        {events.map((event) => (
          <TimelineItem key={event.id} event={event} />
        ))}
      </div>
    </Card>
  );
};

export default ActivityTimeline;
