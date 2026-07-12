import React from 'react';
import { User, Tag, Clock } from 'lucide-react';
import { formatDate } from '../../../utils/helpers';
import { Badge } from '../../common';

const TimelineItem = ({ event }) => {
  return (
    <div className="timeline-item d-flex gap-md pos-relative pb-lg">
      {/* Vertical line connector */}
      <div className="timeline-connector"></div>

      {/* Circle dot marker */}
      <div className="timeline-dot bg-primary d-flex align-center justify-center">
        <User size={12} className="text-white" />
      </div>

      <div className="timeline-content p-sm rounded-md nm-flat w-full">
        <div className="d-flex justify-between align-center flex-wrap gap-xs mb-xs">
          <span className="font-bold text-heading text-sm-sz">{event.user}</span>
          <span className="text-xs-sz text-muted d-flex align-center gap-xs">
            <Clock size={10} />
            {formatDate(event.timestamp)}
          </span>
        </div>
        <p className="text-xs-sz text-main m-0">{event.action}</p>
        <div className="d-flex justify-between align-center mt-xs">
          <span className="text-xs-sz text-muted d-flex align-center gap-xxs font-mono">
            <Tag size={10} />
            {event.module}
          </span>
          <Badge variant="info">{event.status}</Badge>
        </div>
      </div>
    </div>
  );
};

export default TimelineItem;
