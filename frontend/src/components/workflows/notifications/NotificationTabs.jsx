import React from 'react';

const NotificationTabs = ({ activeTab, setActiveTab, categories, counts }) => {
  return (
    <div className="notif-filters-bar">
      {categories.map((cat) => {
        const count = counts[cat] || 0;
        return (
          <button
            key={cat}
            className={`notif-chip ${activeTab === cat ? 'active' : ''}`}
            onClick={() => setActiveTab(cat)}
            aria-label={`Category ${cat}`}
          >
            {cat} ({count})
          </button>
        );
      })}
    </div>
  );
};

export default NotificationTabs;
