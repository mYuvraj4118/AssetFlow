import React from 'react';
import { Search } from 'lucide-react';
import Button from '../Button';
import './SearchBar.css';

const SearchBar = ({
  placeholder = 'Search...',
  value,
  onChange,
  onSearch,
  className = '',
  ...props
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className={`nm-search-bar ${className}`} {...props}>
      <div className="search-bar-input-wrapper pos-relative flex-grow">
        <Search size={16} className="search-bar-icon text-muted" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          className="nm-field search-bar-input"
        />
      </div>
      {onSearch && (
        <Button variant="primary" onClick={() => onSearch(value)} size="md" className="search-bar-button">
          Search
        </Button>
      )}
    </div>
  );
};

export default SearchBar;
