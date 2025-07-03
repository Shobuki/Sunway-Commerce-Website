import React, { useState, useEffect } from 'react';
import axios from 'axios';

type PriceCategory = {
  Id: number;
  Name: string;
};

interface ModalPriceCategoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const ModalPriceCategory: React.FC<ModalPriceCategoryProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [categories, setCategories] = useState<PriceCategory[]>([]);
  const [formData, setFormData] = useState({ Name: '' });
  const [selectedCategory, setSelectedCategory] = useState<PriceCategory | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPriceCategories();
    }
  }, [isOpen]);

  const fetchPriceCategories = async () => {
    try {
      const response = await axios.get('/api/price-categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateOrUpdate = async () => {
    setLoading(true);
    try {
      if (!formData.Name) {
        setError('Name is required.');
        setLoading(false);
        return;
      }

      if (selectedCategory) {
        await axios.put(`/api/price-categories/${selectedCategory.Id}`, formData);
      } else {
        await axios.post('/api/price-categories', formData);
      }

      onSave();
      fetchPriceCategories();
      resetForm();
    } catch (error: any) {
      setError(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: PriceCategory) => {
    setSelectedCategory(category);
    setFormData({ Name: category.Name });
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/price-categories/${id}`);
      fetchPriceCategories();
    } catch (error: any) {
      setError(error.response?.data?.message || 'An error occurred');
    }
  };

  const resetForm = () => {
    setFormData({ Name: '' });
    setSelectedCategory(null);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">
          {selectedCategory ? 'Edit Price Category' : 'Create Price Category'}
        </h2>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <div className="space-y-4">
          <div>
            <label className="block font-medium">Name</label>
            <input
              type="text"
              name="Name"
              value={formData.Name}
              onChange={handleInputChange}
              className="border p-2 w-full rounded"
              placeholder="Enter category name"
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateOrUpdate}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? 'Saving...' : selectedCategory ? 'Update' : 'Create'}
            </button>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Price Categories</h3>
          <ul className="space-y-2">
            {categories.map((category) => (
              <li
                key={category.Id}
                className="flex justify-between items-center border p-2 rounded shadow"
              >
                <span>{category.Name}</span>
                <div className="space-x-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category.Id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ModalPriceCategory;
