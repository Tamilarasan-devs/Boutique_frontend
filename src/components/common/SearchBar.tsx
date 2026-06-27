import React from 'react';

export interface SearchBarProps {
  className?: string;
  children?: React.ReactNode;
}

const SearchBar: React.FC<SearchBarProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'SearchBar Component'}
    </div>
  );
};

export default SearchBar;
