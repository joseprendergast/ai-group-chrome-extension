import { useState, useEffect } from 'react';
import { TabsOverview } from '../components/TabsOverview';
import { ManualGroupForm } from '../components/ManualGroupForm';
import { ErrorModal } from '../components/ErrorModal';
import { TabSearch } from '../components/TabSearch';
import UndoSnackbar from '../components/UndoSnackbar';
import { ErrorState } from '../utils/types';
import { Tab } from '../utils/types';

export const Popup = () => {
  const [error, setError] = useState<ErrorState | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedTab, setSelectedTab] = useState<Tab | null>(null);
  const [categoryInput, setCategoryInput] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [isGrouping, setIsGrouping] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to toggle search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleTabSelect = async (tab: Tab) => {
    if (tab.id) {
      await chrome.tabs.update(tab.id, { active: true });
      window.close(); // Close the popup
    }
  };

  // Add category on Enter or comma
  const handleCategoryInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && categoryInput.trim()) {
      e.preventDefault();
      addCategory(categoryInput.trim());
    }
  };

  const addCategory = (cat: string) => {
    if (!categories.includes(cat)) {
      setCategories([...categories, cat]);
    }
    setCategoryInput('');
  };

  const removeCategory = (cat: string) => {
    setCategories(categories.filter(c => c !== cat));
  };

  // AI Grouping handler
  const handleAIGroup = async () => {
    setIsGrouping(true);
    try {
      // Send message to background to group tabs by selected categories
      await chrome.runtime.sendMessage({
        type: 'AI_GROUP',
        payload: { categories }
      });
    } catch (err) {
      setError({ message: 'Failed to group tabs', details: err instanceof Error ? err.message : String(err) });
    } finally {
      setIsGrouping(false);
    }
  };

  // Undo handler
  const handleUndo = async () => {
    await chrome.runtime.sendMessage({ type: 'UNDO_ACTION' });
  };

  // Manual group handler (open manual group UI)
  const [showManual, setShowManual] = useState(false);

  // Ungroup all handler
  const handleUngroupAll = async () => {
    await chrome.runtime.sendMessage({ type: 'UNGROUP_ALL' });
  };

  return (
    <div className="w-96 p-6">
      <h1 className="text-2xl font-bold text-green-600 text-center mb-1">TabOrg</h1>
      <p className="text-center text-gray-600 mb-4">Organize your browser tabs</p>
      <div className="border-b mb-4" />
      <input
        type="text"
        value={categoryInput}
        onChange={e => setCategoryInput(e.target.value)}
        onKeyDown={handleCategoryInput}
        placeholder="Enter categories for AI grouping..."
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-2"
      />
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map(cat => (
          <span
            key={cat}
            className="flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium"
          >
            {cat}
            <button
              onClick={() => removeCategory(cat)}
              className="ml-2 text-green-500 hover:text-green-700 focus:outline-none"
              aria-label={`Remove ${cat}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <button
          onClick={handleAIGroup}
          disabled={isGrouping || categories.length === 0}
          className="col-span-1 px-4 py-2 bg-green-600 text-white rounded font-semibold shadow hover:bg-green-700 disabled:opacity-50"
        >
          AI Group
        </button>
        <button
          onClick={handleUndo}
          className="col-span-1 px-4 py-2 bg-gray-100 text-gray-700 rounded font-semibold shadow hover:bg-gray-200"
        >
          Undo
        </button>
        <button
          onClick={() => setShowManual(v => !v)}
          className="col-span-1 px-4 py-2 bg-gray-100 text-gray-700 rounded font-semibold shadow hover:bg-gray-200"
        >
          Manual Group
        </button>
        <button
          onClick={handleUngroupAll}
          className="col-span-1 px-4 py-2 bg-gray-100 text-gray-700 rounded font-semibold shadow hover:bg-gray-200"
        >
          Ungroup All
        </button>
      </div>
      <p className="text-xs text-gray-500 text-center mt-2 mb-2">
        Note: Groups are only created if more than 1 tab fits into a category.
      </p>
      {showManual && (
        <div className="mt-4">
          <ManualGroupForm />
        </div>
      )}
      <ErrorModal error={error} onClose={() => setError(null)} />
      <UndoSnackbar />
    </div>
  );
}; 