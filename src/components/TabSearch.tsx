import React, { useState, useEffect } from 'react';
import { Tab } from '../utils/types';

interface TabSearchProps {
  onSelectTab: (tab: Tab) => void;
}

export const TabSearch: React.FC<TabSearchProps> = ({ onSelectTab }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [filteredTabs, setFilteredTabs] = useState<Tab[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const loadTabs = async () => {
      const allTabs = await chrome.tabs.query({});
      setTabs(allTabs);
      setFilteredTabs(allTabs);
    };

    loadTabs();
  }, []);

  useEffect(() => {
    const filtered = tabs.filter(tab => {
      const searchLower = searchQuery.toLowerCase();
      return (
        tab.title?.toLowerCase().includes(searchLower) ||
        tab.url?.toLowerCase().includes(searchLower)
      );
    });
    setFilteredTabs(filtered);
    setSelectedIndex(0);
  }, [searchQuery, tabs]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < filteredTabs.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
    } else if (e.key === 'Enter' && filteredTabs[selectedIndex]) {
      e.preventDefault();
      onSelectTab(filteredTabs[selectedIndex]);
      setSearchQuery('');
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search tabs..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {searchQuery && filteredTabs.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {filteredTabs.map((tab, index) => (
            <div
              key={tab.id}
              onClick={() => {
                onSelectTab(tab);
                setSearchQuery('');
              }}
              className={`flex items-center space-x-2 p-2 cursor-pointer hover:bg-gray-50 ${
                index === selectedIndex ? 'bg-purple-50' : ''
              }`}
            >
              {tab.favIconUrl && (
                <img src={tab.favIconUrl} alt="" className="w-4 h-4" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {tab.title}
                </p>
                <p className="text-xs text-gray-500 truncate">{tab.url}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {searchQuery && filteredTabs.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg p-4 text-center text-gray-500">
          No matching tabs found
        </div>
      )}
    </div>
  );
}; 