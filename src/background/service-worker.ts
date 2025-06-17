import { categorizeTabs } from '../services/tabCategorizer';

interface CustomCategory {
  id: string;
  name: string;
  patterns: string[];
  tabs: chrome.tabs.Tab[];
}

interface TabState {
  tabId: number;
  groupId?: number;
}

// Listen for extension icon click
chrome.action.onClicked.addListener(async () => {
  try {
    // Get all tabs in the current window
    const tabs = await chrome.tabs.query({ currentWindow: true });
    
    // Categorize tabs
    const categorizedTabs = await categorizeTabs(tabs);
    
    // Store suggestions in session storage
    await chrome.storage.session.set({ 
      suggestions: categorizedTabs,
      timestamp: Date.now()
    });
    
    // Notify popup that suggestions are ready
    chrome.runtime.sendMessage({ 
      type: 'SUGGESTIONS_READY',
      payload: categorizedTabs 
    });
  } catch (error) {
    console.error('Error in background service worker:', error);
    chrome.runtime.sendMessage({ 
      type: 'ERROR',
      payload: 'Failed to process tabs. Please try again.'
    });
  }
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener(async (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    try {
      // Get all tabs and recategorize
      const tabs = await chrome.tabs.query({});
      const categorizedTabs = await categorizeTabs(tabs);
      
      // Update storage
      await chrome.storage.local.set({ categorizedTabs });
      
      // Check if this tab matches any custom categories
      const { customCategories = [] } = await chrome.storage.local.get(['customCategories']) as { customCategories: CustomCategory[] };
      const matchingCategory = customCategories.find((category: CustomCategory) => 
        category.patterns.some((pattern: string) => 
          tab.url?.toLowerCase().includes(pattern.toLowerCase()) ||
          tab.title?.toLowerCase().includes(pattern.toLowerCase())
        )
      );

      if (matchingCategory) {
        // Add tab to the matching category
        const updatedCategories = customCategories.map((category: CustomCategory) => {
          if (category.id === matchingCategory.id) {
            return {
              ...category,
              tabs: [...category.tabs, tab]
            };
          }
          return category;
        });
        await chrome.storage.local.set({ customCategories: updatedCategories });
      }
    } catch (error) {
      console.error('Error handling tab update:', error);
    }
  }
});

// Listen for tab removal
chrome.tabs.onRemoved.addListener(async (tabId: number) => {
  try {
    // Get all tabs and recategorize
    const tabs = await chrome.tabs.query({});
    const categorizedTabs = await categorizeTabs(tabs);
    
    // Update storage
    await chrome.storage.local.set({ categorizedTabs });
    
    // Remove tab from custom categories
    const { customCategories = [] } = await chrome.storage.local.get(['customCategories']) as { customCategories: CustomCategory[] };
    const updatedCategories = customCategories.map((category: CustomCategory) => ({
      ...category,
      tabs: category.tabs.filter((tab: chrome.tabs.Tab) => tab.id !== tabId)
    }));
    await chrome.storage.local.set({ customCategories: updatedCategories });
  } catch (error) {
    console.error('Error handling tab removal:', error);
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  if (message.type === 'GET_TABS') {
    chrome.tabs.query({}, async (tabs) => {
      try {
        const categorizedTabs = await categorizeTabs(tabs);
        await chrome.storage.local.set({ categorizedTabs });
        sendResponse({ success: true });
      } catch (error) {
        console.error('Error getting tabs:', error);
        sendResponse({ success: false, error: 'Failed to get tabs' });
      }
    });
    return true; // Keep the message channel open for async response
  }
  
  if (message.type === 'UNDO_ACTION') {
    const { type, previousState } = message.payload as { type: string; previousState: TabState[] };
    try {
      switch (type) {
        case 'CREATE_GROUP':
          // Ungroup the tabs
          previousState.forEach(({ tabId }: TabState) => {
            chrome.tabs.ungroup(tabId);
          });
          break;
        case 'UNGROUP':
          // Regroup the tabs
          const tabIds = previousState
            .filter((state: TabState) => state.groupId)
            .map((state: TabState) => state.tabId);
          if (tabIds.length > 0) {
            chrome.tabs.group({ tabIds });
          }
          break;
        case 'MERGE_GROUPS':
          // Restore previous group states
          previousState.forEach(({ tabId, groupId }: TabState) => {
            if (groupId) {
              chrome.tabs.group({ tabIds: [tabId], groupId });
            } else {
              chrome.tabs.ungroup(tabId);
            }
          });
          break;
      }
      sendResponse({ success: true });
    } catch (error) {
      console.error('Error undoing action:', error);
      sendResponse({ success: false, error: 'Failed to undo action' });
    }
    return true; // Keep the message channel open for async response
  }
}); 