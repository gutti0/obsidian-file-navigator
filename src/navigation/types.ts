import type { TAbstractFile, TFile } from 'obsidian';

export type RuleFilter =
  | { type: 'tag'; tag: string }
  | { type: 'folder'; folder: string; recursive?: boolean };

export type FrontmatterValueType = 'string' | 'number' | 'date';

export type SortOption =
  | { type: 'created'; direction?: 'asc' | 'desc' }
  | { type: 'modified'; direction?: 'asc' | 'desc' }
  | { type: 'filename'; direction?: 'asc' | 'desc' }
  | {
      type: 'frontmatter';
      key: string;
      valueType: FrontmatterValueType;
      direction?: 'asc' | 'desc';
    };

export interface NavigationRule {
  id: string;
  filter: RuleFilter;
  sort: SortOption;
}

export interface NavigationGroup {
  id: string;
  name: string;
  priority: number;
  rules: NavigationRule[];
}

export interface NavigationContext {
  activeFile: TFile;
  candidates: TAbstractFile[];
}
