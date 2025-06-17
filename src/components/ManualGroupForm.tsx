import { useState } from 'react';
import { Tab } from '../utils/types';

export const ManualGroupForm = () => {
  const [keyword, setKeyword] = useState('');
  const [matchingTabs, setMatchingTabs] = useState<Tab[]>([]);

  const handleSearch = async () => {
    const tabs = await chrome.tabs.query({});
    const matches = tabs.filter(tab => 
      tab.title?.toLowerCase().includes(keyword.toLowerCase()) ||
      tab.url?.toLowerCase().includes(keyword.toLowerCase())
    );
    setMatchingTabs(matches);
  };

  const handleCreateGroup = async () => {
    if (matchingTabs.length === 0) return;

    const groupId = await chrome.tabs.group({
      tabIds: matchingTabs.map(tab => tab.id).filter((id): id is number => id !== undefined)
    });

    await chrome.tabGroups.update(groupId, {
      title: keyword,
      color: 'purple'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Enter keyword..."
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          Search
        </button>
      </div>

      {matchingTabs.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">
            Matching Tabs ({matchingTabs.length})
          </h3>
          <div className="max-h-48 overflow-y-auto">
            {matchingTabs.map((tab) => (
              <div
                key={tab.id}
                className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg"
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
          <button
            onClick={handleCreateGroup}
            className="w-full px-4 py-2 bg-fuchsia-600 text-white rounded-lg hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
          >
            Create Group
          </button>
        </div>
      )}
    </div>
  );
}; 