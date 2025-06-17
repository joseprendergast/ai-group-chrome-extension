import { Tab, CategorizedTab, Category } from '../utils/types';

interface CustomCategory {
  id: string;
  name: string;
  patterns: string[];
  tabs: Tab[];
}

export async function categorizeTabs(tabs: Tab[]): Promise<CategorizedTab[]> {
  const categorizedTabs: CategorizedTab[] = [];
  
  // Get custom categories from storage
  const { customCategories = [] } = await chrome.storage.local.get(['customCategories']);
  
  for (const tab of tabs) {
    if (!tab.url) continue;

    try {
      // First check custom categories
      const customCategory = findCustomCategory(tab, customCategories);
      if (customCategory) {
        categorizedTabs.push({
          ...tab,
          category: customCategory.name,
          confidence: 1.0 // High confidence for custom categories
        });
        continue;
      }

      // If no custom category matches, use basic categorization
      const category = getBasicCategory(tab);
      categorizedTabs.push({
        ...tab,
        category: category.name,
        confidence: category.confidence
      });
    } catch (error) {
      console.error('Error categorizing tab:', error);
      categorizedTabs.push({
        ...tab,
        category: 'Uncategorized',
        confidence: 0
      });
    }
  }

  return categorizedTabs;
}

function findCustomCategory(tab: Tab, customCategories: CustomCategory[]): CustomCategory | null {
  const url = tab.url?.toLowerCase() || '';
  const title = tab.title?.toLowerCase() || '';

  for (const category of customCategories) {
    // Check if tab is already in this category
    if (category.tabs.some(t => t.id === tab.id)) {
      return category;
    }

    // Check if any pattern matches
    for (const pattern of category.patterns) {
      const patternLower = pattern.toLowerCase();
      if (url.includes(patternLower) || title.includes(patternLower)) {
        return category;
      }
    }
  }

  return null;
}

export function getBasicCategory(tab: Tab): Category {
  if (!tab.url) {
    return { name: 'Uncategorized', confidence: 0 };
  }

  const url = tab.url.toLowerCase();
  const title = tab.title?.toLowerCase() || '';

  // Product Management & Strategy
  if (url.includes('productcompass.pm') || 
      url.includes('productled.com') || 
      url.includes('svpg.com') ||
      title.includes('product strategy') ||
      title.includes('product management')) {
    return { name: 'Product Management', confidence: 0.9 };
  }

  // AI & Machine Learning
  if (url.includes('deeplearning.ai') || 
      url.includes('openai.com') || 
      url.includes('claude.ai') ||
      url.includes('chatgpt.com') ||
      title.includes('ai') ||
      title.includes('machine learning')) {
    return { name: 'AI & ML', confidence: 0.9 };
  }

  // Learning & Courses
  if (url.includes('coursera.org') || 
      url.includes('udacity.com') || 
      url.includes('linkedin.com/learning') ||
      url.includes('maven.com') ||
      title.includes('course') ||
      title.includes('learning')) {
    return { name: 'Learning & Courses', confidence: 0.8 };
  }

  // Marketplace Resources
  if (url.includes('everythingmarketplaces.com') || 
      url.includes('sharetribe.com') ||
      title.includes('marketplace')) {
    return { name: 'Marketplace Resources', confidence: 0.9 };
  }

  // Development & Tech
  if (url.includes('github.com') || 
      url.includes('stackoverflow.com') || 
      url.includes('docs.') ||
      title.includes('development') ||
      title.includes('coding')) {
    return { name: 'Development', confidence: 0.8 };
  }

  // Documentation
  if (url.includes('docs.') || 
      title.includes('documentation') ||
      title.includes('guide')) {
    return { name: 'Documentation', confidence: 0.8 };
  }

  // Communication & Collaboration
  if (url.includes('mail.') || 
      url.includes('gmail.com') || 
      url.includes('outlook.com') ||
      url.includes('calendar.') ||
      url.includes('slack.com')) {
    return { name: 'Communication', confidence: 0.9 };
  }

  // Storage & Files
  if (url.includes('drive.') || 
      url.includes('dropbox.com') || 
      url.includes('onedrive.com')) {
    return { name: 'Storage', confidence: 0.8 };
  }

  // Media & Entertainment
  if (url.includes('youtube.com') || 
      url.includes('vimeo.com') ||
      url.includes('spotify.com') || 
      url.includes('music.')) {
    return { name: 'Media', confidence: 0.9 };
  }

  // Social & Professional Networks
  if (url.includes('linkedin.com') || 
      url.includes('twitter.com') || 
      url.includes('facebook.com') || 
      url.includes('instagram.com')) {
    return { name: 'Social & Professional', confidence: 0.9 };
  }

  // News & Information
  if (url.includes('news.') || 
      url.includes('reuters.com') || 
      url.includes('bloomberg.com') ||
      title.includes('news')) {
    return { name: 'News & Information', confidence: 0.8 };
  }

  // Shopping & E-commerce
  if (url.includes('shopping.') || 
      url.includes('amazon.com') || 
      url.includes('ebay.com')) {
    return { name: 'Shopping', confidence: 0.9 };
  }

  // Tax & Financial
  if (url.includes('keepertax.com') || 
      url.includes('nolo.com') ||
      title.includes('tax') ||
      title.includes('financial')) {
    return { name: 'Tax & Financial', confidence: 0.8 };
  }

  // Default category
  return { name: 'Other', confidence: 0.5 };
} 