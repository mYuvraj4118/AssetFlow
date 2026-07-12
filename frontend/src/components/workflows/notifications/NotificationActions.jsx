import React from 'react';
import { CheckSquare, Trash2, X } from 'lucide-react';
import { Button } from '../../common';

const NotificationActions = ({
  onMarkRead,
  onDeleteSelected,
  onClearAll,
  selectedCount
}) => {
  return (
    <div className="d-flex justify-between align-center p-sm rounded-md mb-md nm-flat" style={{ border: '1px solid var(--color-border)' }}>
      <span className="text-xs-sz text-muted font-semibold">
        {selectedCount > 0 ? `${selectedCount} item(s) selected` : 'No items selected'}
      </span>
      <div className="d-flex gap-sm">
        {selectedCount > 0 && (
          <>
            <Button 
              variant="flat" 
              size="sm" 
              onClick={onMarkRead} 
              icon={<CheckSquare size={13} />}
            >
              Mark Read
            </Button>
            <Button 
              variant="danger" 
              size="sm" 
              onClick={onDeleteSelected} 
              icon={<Trash2 size={13} />}
            >
              Delete Selected
            </Button>
          </>
        )}
        <Button 
          variant="flat" 
          size="sm" 
          onClick={onClearAll} 
          icon={<X size={13} />}
        >
          Clear All
        </Button>
      </div>
    </div>
  );
};

export default NotificationActions;
