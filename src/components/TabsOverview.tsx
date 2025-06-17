import { useState, useEffect } from 'react';
import { CategorizedTab } from '../utils/types';
import { categorizeTabs } from '../services/tabCategorizer';

export const TabsOverview = () => {
  const [tabs, setTabs] = useState<CategorizedTab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTabs = async () => {
      try {
        const tabs = await chrome.tabs.query({});
        const categorizedTabs = await categorizeTabs(tabs);
        setTabs(categorizedTabs);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch tabs'));
      } finally {
        setLoading(false);
      }
    };

    fetchTabs();
  }, []);

  if (loading) {
    return <div data-testid="tabs-loading">Loading tabs...</div>;
  }

  if (error) {
    return <div data-testid="tabs-error">Error: {error.message}</div>;
  }

  return (
    <div data-testid="tabs-overview" className="space-y-4">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          data-testid="tab-item"
          className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
        >
          {tab.favIconUrl && (
            <img src={tab.favIconUrl} alt="" className="w-4 h-4" />
          )}
          <div className="flex-1 min-w-0">
            <div data-testid="tab-title" className="text-sm font-medium truncate">
              {tab.title}
            </div>
            <div data-testid="tab-url" className="text-xs text-gray-500 truncate">
              {tab.url}
            </div>
          </div>
          <div
            data-testid="tab-category"
            className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800"
          >
            {tab.category}
          </div>
        </div>
      ))}
    </div>
  );
}; 