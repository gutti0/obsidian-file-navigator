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

export default class FileNavigatorPlugin extends Plugin {
  private translator: Translator | null = null;
  settings: FileNavigatorSettings = { groups: [] };

  async onload(): Promise<void> {
    await this.loadSettings();
    this.translator = createTranslator(this.app);
    this.registerCommands();
    this.addSettingTab(new FileNavigatorSettingTab(this));
  }

  onunload(): void {
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
        priority: typeof group.priority === 'number' ? group.priority : 1,
        rules: rules.map((rule: Partial<NavigationRuleSetting>) => {
          const sortType: SortType = rule.sortType === 'modified' || rule.sortType === 'filename' || rule.sortType === 'frontmatter' ? rule.sortType : 'created';
          const filterType: RuleFilterType = rule.filterType === 'folder' ? 'folder' : 'tag';
          const sortDirection: 'asc' | 'desc' = rule.sortDirection === 'desc' ? 'desc' : 'asc';
          const baseRule: NavigationRuleSetting = {
            id: typeof rule.id === 'string' ? rule.id : createId(),
            name: typeof rule.name === 'string' ? rule.name : '',
            filterType,
            filterValue: typeof rule.filterValue === 'string' ? rule.filterValue : '',
            sortType,
            sortDirection
          };
          if (sortType === 'frontmatter') {
            baseRule.sortKey = typeof rule.sortKey === 'string' ? rule.sortKey : '';
            baseRule.sortValueType = rule.sortValueType === 'number' || rule.sortValueType === 'date' ? rule.sortValueType : 'string';
          }
          return baseRule;
        })
      };
    });
    this.settings = { groups };
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  getSettings(): FileNavigatorSettings {
    return this.settings;
  }

  private registerCommands(): void {
    this.addCommand({
      id: 'obsidian-file-navigator-go-next',
      name: this.translate('commands.navigateNext'),
      callback: () => this.navigate('next')
    });

    this.addCommand({
      id: 'obsidian-file-navigator-go-previous',
      name: this.translate('commands.navigatePrevious'),
      callback: () => this.navigate('previous')
    });

    this.addCommand({
      id: 'obsidian-file-navigator-go-latest',
      name: this.translate('commands.navigateLatest'),
      callback: () => this.navigate('latest')
    });
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

  private navigate(direction: NavigationDirection): void {
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      new Notice(this.translate('notices.noActiveFile'));
      return;
    }

    this.handleNavigation(activeFile, direction);
  }

  private handleNavigation(file: TFile, direction: NavigationDirection): void {
    // 本実装が整うまでは機能未対応であることを明示する
    console.debug('FileNavigatorPlugin', 'navigate', direction, file.path);
    new Notice(this.translate('notices.notImplemented'));
  }
}

class FileNavigatorSettingTab extends PluginSettingTab {
  constructor(private readonly plugin: FileNavigatorPlugin) {
    super(plugin.app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    this.name = this.plugin.translate('settings.tabName');
    containerEl.createEl('h2', { text: this.plugin.translate('settings.title') });
    containerEl.createEl('p', { text: this.plugin.translate('settings.description') });

    const groupsContainer = containerEl.createDiv({ cls: 'file-navigator-settings__groups' });

    this.renderGroups(groupsContainer);
  }

  private renderGroups(container: HTMLElement): void {
    container.empty();

    const groups = [...this.plugin.settings.groups].sort((a, b) => {
      if (a.priority === b.priority) {
        return a.name.localeCompare(b.name);
      }
      return a.priority - b.priority;
    });

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
          const nextPriority = this.getNextPriority();
          const newGroup: NavigationGroupSetting = {
            id: createId(),
            name: '',
            priority: nextPriority,
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
      text: group.name.trim() || this.plugin.translate('settings.group.titleFallback'),
      cls: 'file-navigator-group__title'
    });

    const nameSetting = new Setting(groupWrapper)
      .setName(this.plugin.translate('settings.group.name'))
      .setDesc(this.plugin.translate('settings.group.nameDesc'));

    nameSetting.addText((text) => {
      text
        .setPlaceholder(this.plugin.translate('settings.group.namePlaceholder'))
        .setValue(group.name)
        .onChange(async (value) => {
          group.name = value;
          titleEl.setText(value.trim() || this.plugin.translate('settings.group.titleFallback'));
          await this.plugin.saveSettings();
        });
    });

    const prioritySetting = new Setting(groupWrapper)
      .setName(this.plugin.translate('settings.group.priority'))
      .setDesc(this.plugin.translate('settings.group.priorityDesc'));

    prioritySetting.addText((text) => {
      text
        .setPlaceholder('1')
        .setValue(String(group.priority))
        .onChange(async (value) => {
          const parsed = Number(value);
          group.priority = Number.isFinite(parsed) ? parsed : group.priority;
          await this.plugin.saveSettings();
          this.display();
        });
    });

    prioritySetting.addButton((button) => {
      button
        .setButtonText(this.plugin.translate('settings.group.remove'))
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
            name: '',
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
      text: rule.name.trim() || this.plugin.translate('settings.rule.titleFallback'),
      cls: 'file-navigator-rule__title'
    });

    const nameSetting = new Setting(ruleWrapper)
      .setName(this.plugin.translate('settings.rule.name'))
      .setDesc(this.plugin.translate('settings.rule.nameDesc'));

    nameSetting.addText((text) => {
      text
        .setPlaceholder(this.plugin.translate('settings.rule.namePlaceholder'))
        .setValue(rule.name)
        .onChange(async (value) => {
          rule.name = value;
          titleEl.setText(value.trim() || this.plugin.translate('settings.rule.titleFallback'));
          await this.plugin.saveSettings();
        });
    });

    const filterSetting = new Setting(ruleWrapper)
      .setName(this.plugin.translate('settings.rule.filterType'))
      .setDesc(this.plugin.translate('settings.rule.filterDesc'));

    filterSetting.addDropdown((dropdown) => {
      dropdown.addOption('tag', this.plugin.translate('settings.rule.filter.tag'));
      dropdown.addOption('folder', this.plugin.translate('settings.rule.filter.folder'));
      dropdown.setValue(rule.filterType);
      dropdown.onChange(async (value) => {
        rule.filterType = value as RuleFilterType;
        await this.plugin.saveSettings();
        this.display();
      });
    });

    const filterValueSetting = new Setting(ruleWrapper)
      .setName(this.plugin.translate('settings.rule.filterValue'))
      .setDesc(
        rule.filterType === 'tag'
          ? this.plugin.translate('settings.rule.filterValueTagDesc')
          : this.plugin.translate('settings.rule.filterValueFolderDesc')
      );

    filterValueSetting.addText((text) => {
      text
        .setPlaceholder(
          rule.filterType === 'tag'
            ? this.plugin.translate('settings.rule.filterValueTagPlaceholder')
            : this.plugin.translate('settings.rule.filterValueFolderPlaceholder')
        )
        .setValue(rule.filterValue)
        .onChange(async (value) => {
          rule.filterValue = value;
          await this.plugin.saveSettings();
        });
    });

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
        rule.sortType = value as SortType;
        if (rule.sortType !== 'frontmatter') {
          delete rule.sortKey;
          delete rule.sortValueType;
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

    const removeRuleSetting = new Setting(ruleWrapper);
    removeRuleSetting.settingEl.addClass('file-navigator-rule__remove');
    removeRuleSetting
      .setName(this.plugin.translate('settings.rule.remove'))
      .setDesc(this.plugin.translate('settings.rule.removeDesc'));

    removeRuleSetting.addButton((button) => {
      button
        .setButtonText(this.plugin.translate('settings.rule.removeButton'))
        .setWarning()
        .onClick(async () => {
          group.rules = group.rules.filter((item) => item.id !== rule.id);
          await this.plugin.saveSettings();
          this.display();
        });
    });
  }

  private getNextPriority(): number {
    if (this.plugin.settings.groups.length === 0) {
      return 1;
    }
    const priorities = this.plugin.settings.groups.map((group) => group.priority);
    return Math.max(...priorities) + 1;
  }
}


