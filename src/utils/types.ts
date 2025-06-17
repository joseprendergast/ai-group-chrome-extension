export interface Tab {
  id?: number;
  title?: string;
  url?: string;
  favIconUrl?: string;
  groupId?: number;
}

export interface CategorizedTab extends Tab {
  category: string;
  confidence: number;
}

export interface TabGroup {
  id: number;
  title?: string;
  color: string;
  collapsed: boolean;
  windowId: number;
}

export interface TabGroupSuggestion {
  name: string;
  tabs: CategorizedTab[];
  color: string;
}

export interface TabGroupMetrics {
  totalGroups: number;
  totalTabs: number;
  averageTabsPerGroup: number;
  mostCommonCategories: string[];
  groupColors: Record<string, number>;
}

export interface Metrics {
  groupsCreated: number;
  actionsCount: number;
  activeGroups: TabGroup[];
}

export interface Category {
  name: string;
  confidence: number;
}

export interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export interface UndoAction {
  type: 'CREATE_GROUP' | 'UNGROUP' | 'MERGE_GROUPS';
  previousState: {
    tabId: number;
    groupId?: number;
  }[];
}

export interface ErrorState {
  message: string;
  details?: string;
} 