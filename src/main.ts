import { Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';
import { Translator, createTranslator, readAppLocale } from './i18n';
import {
  FileNavigatorSettings,
  NavigationGroupSetting,
  NavigationRuleSetting,
  RuleFilterType,
  SortType,
  SortValueType,
  createId
} from './settings';

export type NavigationDirection = 'previous' | 'next' | 'latest';

type GroupCommandDirection = NavigationDirection;

interface GroupCommandDescriptor {
  direction: GroupCommandDirection;
  id: string;
  label: string;
}

export default class FileNavigatorPlugin extends Plugin {
  private translator: Translator | null = null;
  settings: FileNavigatorSettings = { groups: [] };
  private registeredCommandIds: string[] = [];

  async onload(): Promise<void> {
    await this.loadSettings();
    this.translator = createTranslator(this.app);
    this.refreshCommands();
    this.addSettingTab(new FileNavigatorSettingTab(this));
  }

  onunload(): void {
    this.unregisterGroupCommands();
    this.translator = null;
  }

  async loadSettings(): Promise<void> {
    const data = await this.loadData();
    const rawGroups = Array.isArray(data?.groups) ? data.groups : [];
    const groups: NavigationGroupSetting[] = rawGroups.map((group: Partial<NavigationGroupSetting>) => {
      const rules = Array.isArray(group.rules) ? group.rules : [];
      return {
        id: typeof group.id === 'string' ? group.id : createId(),
        name: typeof group.name === 'string' ? group.name : '',
        rules: rules.map((rule: Partial<NavigationRuleSetting>) => {
          const sortType: SortType = rule.sortType === 'modified' || rule.sortType === 'filename' || rule.sortType === 'frontmatter' ? rule.sortType : 'created';
          const filterType: RuleFilterType = rule.filterType === 'folder' || rule.filterType === 'property' ? rule.filterType : 'tag';
          const sortDirection: 'asc' | 'desc' = rule.sortDirection === 'desc' ? 'desc' : 'asc';
          const baseRule: NavigationRuleSetting = {
            id: typeof rule.id === 'string' ? rule.id : createId(),
            filterType,
            filterValue: typeof rule.filterValue === 'string' ? rule.filterValue : '',
            sortType,
            sortDirection,
            sortKey: rule.sortKey,
            sortValueType: rule.sortValueType,
            propertyKey: rule.propertyKey,
            propertyValue: rule.propertyValue
          };
          if (baseRule.sortType !== 'frontmatter') {
            delete baseRule.sortKey;
            delete baseRule.sortValueType;
          } else {
            baseRule.sortKey = typeof rule.sortKey === 'string' ? rule.sortKey : '';
            baseRule.sortValueType = rule.sortValueType === 'number' || rule.sortValueType === 'date' ? rule.sortValueType : 'string';
          }
          if (baseRule.filterType === 'property') {
            baseRule.propertyKey = typeof rule.propertyKey === 'string' ? rule.propertyKey : '';
            baseRule.propertyValue = typeof rule.propertyValue === 'string' ? rule.propertyValue : '';
            baseRule.filterValue = '';
          } else {
            delete baseRule.propertyKey;
            delete baseRule.propertyValue;
          }
          return baseRule;
        })
      };
    });
    this.settings = { groups };
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
    this.refreshCommands();
  }

  private refreshCommands(): void {
    this.unregisterGroupCommands();
    this.registerGroupCommands();
  }

  private registerGroupCommands(): void {
    for (const group of this.settings.groups) {
      const label = this.getGroupLabel(group);
      const directions: GroupCommandDirection[] = ['previous', 'next', 'latest'];
      for (const direction of directions) {
        const command = this.addCommand({
          id: this.getGroupCommandBaseId(group, direction),
          name: this.formatGroupCommandLabel(label, direction),
          callback: () => this.navigate(group, direction)
        });
        this.registeredCommandIds.push(command.id);
      }
    }
  }

  private unregisterGroupCommands(): void {
    const commandsApi = (this.app as unknown as { commands?: { removeCommand: (id: string) => void } }).commands;
    if (!commandsApi) {
      this.registeredCommandIds = [];
      return;
    }
    for (const commandId of this.registeredCommandIds) {
      commandsApi.removeCommand(commandId);
    }
    this.registeredCommandIds = [];
  }

  private formatGroupCommandLabel(groupLabel: string, direction: GroupCommandDirection): string {
    const directionLabel = this.translate(
      direction === 'previous'
        ? 'commands.navigatePrevious'
        : direction === 'next'
        ? 'commands.navigateNext'
        : 'commands.navigateLatest'
    );
    return `${groupLabel} • ${directionLabel}`;
  }

  private getGroupCommandBaseId(group: NavigationGroupSetting, direction: GroupCommandDirection): string {
    return `group-${group.id}-${direction}`;
  }

  private getGroupCommandFullId(group: NavigationGroupSetting, direction: GroupCommandDirection): string {
    return `${this.manifest.id}:${this.getGroupCommandBaseId(group, direction)}`;
  }

  private getTranslator(): Translator {
    if (!this.translator) {
      this.translator = createTranslator(this.app);
    }
    this.translator.setLocale(readAppLocale(this.app));
    return this.translator;
  }

  translate(key: Parameters<Translator['t']>[0]): string {
    return this.getTranslator().t(key);
  }

  private async navigate(group: NavigationGroupSetting, direction: NavigationDirection): Promise<void> {
    if (group.rules.length === 0) {
      new Notice(this.translate('notices.groupHasNoRules'));
      return;
    }

    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      new Notice(this.translate('notices.noActiveFile'));
      return;
    }

    await this.handleNavigation(group, activeFile, direction);
  }

  private async handleNavigation(group: NavigationGroupSetting, file: TFile, direction: NavigationDirection): Promise<void> {
    console.debug('FileNavigatorPlugin', 'navigate', { group: group.id, direction, file: file.path });
    const target = this.resolveNavigationTarget(group, file, direction);
    if (!target) {
      new Notice(this.translate('notices.noCandidateFound'));
      return;
    }
    if (target.path === file.path) {
      return;
    }
    await this.openFile(target);
  }

  private resolveNavigationTarget(group: NavigationGroupSetting, activeFile: TFile, direction: NavigationDirection): TFile | null {
    for (const rule of group.rules) {
      const candidates = this.sortRuleCandidates(this.collectRuleCandidates(rule), rule);
      if (candidates.length === 0) {
        continue;
      }
      if (direction === 'latest') {
        return candidates[0];
      }
      const currentIndex = candidates.findIndex((item) => item.path === activeFile.path);
      if (currentIndex === -1) {
        // アクティブファイルがこのルールの候補に含まれていない場合は次のルールを評価する
        continue;
      }
      if (direction === 'next') {
        return candidates[(currentIndex + 1) % candidates.length];
      }
      return candidates[(currentIndex - 1 + candidates.length) % candidates.length];
    }
    return null;
  }

  private collectRuleCandidates(rule: NavigationRuleSetting): TFile[] {
    const files = this.app.vault.getMarkdownFiles();
    return files.filter((file) => this.matchesRule(rule, file));
  }

  private matchesRule(rule: NavigationRuleSetting, file: TFile): boolean {
    switch (rule.filterType) {
      case 'folder':
        return this.matchesFolder(rule.filterValue, file);
      case 'property':
        return this.matchesProperty(rule, file);
      case 'tag':
      default:
        return this.matchesTag(rule.filterValue, file);
    }
  }

  private matchesTag(tagValue: string, file: TFile): boolean {
    const normalized = this.normalizeTag(tagValue);
    if (!normalized) {
      return true;
    }
    const tags = this.getFileTags(file);
    return tags.includes(normalized);
  }

  private matchesFolder(folderValue: string, file: TFile): boolean {
    const normalized = folderValue?.trim() ?? '';
    if (!normalized) {
      return true;
    }
    const withoutSlashes = normalized.replace(/^[/\\\\]+|[/\\\\]+$/g, '').toLowerCase();
    const fileFolder = (file.parent?.path ?? '').toLowerCase();
    return fileFolder === withoutSlashes || fileFolder.startsWith(`${withoutSlashes}/`);
  }

  private matchesProperty(rule: NavigationRuleSetting, file: TFile): boolean {
    const key = rule.propertyKey?.trim();
    if (!key) {
      return false;
    }
    const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
    if (!frontmatter || !(key in frontmatter)) {
      return false;
    }
    if (rule.propertyValue && rule.propertyValue.trim().length > 0) {
      return String(frontmatter[key]) === rule.propertyValue;
    }
    return true;
  }

  private getFileTags(file: TFile): string[] {
    const cache = this.app.metadataCache.getFileCache(file);
    const tags = new Set<string>();
    cache?.tags?.forEach((tag) => {
      const normalized = this.normalizeTag(tag.tag);
      if (normalized) {
        tags.add(normalized);
      }
    });
    const frontmatterTags = cache?.frontmatter?.tags;
    if (Array.isArray(frontmatterTags)) {
      frontmatterTags.forEach((value) => {
        const normalized = this.normalizeTag(String(value));
        if (normalized) {
          tags.add(normalized);
        }
      });
    } else if (typeof frontmatterTags === 'string') {
      frontmatterTags
        .split(/[,\s]+/)
        .map((value) => this.normalizeTag(value))
        .filter((value): value is string => Boolean(value))
        .forEach((value) => tags.add(value));
    }
    return Array.from(tags);
  }

  private normalizeTag(value: string | undefined | null): string | null {
    if (!value) {
      return null;
    }
    return value.replace(/^#+/, '').trim().toLowerCase();
  }

  private sortRuleCandidates(candidates: TFile[], rule: NavigationRuleSetting): TFile[] {
    const sorted = [...candidates];
    sorted.sort((a, b) => this.compareFiles(a, b, rule));
    if (rule.sortDirection === 'desc') {
      sorted.reverse();
    }
    return sorted;
  }

  private compareFiles(a: TFile, b: TFile, rule: NavigationRuleSetting): number {
    switch (rule.sortType) {
      case 'modified':
        return a.stat.mtime - b.stat.mtime;
      case 'filename':
        return a.path.localeCompare(b.path, undefined, { sensitivity: 'base' });
      case 'frontmatter': {
        const aValue = this.getFrontmatterSortValue(a, rule);
        const bValue = this.getFrontmatterSortValue(b, rule);
        if (aValue === null && bValue === null) {
          return 0;
        }
        if (aValue === null) {
          return -1;
        }
        if (bValue === null) {
          return 1;
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return aValue - bValue;
        }
        return String(aValue).localeCompare(String(bValue));
      }
      case 'created':
      default:
        return a.stat.ctime - b.stat.ctime;
    }
  }

  private getFrontmatterSortValue(file: TFile, rule: NavigationRuleSetting): string | number | null {
    const key = rule.sortKey?.trim();
    if (!key) {
      return null;
    }
    const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
    if (!frontmatter || !(key in frontmatter)) {
      return null;
    }
    const value = frontmatter[key];
    switch (rule.sortValueType) {
      case 'number': {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
      }
      case 'date': {
        const timestamp = Date.parse(String(value));
        return Number.isNaN(timestamp) ? null : timestamp;
      }
      case 'string':
      default:
        return value == null ? null : String(value);
    }
  }

  private async openFile(file: TFile): Promise<void> {
    const leaf = this.app.workspace.getLeaf(false);
    await leaf.openFile(file);
  }

  getGroupLabel(group: NavigationGroupSetting): string {
    const name = group.name?.trim();
    return name && name.length > 0 ? name : this.translate('settings.group.titleFallback');
  }

  getRuleSummary(rule: NavigationRuleSetting): string {
    const missingValue = this.translate('settings.rule.summary.missing');
    switch (rule.filterType) {
      case 'folder':
        return this.translate('settings.rule.summary.folder').replace('{value}', rule.filterValue?.trim() || missingValue);
      case 'property': {
        const key = rule.propertyKey?.trim() || missingValue;
        const value = rule.propertyValue?.trim();
        if (value && value.length > 0) {
          return this.translate('settings.rule.summary.propertyWithValue')
            .replace('{key}', key)
            .replace('{value}', value);
        }
        return this.translate('settings.rule.summary.propertyWithoutValue').replace('{key}', key);
      }
      case 'tag':
      default:
        return this.translate('settings.rule.summary.tag').replace('{value}', rule.filterValue?.trim() || missingValue);
    }
  }

  getGroupCommandDescriptors(group: NavigationGroupSetting): GroupCommandDescriptor[] {
    const label = this.getGroupLabel(group);
    const directions: GroupCommandDirection[] = ['previous', 'next', 'latest'];
    return directions.map((direction) => ({
      direction,
      id: this.getGroupCommandFullId(group, direction),
      label: this.formatGroupCommandLabel(label, direction)
    }));
  }

  openHotkeySettings(searchTerm: string): void {
    const settingManager = (this.app as unknown as { setting?: { open: () => void; openTabById?: (id: string) => void } }).setting;
    if (!settingManager) {
      return;
    }
    settingManager.open?.();
    settingManager.openTabById?.('hotkeys');
    window.setTimeout(() => {
      const searchInput = document.querySelector('input.setting-search-input') as HTMLInputElement | null;
      if (searchInput) {
        searchInput.focus();
        searchInput.value = searchTerm;
        searchInput.dispatchEvent(new Event('input'));
      }
    }, 200);
  }
}

class FileNavigatorSettingTab extends PluginSettingTab {
  constructor(private readonly plugin: FileNavigatorPlugin) {
    super(plugin.app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: this.plugin.translate('settings.title') });
    containerEl.createEl('p', { text: this.plugin.translate('settings.description') });

    const groupsContainer = containerEl.createDiv({ cls: 'file-navigator-settings__groups' });
    this.renderGroups(groupsContainer);
  }

  private renderGroups(container: HTMLElement): void {
    container.empty();

    const groups = [...this.plugin.settings.groups];

    if (groups.length === 0) {
      container.createEl('p', {
        text: this.plugin.translate('settings.groups.empty'),
        cls: 'file-navigator-settings__empty'
      });
    }

    for (const group of groups) {
      this.renderGroup(container, group);
    }

    const addGroupSetting = new Setting(container);
    addGroupSetting.settingEl.addClass('file-navigator-settings__add-group');
    addGroupSetting
      .setName(this.plugin.translate('settings.groups.add'))
      .setDesc(this.plugin.translate('settings.groups.addDesc'));

    addGroupSetting.addButton((button) => {
      button
        .setButtonText(this.plugin.translate('settings.groups.addButton'))
        .setCta()
        .onClick(async () => {
          const newGroup: NavigationGroupSetting = {
            id: createId(),
            name: '',
            rules: []
          };
          this.plugin.settings.groups.push(newGroup);
          await this.plugin.saveSettings();
          this.display();
        });
    });
  }

  private renderGroup(parent: HTMLElement, group: NavigationGroupSetting): void {
    const groupWrapper = parent.createDiv({ cls: 'file-navigator-group' });
    const titleEl = groupWrapper.createEl('h3', {
      text: this.plugin.getGroupLabel(group),
      cls: 'file-navigator-group__title'
    });

    const nameSetting = new Setting(groupWrapper)
      .setName(this.plugin.translate('settings.group.name'))
      .setDesc(this.plugin.translate('settings.group.nameDesc'));


    const hotkeysSetting = new Setting(groupWrapper)
      .setName(this.plugin.translate('settings.group.hotkeysTitle'));

    let commandDescriptors: GroupCommandDescriptor[] = [];
    const updateHotkeyDescription = (): void => {
      commandDescriptors = this.plugin.getGroupCommandDescriptors(group);
      const fragment = document.createDocumentFragment();
      commandDescriptors.forEach((descriptor, index) => {
        fragment.append(descriptor.label);
        if (index < commandDescriptors.length - 1) {
          fragment.append(' / ');
        }
      });
      hotkeysSetting.setDesc(fragment);
    };

    updateHotkeyDescription();

    nameSetting.addText((text) => {
      text
        .setPlaceholder(this.plugin.translate('settings.group.namePlaceholder'))
        .setValue(group.name)
        .onChange(async (value) => {
          group.name = value;
          titleEl.setText(this.plugin.getGroupLabel(group));
          updateHotkeyDescription();
          await this.plugin.saveSettings();
        });
    });

    hotkeysSetting.addButton((button) => {
      button
        .setButtonText(this.plugin.translate('settings.group.hotkeysButton'))
        .onClick(() => {
          const firstDescriptor = commandDescriptors[0];
          this.plugin.openHotkeySettings(firstDescriptor ? firstDescriptor.label : this.plugin.getGroupLabel(group));
        });
    });

    const removeGroupSetting = new Setting(groupWrapper);
    removeGroupSetting.settingEl.addClass('file-navigator-group__actions');
    removeGroupSetting
      .setName(this.plugin.translate('settings.group.remove'))
      .setDesc(this.plugin.translate('settings.group.removeDesc'));

    removeGroupSetting.addButton((button) => {
      button
        .setButtonText('Remove')
        .setTooltip(this.plugin.translate('settings.group.removeTooltip'))
        .setWarning()
        .onClick(async () => {
          this.plugin.settings.groups = this.plugin.settings.groups.filter((item) => item.id !== group.id);
          await this.plugin.saveSettings();
          this.display();
        });
    });

    const rulesContainer = groupWrapper.createDiv({ cls: 'file-navigator-group__rules' });
    if (group.rules.length === 0) {
      rulesContainer.createEl('p', {
        text: this.plugin.translate('settings.rules.empty'),
        cls: 'file-navigator-rules__empty'
      });
    }

    for (const rule of group.rules) {
      this.renderRule(rulesContainer, group, rule);
    }

    const addRuleSetting = new Setting(groupWrapper);
    addRuleSetting.settingEl.addClass('file-navigator-rules__add');
    addRuleSetting
      .setName(this.plugin.translate('settings.rules.add'))
      .setDesc(this.plugin.translate('settings.rules.addDesc'));

    addRuleSetting.addButton((button) => {
      button
        .setButtonText(this.plugin.translate('settings.rules.addButton'))
        .setCta()
        .onClick(async () => {
          const newRule: NavigationRuleSetting = {
            id: createId(),
            filterType: 'tag',
            filterValue: '',
            sortType: 'created',
            sortDirection: 'asc'
          };
          group.rules.push(newRule);
          await this.plugin.saveSettings();
          this.display();
        });
    });
  }

  private renderRule(container: HTMLElement, group: NavigationGroupSetting, rule: NavigationRuleSetting): void {
    const ruleWrapper = container.createDiv({ cls: 'file-navigator-rule' });
    const titleEl = ruleWrapper.createEl('h4', {
      text: this.plugin.getRuleSummary(rule),
      cls: 'file-navigator-rule__title'
    });

    const filterSetting = new Setting(ruleWrapper)
      .setName(this.plugin.translate('settings.rule.filterType'))
      .setDesc(this.plugin.translate('settings.rule.filterDesc'));

    filterSetting.addDropdown((dropdown) => {
      dropdown.addOption('tag', this.plugin.translate('settings.rule.filter.tag'));
      dropdown.addOption('folder', this.plugin.translate('settings.rule.filter.folder'));
      dropdown.addOption('property', this.plugin.translate('settings.rule.filter.property'));
      dropdown.setValue(rule.filterType);
      dropdown.onChange(async (value) => {
        const nextType = value as RuleFilterType;
        rule.filterType = nextType;
        if (nextType === 'property') {
          rule.propertyKey = rule.propertyKey ?? '';
          rule.propertyValue = rule.propertyValue ?? '';
          rule.filterValue = '';
        } else {
          rule.filterValue = '';
          delete rule.propertyKey;
          delete rule.propertyValue;
        }
        titleEl.setText(this.plugin.getRuleSummary(rule));
        await this.plugin.saveSettings();
        this.display();
      });
    });

    if (rule.filterType === 'tag') {
      const filterValueSetting = new Setting(ruleWrapper)
        .setName(this.plugin.translate('settings.rule.filterValue'))
        .setDesc(this.plugin.translate('settings.rule.filterValueTagDesc'));

      filterValueSetting.addText((text) => {
        text
          .setPlaceholder(this.plugin.translate('settings.rule.filterValueTagPlaceholder'))
          .setValue(rule.filterValue)
          .onChange(async (value) => {
            rule.filterValue = value;
            titleEl.setText(this.plugin.getRuleSummary(rule));
            await this.plugin.saveSettings();
          });
      });
    } else if (rule.filterType === 'folder') {
      const filterValueSetting = new Setting(ruleWrapper)
        .setName(this.plugin.translate('settings.rule.filterValue'))
        .setDesc(this.plugin.translate('settings.rule.filterValueFolderDesc'));

      filterValueSetting.addText((text) => {
        text
          .setPlaceholder(this.plugin.translate('settings.rule.filterValueFolderPlaceholder'))
          .setValue(rule.filterValue)
          .onChange(async (value) => {
            rule.filterValue = value;
            titleEl.setText(this.plugin.getRuleSummary(rule));
            await this.plugin.saveSettings();
          });
      });
    } else {
      const propertyKeySetting = new Setting(ruleWrapper)
        .setName(this.plugin.translate('settings.rule.propertyKey'))
        .setDesc(this.plugin.translate('settings.rule.propertyKeyDesc'));

      propertyKeySetting.addText((text) => {
        text
          .setPlaceholder(this.plugin.translate('settings.rule.propertyKeyPlaceholder'))
          .setValue(rule.propertyKey ?? '')
          .onChange(async (value) => {
            rule.propertyKey = value;
            titleEl.setText(this.plugin.getRuleSummary(rule));
            await this.plugin.saveSettings();
          });
      });

      const propertyValueSetting = new Setting(ruleWrapper)
        .setName(this.plugin.translate('settings.rule.propertyValue'))
        .setDesc(this.plugin.translate('settings.rule.propertyValueDesc'));

      propertyValueSetting.addText((text) => {
        text
          .setPlaceholder(this.plugin.translate('settings.rule.propertyValuePlaceholder'))
          .setValue(rule.propertyValue ?? '')
          .onChange(async (value) => {
            rule.propertyValue = value;
            titleEl.setText(this.plugin.getRuleSummary(rule));
            await this.plugin.saveSettings();
          });
      });
    }

    const sortSetting = new Setting(ruleWrapper)
      .setName(this.plugin.translate('settings.rule.sortType'))
      .setDesc(this.plugin.translate('settings.rule.sortDesc'));

    sortSetting.addDropdown((dropdown) => {
      dropdown.addOption('created', this.plugin.translate('settings.rule.sort.created'));
      dropdown.addOption('modified', this.plugin.translate('settings.rule.sort.modified'));
      dropdown.addOption('filename', this.plugin.translate('settings.rule.sort.filename'));
      dropdown.addOption('frontmatter', this.plugin.translate('settings.rule.sort.frontmatter'));
      dropdown.setValue(rule.sortType);
      dropdown.onChange(async (value) => {
        const nextSort = value as SortType;
        rule.sortType = nextSort;
        if (nextSort !== 'frontmatter') {
          delete rule.sortKey;
          delete rule.sortValueType;
        } else {
          rule.sortKey = rule.sortKey ?? '';
          rule.sortValueType = rule.sortValueType ?? 'string';
        }
        await this.plugin.saveSettings();
        this.display();
      });
    });

    const directionSetting = new Setting(ruleWrapper)
      .setName(this.plugin.translate('settings.rule.sortDirection'))
      .setDesc(this.plugin.translate('settings.rule.sortDirectionDesc'));

    directionSetting.addDropdown((dropdown) => {
      dropdown.addOption('asc', this.plugin.translate('settings.rule.sortDirection.asc'));
      dropdown.addOption('desc', this.plugin.translate('settings.rule.sortDirection.desc'));
      dropdown.setValue(rule.sortDirection);
      dropdown.onChange(async (value) => {
        rule.sortDirection = value as 'asc' | 'desc';
        await this.plugin.saveSettings();
      });
    });

    if (rule.sortType === 'frontmatter') {
      const keySetting = new Setting(ruleWrapper)
        .setName(this.plugin.translate('settings.rule.sortKey'))
        .setDesc(this.plugin.translate('settings.rule.sortKeyDesc'));

      keySetting.addText((text) => {
        text
          .setPlaceholder(this.plugin.translate('settings.rule.sortKeyPlaceholder'))
          .setValue(rule.sortKey ?? '')
          .onChange(async (value) => {
            rule.sortKey = value;
            await this.plugin.saveSettings();
          });
      });

      const valueTypeSetting = new Setting(ruleWrapper)
        .setName(this.plugin.translate('settings.rule.sortValueType'))
        .setDesc(this.plugin.translate('settings.rule.sortValueTypeDesc'));

      valueTypeSetting.addDropdown((dropdown) => {
        dropdown.addOption('string', this.plugin.translate('settings.rule.sortValueType.string'));
        dropdown.addOption('number', this.plugin.translate('settings.rule.sortValueType.number'));
        dropdown.addOption('date', this.plugin.translate('settings.rule.sortValueType.date'));
        dropdown.setValue(rule.sortValueType ?? 'string');
        dropdown.onChange(async (value) => {
          rule.sortValueType = value as SortValueType;
          await this.plugin.saveSettings();
        });
      });
    }

    const orderSetting = new Setting(ruleWrapper);
    orderSetting.settingEl.addClass('file-navigator-rule__order');
    orderSetting.setName(this.plugin.translate('settings.rule.orderControlsTitle'));

    const index = group.rules.findIndex((item) => item.id === rule.id);
    const isFirst = index <= 0;
    const isLast = index >= group.rules.length - 1;

    orderSetting.addButton((button) => {
      button
        .setButtonText('Up')
        .setTooltip(this.plugin.translate('settings.rule.moveUp'))
        .setDisabled(isFirst)
        .onClick(async () => {
          await this.moveRule(group, rule, -1);
        });
    });

    orderSetting.addButton((button) => {
      button
        .setButtonText('Down')
        .setTooltip(this.plugin.translate('settings.rule.moveDown'))
        .setDisabled(isLast)
        .onClick(async () => {
          await this.moveRule(group, rule, 1);
        });
    });

    orderSetting.addButton((button) => {
      button
        .setButtonText('Remove')
        .setTooltip(this.plugin.translate('settings.rule.removeButtonTooltip'))
        .setWarning()
        .onClick(async () => {
          group.rules = group.rules.filter((item) => item.id !== rule.id);
          await this.plugin.saveSettings();
          this.display();
        });
    });
  }

  private async moveRule(group: NavigationGroupSetting, rule: NavigationRuleSetting, delta: number): Promise<void> {
    const currentIndex = group.rules.findIndex((item) => item.id === rule.id);
    const nextIndex = currentIndex + delta;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= group.rules.length) {
      return;
    }
    const [moved] = group.rules.splice(currentIndex, 1);
    group.rules.splice(nextIndex, 0, moved);
    await this.plugin.saveSettings();
    this.display();
  }
}











