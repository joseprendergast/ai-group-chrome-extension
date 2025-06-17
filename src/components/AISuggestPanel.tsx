import React, { useState, useEffect } from 'react';
import { CategorizedTab } from '../utils/types';
import { categorizeTabs } from '../services/tabCategorizer';

interface Suggestion {
  category: string;
  tabs: CategorizedTab[];
  confirmed: boolean;
  rejected: boolean;
}

const AISuggestPanel: React.FC = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuggest = async () => {
    setLoading(true);
    setError(null);
    try {
      const tabs = await chrome.tabs.query({});
      const categorizedTabs = await categorizeTabs(tabs);
      
      // Group tabs by category
      const groupedTabs = categorizedTabs.reduce((acc, tab) => {
        if (!acc[tab.category]) {
          acc[tab.category] = [];
        }
        acc[tab.category].push(tab);
        return acc;
      }, {} as Record<string, CategorizedTab[]>);

      // Convert to suggestions array
      const newSuggestions = Object.entries(groupedTabs)
        .filter(([_, tabs]) => tabs.length >= 2) // Only suggest groups with 2 or more tabs
        .map(([category, tabs]) => ({
          category,
          tabs,
          confirmed: false,
          rejected: false
        }));

      setSuggestions(newSuggestions);
    } catch (err) {
      setError('Failed to get suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (category: string) => {
    const suggestion = suggestions.find(s => s.category === category);
    if (!suggestion) return;

    try {
      // Create a new group in Chrome
      const groupId = await chrome.tabs.group({
        tabIds: suggestion.tabs.map(tab => tab.id).filter((id): id is number => id !== undefined)
      });

      // Update the group title
      await chrome.tabGroups.update(groupId, {
        title: category,
        color: 'purple'
      });

      // Update suggestion state
      setSuggestions(suggestions.map(s => 
        s.category === category ? { ...s, confirmed: true } : s
      ));

      // Save to custom categories if not already saved
      chrome.storage.local.get(['customCategories'], (result) => {
        const customCategories = result.customCategories || [];
        if (!customCategories.some((c: any) => c.name === category)) {
          customCategories.push({
            id: Date.now().toString(),
            name: category,
            patterns: [],
            tabs: suggestion.tabs
          });
          chrome.storage.local.set({ customCategories });
        }
      });
    } catch (err) {
      setError('Failed to create group');
    }
  };

  const handleReject = (category: string) => {
    setSuggestions(suggestions.map(s => 
      s.category === category ? { ...s, rejected: true } : s
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">AI Suggestions</h2>
        <button
          onClick={handleSuggest}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Get Suggestions'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {suggestions
          .filter(s => !s.rejected)
          .map((suggestion) => (
            <div key={suggestion.category} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{suggestion.category}</h3>
                <span className="text-sm text-gray-500">
                  {suggestion.tabs.length} tabs
                </span>
              </div>
              <div className="space-y-2">
                {suggestion.tabs.map(tab => (
                  <div key={tab.id} className="text-sm text-gray-600 truncate">
                    {tab.title}
                  </div>
                ))}
              </div>
              {!suggestion.confirmed && (
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => handleConfirm(suggestion.category)}
                    className="flex-1 px-3 py-1 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => handleReject(suggestion.category)}
                    className="flex-1 px-3 py-1 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              )}
              {suggestion.confirmed && (
                <div className="mt-2 text-sm text-green-600">
                  ✓ Group created
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default AISuggestPanel; 