export type RuleFilterType = 'tag' | 'folder' | 'property';

export type SortValueType = 'string' | 'number' | 'date';

export type SortType = 'created' | 'modified' | 'filename' | 'frontmatter';

export interface NavigationRuleSetting {
  id: string;
  filterType: RuleFilterType;
  filterValue: string;
  sortType: SortType;
  sortDirection: 'asc' | 'desc';
  sortValueType?: SortValueType;
  sortKey?: string;
  propertyKey?: string;
  propertyValue?: string;
}

export interface NavigationGroupSetting {
  id: string;
  name: string;
  rules: NavigationRuleSetting[];
}

export interface FileNavigatorSettings {
  groups: NavigationGroupSetting[];
}

export const DEFAULT_SETTINGS: FileNavigatorSettings = {
  groups: []
};

export const createId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'fn_' + Math.random().toString(36).slice(2, 12);
};
