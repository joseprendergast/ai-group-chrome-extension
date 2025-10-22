import React, { useEffect, useState } from 'react';
import { Tab } from '../utils/types';

interface TabMetrics {
  totalTabs: number;
  categorizedTabs: number;
  uncategorizedTabs: number;
  categories: {
    [key: string]: number;
  };
  averageTabsPerCategory: number;
  mostUsedCategory: string;
  leastUsedCategory: string;
}

export const TabMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<TabMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Get all tabs
        const tabs = await chrome.tabs.query({});
        
        // Get all tab groups
        const groups = await chrome.tabGroups.query({});
        
        // Calculate metrics
        const totalTabs = tabs.length;
        const categorizedTabs = tabs.filter(tab => tab.groupId !== undefined).length;
        const uncategorizedTabs = totalTabs - categorizedTabs;
        
        // Count tabs per category
        const categories: { [key: string]: number } = {};
        groups.forEach(group => {
          const groupTabs = tabs.filter(tab => tab.groupId === group.id);
          categories[group.title || 'Untitled'] = groupTabs.length;
        });
        
        // Calculate averages and find most/least used categories
        const categoryCounts = Object.values(categories);
        const averageTabsPerCategory = categoryCounts.length > 0 
          ? categoryCounts.reduce((a, b) => a + b, 0) / categoryCounts.length 
          : 0;
        
        const entries = Object.entries(categories);
        const mostUsedCategory = entries.length
          ? entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0]
          : '';

        const leastUsedCategory = entries.length
          ? entries.reduce((a, b) => (a[1] < b[1] ? a : b))[0]
          : '';
        
        setMetrics({
          totalTabs,
          categorizedTabs,
          uncategorizedTabs,
          categories,
          averageTabsPerCategory,
          mostUsedCategory,
          leastUsedCategory
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

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

  if (!metrics) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800">Total Tabs</h3>
          <p className="text-3xl font-bold text-purple-600">{metrics.totalTabs}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800">Categorized</h3>
          <p className="text-3xl font-bold text-green-600">{metrics.categorizedTabs}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800">Uncategorized</h3>
          <p className="text-3xl font-bold text-yellow-600">{metrics.uncategorizedTabs}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Distribution</h3>
        <div className="space-y-4">
          {Object.entries(metrics.categories).map(([category, count]) => (
            <div key={category} className="flex items-center">
              <div className="w-1/3 text-sm text-gray-600">{category}</div>
              <div className="w-2/3">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full"
                    style={{
                      width: `${(count / metrics.totalTabs) * 100}%`
                    }}
                  />
                </div>
                <div className="text-sm text-gray-500 mt-1">{count} tabs</div>
              </div>
            </div>
          ))}
        </div>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800">Most Used Category</h3>
            <p className="text-xl font-medium text-purple-600">
              {metrics.mostUsedCategory || 'N/A'}
            </p>
            {metrics.mostUsedCategory && (
              <p className="text-sm text-gray-500">
                {metrics.categories[metrics.mostUsedCategory]} tabs
              </p>
            )}
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800">Least Used Category</h3>
            <p className="text-xl font-medium text-purple-600">
              {metrics.leastUsedCategory || 'N/A'}
            </p>
            {metrics.leastUsedCategory && (
              <p className="text-sm text-gray-500">
                {metrics.categories[metrics.leastUsedCategory]} tabs
              </p>
            )}
          </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-800">Average Tabs per Category</h3>
        <p className="text-3xl font-bold text-purple-600">
          {metrics.averageTabsPerCategory.toFixed(1)}
        </p>
      </div>
    </div>
  );
}; 