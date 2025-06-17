import React, { useEffect, useState } from 'react';
import AISuggestPanel from '../components/AISuggestPanel';
import { CustomCategoryManager } from '../components/CustomCategoryManager';
import { TabMetrics } from '../components/TabMetrics';
import { TabSearch } from '../components/TabSearch';
import { Tab } from '../utils/types';

interface TabInfo {
  id: number;
  title: string;
  url: string;
  groupId?: number;
}

const Admin: React.FC = () => {
  const [tabs, setTabs] = useState<TabInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'tabs' | 'ai' | 'custom' | 'metrics'>('tabs');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const initAdmin = async () => {
      try {
        setDebugInfo('Initializing admin page...');
        
        // Check if we're in the extension context
        if (typeof chrome === 'undefined') {
          throw new Error('Chrome API is not available. Make sure you\'re accessing this page through the extension\'s options.');
        }

        setDebugInfo('Chrome API is available, checking permissions...');
        
        // Check if we have basic tabs permission
        if (!chrome.tabs) {
          throw new Error('Tabs permission is not available. Please check extension permissions.');
        }

        setDebugInfo('Fetching tabs...');
        const allTabs = await chrome.tabs.query({});
        setTabs(allTabs.map(tab => ({
          id: tab.id!,
          title: tab.title || 'Untitled',
          url: tab.url || '',
          groupId: tab.groupId
        })));
        setDebugInfo('Tabs fetched successfully');
      } catch (err) {
        console.error('Admin page error:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setDebugInfo(`Error occurred: ${err instanceof Error ? err.message : 'Unknown error'}\n\nDebug info:\n- chrome object: ${typeof chrome}\n- Available APIs: ${Object.keys(chrome || {}).join(', ')}\n- window.location: ${window.location.href}\n- Browser version: ${navigator.userAgent}`);
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay before initialization to ensure the extension context is ready
    setTimeout(initAdmin, 100);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to toggle search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(prev => !prev);
      }
      
      // Cmd/Ctrl + 1-4 to switch tabs
      if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
        e.preventDefault();
        const tabIndex = parseInt(e.key) - 1;
        const tabs: ('tabs' | 'ai' | 'custom' | 'metrics')[] = ['tabs', 'ai', 'custom', 'metrics'];
        if (tabs[tabIndex]) {
          setActiveTab(tabs[tabIndex]);
        }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
          <div className="text-center text-gray-600 mt-4">
            Loading admin page...
          </div>
          <div className="text-center text-sm text-gray-500 mt-2">
            {debugInfo}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-700 mb-4">{error}</p>
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Debug Information:</h3>
              <pre className="text-sm text-gray-600 whitespace-pre-wrap">{debugInfo}</pre>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>To fix this issue:</p>
              <ol className="list-decimal list-inside mt-2">
                <li>Go to chrome://extensions</li>
                <li>Find the TabOrg extension</li>
                <li>Click "Remove" to uninstall it</li>
                <li>Click "Load unpacked" and select the dist directory</li>
                <li>Make sure all permissions are granted when prompted</li>
                <li>Try accessing the options page again</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Group tabs by their groupId
  const groupedTabs = tabs.reduce((acc, tab) => {
    const groupId = tab.groupId || 'ungrouped';
    if (!acc[groupId]) {
      acc[groupId] = [];
    }
    acc[groupId].push(tab);
    return acc;
  }, {} as Record<string | number, TabInfo[]>);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">TabOrg Admin</h1>
          <button
            onClick={() => setShowSearch(prev => !prev)}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Search Tabs (⌘K)
          </button>
        </div>

        {showSearch && (
          <div className="mb-8">
            <TabSearch onSelectTab={handleTabSelect} />
          </div>
        )}
        
        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('tabs')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'tabs'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Active Tabs (⌘1)
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'ai'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            AI Suggestions (⌘2)
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'custom'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Custom Categories (⌘3)
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'metrics'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Analytics (⌘4)
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {activeTab === 'tabs' && (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Active Tabs</h2>
              {Object.entries(groupedTabs).map(([groupId, groupTabs]) => (
                <div key={groupId} className="border rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">
                    {groupId === 'ungrouped' ? 'Ungrouped Tabs' : `Group ${groupId}`}
                  </h3>
                  <div className="space-y-2">
                    {groupTabs.map((tab) => (
                      <div key={tab.id} className="flex items-center space-x-2 text-sm text-gray-600">
                        <span className="truncate">{tab.title}</span>
                        <span className="text-gray-400">•</span>
                        <span className="truncate text-gray-500">{tab.url}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {activeTab === 'ai' && (
            <AISuggestPanel />
          )}

          {activeTab === 'custom' && (
            <CustomCategoryManager />
          )}

          {activeTab === 'metrics' && (
            <TabMetrics />
          )}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Debug Information</h2>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm text-gray-600 whitespace-pre-wrap">
            {debugInfo}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default Admin; 