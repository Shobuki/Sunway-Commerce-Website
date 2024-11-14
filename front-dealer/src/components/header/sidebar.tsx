import React, { useState, useEffect } from 'react';
import { Category } from '../../../types/types';

interface SidebarProps {
  onCategoryChange?: (selectedCategories: Set<number>) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onCategoryChange }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [openCategories, setOpenCategories] = useState<Record<number, boolean>>({});
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());

  // Fetch categories from the API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Update selected categories in the parent
  useEffect(() => {
    if (onCategoryChange) {
      onCategoryChange(selectedCategories);
    }
  }, [selectedCategories, onCategoryChange]);

  // Toggle category selection
  const toggleCategorySelection = (categoryId: number) => {
    setSelectedCategories((prev) => {
      const updated = new Set(prev);
      if (updated.has(categoryId)) {
        updated.delete(categoryId);
      } else {
        updated.add(categoryId);
      }
      return updated;
    });
  };

  // Render categories recursively
  const renderCategories = (parentId: number | null) => {
    return categories
      .filter((category) => category.parentCategoryId === parentId)
      .map((category) => (
        <div key={category.id} style={styles.borderedContainer}>
          <div style={styles.categoryRow}>
            <input
              type="checkbox"
              checked={selectedCategories.has(category.id)}
              onChange={() => toggleCategorySelection(category.id)}
              style={styles.checkbox}
            />
            <button
              onClick={() => setOpenCategories((prev) => ({ ...prev, [category.id]: !prev[category.id] }))}
              style={{
                ...styles.button,
                ...(category.parentCategoryId === null ? styles.parentButton : styles.childButton),
              }}
            >
              {category.name}
              {category.parentCategoryId === null && <span>{openCategories[category.id] ? '-' : '+'}</span>}
            </button>
          </div>
          {openCategories[category.id] && <ul style={styles.listWithPadding}>{renderCategories(category.id)}</ul>}
        </div>
      ));
  };

  return (
    <div style={styles.sidebar}>
      <h2 style={styles.title}>Categories</h2>
      {renderCategories(null)}
    </div>
  );
};

// CSS styles defined as JavaScript object
const styles = {
  sidebar: {
    backgroundColor: '#C72C3B',
    color: '#FFFFFF',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    width: '250px',
  },
  title: {
    fontWeight: 'bold',
    fontSize: '1.25rem',
    marginBottom: '16px',
  },
  borderedContainer: {
  },
  categoryRow: {
    display: 'flex',
    alignItems: 'center',
  },
  button: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    fontWeight: '600',
    fontSize: '1rem',
    color: '#FFFFFF',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    border: 'none',
    paddingLeft: '8px',
  },
  parentButton: {
    border: '1px solid #FFFFFF',
    borderRadius: '8px',
    padding: '8px',
    marginBottom: '10px',
    fontWeight: 'bold',
  },
  childButton: {
    fontWeight: 'normal',
  },
  checkbox: {
    marginRight: '8px',
  },
  listWithPadding: {
    listStyleType: 'none',
    paddingLeft: '20px',
    paddingBottom: '6px',
  },
};

export default Sidebar;
