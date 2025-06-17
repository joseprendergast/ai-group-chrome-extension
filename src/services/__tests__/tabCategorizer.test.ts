import { categorizeTabs, getBasicCategory } from '../tabCategorizer';
import { Tab } from '../../utils/types';

describe('tabCategorizer', () => {
  const mockTabs: Tab[] = [
    {
      id: 1,
      title: 'CNN - Breaking News',
      url: 'https://www.cnn.com/news',
      favIconUrl: 'https://www.cnn.com/favicon.ico'
    },
    {
      id: 2,
      title: 'Facebook',
      url: 'https://www.facebook.com',
      favIconUrl: 'https://www.facebook.com/favicon.ico'
    },
    {
      id: 3,
      title: 'YouTube - Home',
      url: 'https://www.youtube.com',
      favIconUrl: 'https://www.youtube.com/favicon.ico'
    }
  ];

  describe('getBasicCategory', () => {
    it('should categorize news sites correctly', () => {
      const category = getBasicCategory(mockTabs[0]);
      expect(category).toBe('News');
    });

    it('should categorize social media sites correctly', () => {
      const category = getBasicCategory(mockTabs[1]);
      expect(category).toBe('Social');
    });

    it('should categorize entertainment sites correctly', () => {
      const category = getBasicCategory(mockTabs[2]);
      expect(category).toBe('Entertainment');
    });

    it('should return Other for unknown sites', () => {
      const unknownTab: Tab = {
        id: 4,
        title: 'Unknown Site',
        url: 'https://www.unknown.com',
      };
      const category = getBasicCategory(unknownTab);
      expect(category).toBe('Other');
    });
  });

  describe('categorizeTabs', () => {
    it('should categorize multiple tabs', async () => {
      const categorizedTabs = await categorizeTabs(mockTabs);
      expect(categorizedTabs).toHaveLength(3);
      expect(categorizedTabs[0].category).toBe('News');
      expect(categorizedTabs[1].category).toBe('Social');
      expect(categorizedTabs[2].category).toBe('Entertainment');
    });

    it('should handle empty tab array', async () => {
      const categorizedTabs = await categorizeTabs([]);
      expect(categorizedTabs).toHaveLength(0);
    });

    it('should include confidence scores', async () => {
      const categorizedTabs = await categorizeTabs(mockTabs);
      categorizedTabs.forEach(tab => {
        expect(tab).toHaveProperty('confidence');
        expect(typeof tab.confidence).toBe('number');
        expect(tab.confidence).toBeGreaterThanOrEqual(0);
        expect(tab.confidence).toBeLessThanOrEqual(1);
      });
    });
  });
}); 