import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (searchQuery: string) => void;
}

const Search: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <div style={styles.searchBarContainer}>
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearch}
        placeholder="Search for products..."
        style={styles.searchInput}
      />
    </div>
  );
};

// CSS styles defined as a JavaScript object
const styles = {
  searchBarContainer: {
    display: 'flex',
    justifyContent: 'center',
    margin: '20px 0',
  },
  searchInput: {
    width: '100%',
    maxWidth: '600px',
    padding: '12px 20px',
    borderRadius: '25px',
    border: '1px solid #ddd',
    fontSize: '16px',
    outline: 'none',
    transition: 'box-shadow 0.3s',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  } as React.CSSProperties,
};

export default Search;
