import React, { useState, useEffect } from 'react';
import { Tab } from '../utils/types';

interface CustomCategory {
  id: string;
  name: string;
  patterns: string[];
  tabs: Tab[];
}

export const CustomCategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newPattern, setNewPattern] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const result = await chrome.storage.local.get(['customCategories']);
      setCategories(result.customCategories || []);
    } catch (err) {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    const newCategory: CustomCategory = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      patterns: [],
      tabs: []
    };

    const updatedCategories = [...categories, newCategory];
    await chrome.storage.local.set({ customCategories: updatedCategories });
    setCategories(updatedCategories);
    setNewCategoryName('');
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const updatedCategories = categories.filter(c => c.id !== categoryId);
    await chrome.storage.local.set({ customCategories: updatedCategories });
    setCategories(updatedCategories);
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
    }
  };

  const handleAddPattern = async (categoryId: string) => {
    if (!newPattern.trim()) return;

    const updatedCategories = categories.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          patterns: [...category.patterns, newPattern.trim()]
        };
      }
      return category;
    });

    await chrome.storage.local.set({ customCategories: updatedCategories });
    setCategories(updatedCategories);
    setNewPattern('');
  };

  const handleRemovePattern = async (categoryId: string, pattern: string) => {
    const updatedCategories = categories.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          patterns: category.patterns.filter(p => p !== pattern)
        };
      }
      return category;
    });

    await chrome.storage.local.set({ customCategories: updatedCategories });
    setCategories(updatedCategories);
  };

  const handleAddTab = async (categoryId: string, tab: Tab) => {
    const updatedCategories = categories.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          tabs: [...category.tabs, tab]
        };
      }
      return category;
    });

    await chrome.storage.local.set({ customCategories: updatedCategories });
    setCategories(updatedCategories);
  };

  const handleRemoveTab = async (categoryId: string, tabId: number) => {
    const updatedCategories = categories.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          tabs: category.tabs.filter(tab => tab.id !== tabId)
        };
      }
      return category;
    });

    await chrome.storage.local.set({ customCategories: updatedCategories });
    setCategories(updatedCategories);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 bg-red-50 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex space-x-4">
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="New category name..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={handleCreateCategory}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          Create Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Categories List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Categories</h3>
          {categories.map((category) => (
            <div
              key={category.id}
              className={`p-4 rounded-lg border ${
                selectedCategory === category.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{category.name}</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedCategory(category.id)}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {category.patterns.length} patterns • {category.tabs.length} tabs
              </div>
            </div>
          ))}
        </div>

        {/* Category Details */}
        {selectedCategory && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Category Details</h3>
            {categories.map((category) => (
              category.id === selectedCategory && (
                <div key={category.id} className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Patterns</h4>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={newPattern}
                        onChange={(e) => setNewPattern(e.target.value)}
                        placeholder="Add pattern..."
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        onClick={() => handleAddPattern(category.id)}
                        className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {category.patterns.map((pattern) => (
                        <div key={pattern} className="flex items-center justify-between p-2 bg-white rounded">
                          <span className="text-sm text-gray-600">{pattern}</span>
                          <button
                            onClick={() => handleRemovePattern(category.id, pattern)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Tabs</h4>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {category.tabs.map((tab) => (
                        <div key={tab.id} className="flex items-center justify-between p-2 bg-white rounded">
                          <div className="flex items-center space-x-2">
                            {tab.favIconUrl && (
                              <img src={tab.favIconUrl} alt="" className="w-4 h-4" />
                            )}
                            <span className="text-sm text-gray-600 truncate">{tab.title}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveTab(category.id, tab.id!)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 