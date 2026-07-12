import React from 'react';
import { X } from 'lucide-react';
import Card from '../common/Card';

export default function WorkflowModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className = '',
}) {
  if (!isOpen) return null;

  return (
    <div 
      className="pos-fixed top-0 left-0 w-screen h-screen z-50 d-flex align-center justify-center p-md"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(3px)' }}
    >
      <Card 
        variant="flat" 
        className={`w-full max-w-md p-lg animate-fade-in ${className}`}
        style={{ position: 'relative' }}
      >
        {/* Header */}
        <div className="d-flex justify-between align-center mb-md" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--spacing-sm)' }}>
          <h3 className="text-heading font-semibold text-lg-sz m-0">
            {title}
          </h3>
          <button 
            type="button"
            className="nm-btn rounded-full p-xs d-flex align-center justify-center cursor-pointer"
            onClick={onClose}
            style={{ border: 'none', background: 'transparent' }}
            aria-label="Close modal"
          >
            <X size={16} className="text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-md text-main" style={{ fontSize: 'var(--text-sm)' }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="d-flex justify-end gap-sm pt-md" style={{ borderTop: '1px solid var(--color-border)' }}>
            {footer}
          </div>
        )}
      </Card>
    </div>
  );
}

