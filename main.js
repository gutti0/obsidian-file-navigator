'use strict';

var obsidian = require('obsidian');

var en = {
	"plugin.name": "File Navigator",
	"plugin.description": "Navigate between filtered and sorted files relative to the active note.",
	"commands.navigateNext": "Go to next file",
	"commands.navigatePrevious": "Go to previous file",
	"commands.navigateLatest": "Go to latest file",
	"notices.noActiveFile": "Open a note to use File Navigator.",
	"notices.notImplemented": "File navigation rules are not configured yet.",
	"settings.title": "File Navigator Settings",
	"settings.description": "Configure navigation groups and rules for quick movement between notes.",
	"settings.tabName": "File Navigator",
	"settings.groups.empty": "No groups have been created yet.",
	"settings.groups.add": "Add a new group",
	"settings.groups.addDesc": "Create a navigation group that can hold multiple rules.",
	"settings.groups.addButton": "Add group",
	"settings.group.titleFallback": "Untitled group",
	"settings.group.name": "Group name",
	"settings.group.nameDesc": "Displayed in the settings to help you recognise the group.",
	"settings.group.namePlaceholder": "Daily notes",
	"settings.group.priority": "Priority",
	"settings.group.priorityDesc": "Lower numbers run first when resolving a file.",
	"settings.group.remove": "Remove group",
	"settings.rules.empty": "No rules configured for this group yet.",
	"settings.rules.add": "Add rule",
	"settings.rules.addDesc": "Rules filter and sort candidate files inside the group.",
	"settings.rules.addButton": "Add rule",
	"settings.rule.titleFallback": "Untitled rule",
	"settings.rule.name": "Rule name",
	"settings.rule.nameDesc": "Give the rule a descriptive label.",
	"settings.rule.namePlaceholder": "Tag: journal",
	"settings.rule.filterType": "Filter type",
	"settings.rule.filterDesc": "Select whether to filter by tag or folder.",
	"settings.rule.filter.tag": "Tag",
	"settings.rule.filter.folder": "Folder",
	"settings.rule.filterValue": "Filter value",
	"settings.rule.filterValueTagDesc": "Enter the tag (without #) that the file must contain.",
	"settings.rule.filterValueFolderDesc": "Enter the folder path relative to the vault root.",
	"settings.rule.filterValueTagPlaceholder": "journal",
	"settings.rule.filterValueFolderPlaceholder": "Projects/Notes",
	"settings.rule.sortType": "Sort by",
	"settings.rule.sortDesc": "Choose the property used to order matching files.",
	"settings.rule.sort.created": "Created time",
	"settings.rule.sort.modified": "Modified time",
	"settings.rule.sort.filename": "Filename",
	"settings.rule.sort.frontmatter": "Frontmatter key",
	"settings.rule.sortDirection": "Sort direction",
	"settings.rule.sortDirectionDesc": "Choose ascending or descending order.",
	"settings.rule.sortDirection.asc": "Ascending",
	"settings.rule.sortDirection.desc": "Descending",
	"settings.rule.sortKey": "Frontmatter key",
	"settings.rule.sortKeyDesc": "Provide the frontmatter field name to sort by.",
	"settings.rule.sortKeyPlaceholder": "priority",
	"settings.rule.sortValueType": "Frontmatter value type",
	"settings.rule.sortValueTypeDesc": "Indicate how the frontmatter value should be compared.",
	"settings.rule.sortValueType.string": "String",
	"settings.rule.sortValueType.number": "Number",
	"settings.rule.sortValueType.date": "Date",
	"settings.rule.remove": "Remove rule",
	"settings.rule.removeDesc": "Delete this rule from the group.",
	"settings.rule.removeButton": "Remove rule",
	"notices.groupHasNoRules": "No rules have been configured for this group yet.",
	"settings.group.hotkeysTitle": "Hotkeys",
	"settings.group.hotkeysButton": "Open hotkey settings",
	"settings.rule.filter.property": "Frontmatter property",
	"settings.rule.propertyKey": "Property key",
	"settings.rule.propertyKeyDesc": "Enter the frontmatter key that must be present.",
	"settings.rule.propertyKeyPlaceholder": "status",
	"settings.rule.propertyValue": "Property value",
	"settings.rule.propertyValueDesc": "Optional: match notes whose property equals this value.",
	"settings.rule.propertyValuePlaceholder": "done",
	"settings.rule.summary.tag": "Tag: #{value}",
	"settings.rule.summary.folder": "Folder: {value}",
	"settings.rule.summary.propertyWithValue": "Property: {key} = {value}",
	"settings.rule.summary.propertyWithoutValue": "Property: {key}",
	"settings.rule.summary.missing": "(not set)",
	"settings.rule.orderControlsTitle": "Rule order",
	"settings.rule.moveUp": "Move rule up",
	"settings.rule.moveDown": "Move rule down",
	"settings.rule.removeButtonTooltip": "Remove this rule",
	"settings.group.removeDesc": "Delete this group and its commands.",
	"settings.group.removeTooltip": "Remove group",
	"notices.noCandidateFound": "No matching file was found for this group.",
	"commands.navigateOldest": "Go to oldest"
};

var ja = {
	"plugin.name": "ファイルナビゲーター",
	"plugin.description": "アクティブなノートを基準に、条件で絞り込んだファイルへ移動します。",
	"commands.navigateNext": "次のファイルへ移動",
	"commands.navigatePrevious": "前のファイルへ移動",
	"commands.navigateLatest": "最新のファイルへ移動",
	"notices.noActiveFile": "ノートを開いてからファイルナビゲーターを使用してください。",
	"notices.notImplemented": "ファイル移動ルールがまだ設定されていません。",
	"settings.title": "ファイルナビゲーターの設定",
	"settings.description": "ノート移動用のグループとルールをここで管理します。",
	"settings.tabName": "ファイルナビゲーター",
	"settings.groups.empty": "まだグループがありません。",
	"settings.groups.add": "グループを追加",
	"settings.groups.addDesc": "複数のルールをまとめるナビゲーショングループを作成します。",
	"settings.groups.addButton": "グループを追加",
	"settings.group.titleFallback": "名称未設定のグループ",
	"settings.group.name": "グループ名",
	"settings.group.nameDesc": "設定画面で判別しやすい名称を入力してください。",
	"settings.group.namePlaceholder": "デイリーノート",
	"settings.group.priority": "優先度",
	"settings.group.priorityDesc": "数値が小さいグループほど先に適用されます。",
	"settings.group.remove": "グループを削除",
	"settings.rules.empty": "このグループにはまだルールがありません。",
	"settings.rules.add": "ルールを追加",
	"settings.rules.addDesc": "グループ内で候補ファイルを絞り込み、並び替えるルールです。",
	"settings.rules.addButton": "ルールを追加",
	"settings.rule.titleFallback": "名称未設定のルール",
	"settings.rule.name": "ルール名",
	"settings.rule.nameDesc": "分かりやすい名前を付けてください。",
	"settings.rule.namePlaceholder": "タグ: journal",
	"settings.rule.filterType": "フィルター種別",
	"settings.rule.filterDesc": "タグかフォルダのどちらで絞り込むかを選択します。",
	"settings.rule.filter.tag": "タグ",
	"settings.rule.filter.folder": "フォルダ",
	"settings.rule.filterValue": "フィルター値",
	"settings.rule.filterValueTagDesc": "対象とするタグ（#なし）を入力してください。",
	"settings.rule.filterValueFolderDesc": "ボルトルートからのフォルダパスを入力してください。",
	"settings.rule.filterValueTagPlaceholder": "journal",
	"settings.rule.filterValueFolderPlaceholder": "Projects/Notes",
	"settings.rule.sortType": "ソート基準",
	"settings.rule.sortDesc": "一致したファイルを並び替える基準を選択します。",
	"settings.rule.sort.created": "作成日時",
	"settings.rule.sort.modified": "更新日時",
	"settings.rule.sort.filename": "ファイル名",
	"settings.rule.sort.frontmatter": "Frontmatter キー",
	"settings.rule.sortDirection": "並び順",
	"settings.rule.sortDirectionDesc": "昇順か降順かを選びます。",
	"settings.rule.sortDirection.asc": "昇順",
	"settings.rule.sortDirection.desc": "降順",
	"settings.rule.sortKey": "Frontmatter キー",
	"settings.rule.sortKeyDesc": "並び替えに使用する frontmatter のキー名を入力します。",
	"settings.rule.sortKeyPlaceholder": "priority",
	"settings.rule.sortValueType": "Frontmatter の値の型",
	"settings.rule.sortValueTypeDesc": "比較に利用する値の型を指定します。",
	"settings.rule.sortValueType.string": "文字列",
	"settings.rule.sortValueType.number": "数値",
	"settings.rule.sortValueType.date": "日付",
	"settings.rule.remove": "ルールを削除",
	"settings.rule.removeDesc": "このグループからルールを削除します。",
	"settings.rule.removeButton": "ルールを削除",
	"notices.groupHasNoRules": "このグループにはまだルールがありません。",
	"settings.group.hotkeysTitle": "ショートカット",
	"settings.group.hotkeysButton": "ホットキー設定を開く",
	"settings.rule.filter.property": "Frontmatter プロパティ",
	"settings.rule.propertyKey": "プロパティキー",
	"settings.rule.propertyKeyDesc": "必須となる frontmatter のキー名を入力してください。",
	"settings.rule.propertyKeyPlaceholder": "status",
	"settings.rule.propertyValue": "プロパティ値",
	"settings.rule.propertyValueDesc": "任意：この値と一致するノートのみ対象にします。",
	"settings.rule.propertyValuePlaceholder": "done",
	"settings.rule.summary.tag": "タグ: #{value}",
	"settings.rule.summary.folder": "フォルダ: {value}",
	"settings.rule.summary.propertyWithValue": "プロパティ: {key} = {value}",
	"settings.rule.summary.propertyWithoutValue": "プロパティ: {key}",
	"settings.rule.summary.missing": "(未設定)",
	"settings.rule.orderControlsTitle": "ルールの並び順",
	"settings.rule.moveUp": "ルールを上へ移動",
	"settings.rule.moveDown": "ルールを下へ移動",
	"settings.rule.removeButtonTooltip": "このルールを削除",
	"settings.group.removeDesc": "グループおよび関連ショートカットを削除します。",
	"settings.group.removeTooltip": "グループを削除",
	"notices.noCandidateFound": "該当するファイルが見つかりませんでした。",
	"commands.navigateOldest": "最古へ移動"
};

const dictionaries = {
    en,
    ja
};
const fallbackLocale = 'en';
const normalize = (value) => {
    if (!value) {
        return '';
    }
    return String(value).toLowerCase();
};
const resolveLocale = (value) => {
    const normalized = normalize(value);
    if (normalized.startsWith('ja')) {
        return 'ja';
    }
    return 'en';
};
const readAppLocale = (app) => {
    const vault = app.vault;
    if (vault?.getConfig) {
        const directLocale = vault.getConfig('locale');
        if (typeof directLocale === 'string') {
            return directLocale;
        }
        const language = vault.getConfig('language');
        if (typeof language === 'string') {
            return language;
        }
    }
    const maybeMoment = window.moment;
    if (typeof maybeMoment?.locale === 'function') {
        return maybeMoment.locale();
    }
    return undefined;
};
class Translator {
    constructor(initialLocale = fallbackLocale) {
        this.locale = initialLocale;
    }
    getLocale() {
        return this.locale;
    }
    setLocale(locale) {
        this.locale = resolveLocale(locale ?? this.locale);
    }
    t(key) {
        const current = dictionaries[this.locale] ?? dictionaries[fallbackLocale];
        return current[key] ?? dictionaries[fallbackLocale][key] ?? key;
    }
}
const createTranslator = (app) => {
    const initial = resolveLocale(readAppLocale(app));
    return new Translator(initial);
};

const createId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return 'fn_' + Math.random().toString(36).slice(2, 12);
};

class FileNavigatorPlugin extends obsidian.Plugin {
    constructor() {
        super(...arguments);
        this.translator = null;
        this.settings = { groups: [] };
        this.registeredCommandIds = [];
    }
    async onload() {
        await this.loadSettings();
        this.translator = createTranslator(this.app);
        this.refreshCommands();
        this.addSettingTab(new FileNavigatorSettingTab(this));
    }
    onunload() {
        this.unregisterGroupCommands();
        this.translator = null;
    }
    async loadSettings() {
        const data = await this.loadData();
        const rawGroups = Array.isArray(data?.groups) ? data.groups : [];
        const groups = rawGroups.map((group) => {
            const rules = Array.isArray(group.rules) ? group.rules : [];
            return {
                id: typeof group.id === 'string' ? group.id : createId(),
                name: typeof group.name === 'string' ? group.name : '',
                rules: rules.map((rule) => {
                    const sortType = rule.sortType === 'modified' || rule.sortType === 'filename' || rule.sortType === 'frontmatter' ? rule.sortType : 'created';
                    const filterType = rule.filterType === 'folder' || rule.filterType === 'property' ? rule.filterType : 'tag';
                    const sortDirection = rule.sortDirection === 'desc' ? 'desc' : 'asc';
                    const baseRule = {
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
                    }
                    else {
                        baseRule.sortKey = typeof rule.sortKey === 'string' ? rule.sortKey : '';
                        baseRule.sortValueType = rule.sortValueType === 'number' || rule.sortValueType === 'date' ? rule.sortValueType : 'string';
                    }
                    if (baseRule.filterType === 'property') {
                        baseRule.propertyKey = typeof rule.propertyKey === 'string' ? rule.propertyKey : '';
                        baseRule.propertyValue = typeof rule.propertyValue === 'string' ? rule.propertyValue : '';
                        baseRule.filterValue = '';
                    }
                    else {
                        delete baseRule.propertyKey;
                        delete baseRule.propertyValue;
                    }
                    return baseRule;
                })
            };
        });
        this.settings = { groups };
    }
    async saveSettings() {
        await this.saveData(this.settings);
        this.refreshCommands();
    }
    refreshCommands() {
        this.unregisterGroupCommands();
        this.registerGroupCommands();
    }
    registerGroupCommands() {
        for (const group of this.settings.groups) {
            const label = this.getGroupLabel(group);
            const directions = ['previous', 'next', 'latest', 'oldest'];
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
    unregisterGroupCommands() {
        const commandsApi = this.app.commands;
        if (!commandsApi) {
            this.registeredCommandIds = [];
            return;
        }
        for (const commandId of this.registeredCommandIds) {
            commandsApi.removeCommand(commandId);
        }
        this.registeredCommandIds = [];
    }
    formatGroupCommandLabel(groupLabel, direction) {
        const directionLabel = this.translate(direction === 'previous'
            ? 'commands.navigatePrevious'
            : direction === 'next'
                ? 'commands.navigateNext'
                : direction === 'latest'
                    ? 'commands.navigateLatest'
                    : 'commands.navigateOldest');
        return `${groupLabel} • ${directionLabel}`;
    }
    getGroupCommandBaseId(group, direction) {
        return `group-${group.id}-${direction}`;
    }
    getGroupCommandFullId(group, direction) {
        return `${this.manifest.id}:${this.getGroupCommandBaseId(group, direction)}`;
    }
    getTranslator() {
        if (!this.translator) {
            this.translator = createTranslator(this.app);
        }
        this.translator.setLocale(readAppLocale(this.app));
        return this.translator;
    }
    translate(key) {
        return this.getTranslator().t(key);
    }
    async navigate(group, direction) {
        if (group.rules.length === 0) {
            new obsidian.Notice(this.translate('notices.groupHasNoRules'));
            return;
        }
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) {
            new obsidian.Notice(this.translate('notices.noActiveFile'));
            return;
        }
        await this.handleNavigation(group, activeFile, direction);
    }
    async handleNavigation(group, file, direction) {
        console.debug('FileNavigatorPlugin', 'navigate', { group: group.id, direction, file: file.path });
        const target = this.resolveNavigationTarget(group, file, direction);
        if (!target) {
            new obsidian.Notice(this.translate('notices.noCandidateFound'));
            return;
        }
        if (target.path === file.path) {
            return;
        }
        await this.openFile(target);
    }
    resolveNavigationTarget(group, activeFile, direction) {
        // latest: アクティブファイルを含む最初のルールで最新を選択
        if (direction === 'latest') {
            for (const rule of group.rules) {
                const candidates = this.sortRuleCandidates(this.collectRuleCandidates(rule), rule);
                if (candidates.length === 0)
                    continue;
                const currentIndex = candidates.findIndex((item) => item.path === activeFile.path);
                if (currentIndex === -1)
                    continue;
                const targetIndex = rule.sortDirection === 'asc' ? candidates.length - 1 : 0;
                return candidates[targetIndex] ?? null;
            }
            return null;
        }
        // oldest: アクティブファイルを含む最初のルールで最古を選択
        if (direction === 'oldest') {
            for (const rule of group.rules) {
                const candidates = this.sortRuleCandidates(this.collectRuleCandidates(rule), rule);
                if (candidates.length === 0)
                    continue;
                const currentIndex = candidates.findIndex((item) => item.path === activeFile.path);
                if (currentIndex === -1)
                    continue;
                const targetIndex = rule.sortDirection === 'asc' ? 0 : candidates.length - 1;
                return candidates[targetIndex] ?? null;
            }
            return null;
        }
        // previous/next: アクティブファイルを含む最初のルールでのみ前後移動（ループしない）
        for (const rule of group.rules) {
            const candidates = this.sortRuleCandidates(this.collectRuleCandidates(rule), rule);
            if (candidates.length === 0)
                continue;
            const currentIndex = candidates.findIndex((item) => item.path === activeFile.path);
            if (currentIndex === -1)
                continue;
            if (direction === 'next') {
                if (currentIndex >= candidates.length - 1)
                    return null;
                return candidates[currentIndex + 1];
            }
            // previous
            if (currentIndex <= 0)
                return null;
            return candidates[currentIndex - 1];
        }
        return null;
    }
    collectRuleCandidates(rule) {
        const files = this.app.vault.getMarkdownFiles();
        return files.filter((file) => this.matchesRule(rule, file));
    }
    matchesRule(rule, file) {
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
    matchesTag(tagValue, file) {
        const normalized = this.normalizeTag(tagValue);
        if (!normalized) {
            return true;
        }
        const tags = this.getFileTags(file);
        return tags.includes(normalized);
    }
    matchesFolder(folderValue, file) {
        const normalized = folderValue?.trim() ?? '';
        if (!normalized) {
            return true;
        }
        const withoutSlashes = normalized.replace(/^[/\\\\]+|[/\\\\]+$/g, '').toLowerCase();
        const fileFolder = (file.parent?.path ?? '').toLowerCase();
        return fileFolder === withoutSlashes || fileFolder.startsWith(`${withoutSlashes}/`);
    }
    matchesProperty(rule, file) {
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
    getFileTags(file) {
        const cache = this.app.metadataCache.getFileCache(file);
        const tags = new Set();
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
        }
        else if (typeof frontmatterTags === 'string') {
            frontmatterTags
                .split(/[,\s]+/)
                .map((value) => this.normalizeTag(value))
                .filter((value) => Boolean(value))
                .forEach((value) => tags.add(value));
        }
        return Array.from(tags);
    }
    normalizeTag(value) {
        if (!value) {
            return null;
        }
        return value.replace(/^#+/, '').trim().toLowerCase();
    }
    sortRuleCandidates(candidates, rule) {
        const sorted = [...candidates];
        sorted.sort((a, b) => this.compareFiles(a, b, rule));
        if (rule.sortDirection === 'desc') {
            sorted.reverse();
        }
        return sorted;
    }
    compareFiles(a, b, rule) {
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
    getFrontmatterSortValue(file, rule) {
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
    async openFile(file) {
        const leaf = this.app.workspace.getLeaf(false);
        await leaf.openFile(file);
    }
    getGroupLabel(group) {
        const name = group.name?.trim();
        return name && name.length > 0 ? name : this.translate('settings.group.titleFallback');
    }
    getRuleSummary(rule) {
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
    getGroupCommandDescriptors(group) {
        const label = this.getGroupLabel(group);
        const directions = ['previous', 'next', 'latest', 'oldest'];
        return directions.map((direction) => ({
            direction,
            id: this.getGroupCommandFullId(group, direction),
            label: this.formatGroupCommandLabel(label, direction)
        }));
    }
    // 入力補助: テキストボックスにサジェストを付与
    attachTextSuggest(text, getItems) {
        const anyText = text;
        const input = anyText.inputEl;
        if (!input)
            return;
        const container = document.createElement('div');
        container.className = 'file-nav-suggest';
        container.style.position = 'absolute';
        container.style.display = 'none';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
        const updatePosition = () => {
            const rect = input.getBoundingClientRect();
            container.style.left = `${rect.left + window.scrollX}px`;
            container.style.top = `${rect.bottom + window.scrollY}px`;
            container.style.minWidth = `${rect.width}px`;
        };
        const hide = () => {
            container.style.display = 'none';
        };
        const show = () => {
            updatePosition();
            container.style.display = 'block';
        };
        const render = (items) => {
            container.innerHTML = '';
            const ul = document.createElement('ul');
            ul.className = 'file-nav-suggest__list';
            const MAX = 10000; // 実質上限なし（安全のため上限は高めに）
            for (const item of items.slice(0, MAX)) {
                const li = document.createElement('li');
                li.className = 'file-nav-suggest__item';
                li.textContent = item;
                li.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    input.value = item;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    hide();
                });
                ul.appendChild(li);
            }
            if (ul.children.length === 0) {
                const li = document.createElement('li');
                li.className = 'file-nav-suggest__empty';
                li.textContent = 'No suggestions';
                ul.appendChild(li);
            }
            container.appendChild(ul);
        };
        const onInput = () => {
            const q = input.value.trim().toLowerCase();
            const items = getItems();
            const filtered = q ? items.filter((x) => x.toLowerCase().includes(q)) : items;
            if (filtered.length === 0) {
                hide();
                return;
            }
            render(filtered);
            show();
        };
        const onFocus = () => onInput();
        const onBlur = () => setTimeout(hide, 100);
        input.addEventListener('input', onInput);
        input.addEventListener('focus', onFocus);
        input.addEventListener('blur', onBlur);
    }
    collectAllTags() {
        const set = new Set();
        for (const file of this.app.vault.getMarkdownFiles()) {
            const tags = this.app.metadataCache.getFileCache(file)?.tags;
            if (!tags)
                continue;
            for (const t of tags) {
                const name = (t.tag || '').replace(/^#/, '').trim();
                if (name)
                    set.add(name);
            }
        }
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }
    collectAllFolders() {
        const set = new Set();
        for (const file of this.app.vault.getMarkdownFiles()) {
            const folder = file.parent?.path?.trim();
            if (folder)
                set.add(folder);
        }
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }
    collectAllFrontmatterKeys() {
        const set = new Set();
        for (const file of this.app.vault.getMarkdownFiles()) {
            const fm = this.app.metadataCache.getFileCache(file)?.frontmatter;
            if (!fm)
                continue;
            for (const key of Object.keys(fm)) {
                if (key)
                    set.add(key);
            }
        }
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }
    openHotkeySettings(searchTerm) {
        // Obsidian標準コマンドでホットキー設定を開く（最も互換性が高い）
        const commandsApi = this.app.commands;
        commandsApi?.executeCommandById?.('app:open-hotkeys');
        // Templater と同様の方法で、ホットキータブの検索欄へ直接入力する
        const settingManager = this.app.setting;
        if (settingManager) {
            settingManager.open?.();
            settingManager.openTabById?.('hotkeys');
            const applySearchTerm = (attempts) => {
                const activeTab = settingManager.activeTab;
                const inputEl = activeTab?.searchComponent?.inputEl;
                if (inputEl) {
                    inputEl.focus();
                    inputEl.value = searchTerm;
                    activeTab?.updateHotkeyVisibility?.();
                    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
                    inputEl.dispatchEvent(new Event('change', { bubbles: true }));
                    return;
                }
                if (attempts > 0) {
                    window.setTimeout(() => applySearchTerm(attempts - 1), 100);
                }
            };
            window.setTimeout(() => applySearchTerm(20), 100);
        }
    }
}
class FileNavigatorSettingTab extends obsidian.PluginSettingTab {
    constructor(plugin) {
        super(plugin.app, plugin);
        this.plugin = plugin;
    }
    display() {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: this.plugin.translate('settings.title') });
        containerEl.createEl('p', { text: this.plugin.translate('settings.description') });
        const groupsContainer = containerEl.createDiv({ cls: 'file-navigator-settings__groups' });
        this.renderGroups(groupsContainer);
    }
    renderGroups(container) {
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
        const addGroupSetting = new obsidian.Setting(container);
        addGroupSetting.settingEl.addClass('file-navigator-settings__add-group');
        addGroupSetting
            .setName(this.plugin.translate('settings.groups.add'))
            .setDesc(this.plugin.translate('settings.groups.addDesc'));
        addGroupSetting.addButton((button) => {
            button
                .setButtonText(this.plugin.translate('settings.groups.addButton'))
                .setCta()
                .onClick(async () => {
                const newGroup = {
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
    renderGroup(parent, group) {
        const groupWrapper = parent.createDiv({ cls: 'file-navigator-group' });
        const headerEl = groupWrapper.createDiv({ cls: 'file-navigator-group__header' });
        const titleEl = headerEl.createEl('h3', {
            text: this.plugin.getGroupLabel(group),
            cls: 'file-navigator-group__title'
        });
        // インライン編集用の入力（タイトルの位置に出すため、アクションより先に配置）
        const nameInput = headerEl.createEl('input', { type: 'text', cls: 'file-navigator-group__name-input' });
        nameInput.placeholder = this.plugin.translate('settings.group.namePlaceholder');
        nameInput.value = group.name ?? '';
        nameInput.style.display = 'none';
        const headerActions = headerEl.createDiv({ cls: 'file-navigator-group__header-actions' });
        // 編集トグルボタン
        const editBtn = headerActions.createEl('button', { text: '✎', cls: 'clickable-icon' });
        editBtn.setAttr('aria-label', 'Edit');
        // 削除ボタン（右上）
        const removeBtn = headerActions.createEl('button', { text: '🗑', cls: 'clickable-icon' });
        removeBtn.setAttr('aria-label', this.plugin.translate('settings.group.removeTooltip'));
        const enterEdit = () => {
            titleEl.style.display = 'none';
            nameInput.style.display = '';
            nameInput.focus();
            nameInput.select();
        };
        const exitEdit = async (commit) => {
            if (commit) {
                group.name = nameInput.value;
                titleEl.setText(this.plugin.getGroupLabel(group));
                updateHotkeyDescription();
                await this.plugin.saveSettings();
            }
            nameInput.style.display = 'none';
            titleEl.style.display = '';
        };
        editBtn.addEventListener('click', () => enterEdit());
        titleEl.addEventListener('dblclick', () => enterEdit());
        nameInput.addEventListener('blur', () => void exitEdit(true));
        nameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter')
                void exitEdit(true);
            if (e.key === 'Escape')
                void exitEdit(false);
        });
        const hotkeysSetting = new obsidian.Setting(groupWrapper)
            .setName(this.plugin.translate('settings.group.hotkeysTitle'));
        let commandDescriptors = [];
        const updateHotkeyDescription = () => {
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
        hotkeysSetting.addButton((button) => {
            button
                .setButtonText(this.plugin.translate('settings.group.hotkeysButton'))
                .onClick(() => {
                const groupLabel = this.plugin.getGroupLabel(group);
                this.plugin.openHotkeySettings(`${this.plugin.manifest.name}: ${groupLabel}`);
            });
        });
        removeBtn.addEventListener('click', async () => {
            this.plugin.settings.groups = this.plugin.settings.groups.filter((item) => item.id !== group.id);
            await this.plugin.saveSettings();
            this.display();
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
        const addRuleSetting = new obsidian.Setting(groupWrapper);
        addRuleSetting.settingEl.addClass('file-navigator-rules__add');
        addRuleSetting
            .setName(this.plugin.translate('settings.rules.add'))
            .setDesc(this.plugin.translate('settings.rules.addDesc'));
        addRuleSetting.addButton((button) => {
            button
                .setButtonText(this.plugin.translate('settings.rules.addButton'))
                .setCta()
                .onClick(async () => {
                const newRule = {
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
    renderRule(container, group, rule) {
        const ruleWrapper = container.createDiv({ cls: 'file-navigator-rule' });
        const header = ruleWrapper.createDiv({ cls: 'file-navigator-rule__header' });
        const titleEl = header.createEl('div', {
            text: this.plugin.getRuleSummary(rule),
            cls: 'file-navigator-rule__title sr-only'
        });
        const headerActions = header.createDiv({ cls: 'file-navigator-rule__header-actions' });
        const index = group.rules.findIndex((item) => item.id === rule.id);
        const isFirst = index <= 0;
        const isLast = index >= group.rules.length - 1;
        const moveUpBtn = headerActions.createEl('button', { text: '↑', cls: 'clickable-icon' });
        moveUpBtn.setAttr('aria-label', this.plugin.translate('settings.rule.moveUp'));
        moveUpBtn.disabled = isFirst;
        moveUpBtn.addEventListener('click', async () => {
            await this.moveRule(group, rule, -1);
        });
        const moveDownBtn = headerActions.createEl('button', { text: '↓', cls: 'clickable-icon' });
        moveDownBtn.setAttr('aria-label', this.plugin.translate('settings.rule.moveDown'));
        moveDownBtn.disabled = isLast;
        moveDownBtn.addEventListener('click', async () => {
            await this.moveRule(group, rule, 1);
        });
        const removeIconBtn = headerActions.createEl('button', { text: '🗑', cls: 'clickable-icon' });
        removeIconBtn.setAttr('aria-label', this.plugin.translate('settings.rule.removeButtonTooltip'));
        removeIconBtn.addEventListener('click', async () => {
            group.rules = group.rules.filter((item) => item.id !== rule.id);
            await this.plugin.saveSettings();
            this.display();
        });
        const filterSetting = new obsidian.Setting(ruleWrapper)
            .setName(this.plugin.translate('settings.rule.filterType'))
            .setDesc(this.plugin.translate('settings.rule.filterDesc'));
        filterSetting.addDropdown((dropdown) => {
            dropdown.addOption('tag', this.plugin.translate('settings.rule.filter.tag'));
            dropdown.addOption('folder', this.plugin.translate('settings.rule.filter.folder'));
            dropdown.addOption('property', this.plugin.translate('settings.rule.filter.property'));
            dropdown.setValue(rule.filterType);
            dropdown.onChange(async (value) => {
                const nextType = value;
                rule.filterType = nextType;
                if (nextType === 'property') {
                    rule.propertyKey = rule.propertyKey ?? '';
                    rule.propertyValue = rule.propertyValue ?? '';
                    rule.filterValue = '';
                }
                else {
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
            const filterValueSetting = new obsidian.Setting(ruleWrapper)
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
                // タグ候補のサジェスト
                this.plugin.attachTextSuggest(text, () => this.plugin.collectAllTags());
            });
        }
        else if (rule.filterType === 'folder') {
            const filterValueSetting = new obsidian.Setting(ruleWrapper)
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
                // フォルダ候補のサジェスト
                this.plugin.attachTextSuggest(text, () => this.plugin.collectAllFolders());
            });
        }
        else {
            const propertyKeySetting = new obsidian.Setting(ruleWrapper)
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
                // フロントマターキーのサジェスト
                this.plugin.attachTextSuggest(text, () => this.plugin.collectAllFrontmatterKeys());
            });
            const propertyValueSetting = new obsidian.Setting(ruleWrapper)
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
        const sortSetting = new obsidian.Setting(ruleWrapper)
            .setName(this.plugin.translate('settings.rule.sortType'))
            .setDesc(this.plugin.translate('settings.rule.sortDesc'));
        sortSetting.addDropdown((dropdown) => {
            dropdown.addOption('created', this.plugin.translate('settings.rule.sort.created'));
            dropdown.addOption('modified', this.plugin.translate('settings.rule.sort.modified'));
            dropdown.addOption('filename', this.plugin.translate('settings.rule.sort.filename'));
            dropdown.addOption('frontmatter', this.plugin.translate('settings.rule.sort.frontmatter'));
            dropdown.setValue(rule.sortType);
            dropdown.onChange(async (value) => {
                const nextSort = value;
                rule.sortType = nextSort;
                if (nextSort !== 'frontmatter') {
                    delete rule.sortKey;
                    delete rule.sortValueType;
                }
                else {
                    rule.sortKey = rule.sortKey ?? '';
                    rule.sortValueType = rule.sortValueType ?? 'string';
                }
                await this.plugin.saveSettings();
                this.display();
            });
        });
        const directionSetting = new obsidian.Setting(ruleWrapper)
            .setName(this.plugin.translate('settings.rule.sortDirection'))
            .setDesc(this.plugin.translate('settings.rule.sortDirectionDesc'));
        directionSetting.addDropdown((dropdown) => {
            dropdown.addOption('asc', this.plugin.translate('settings.rule.sortDirection.asc'));
            dropdown.addOption('desc', this.plugin.translate('settings.rule.sortDirection.desc'));
            dropdown.setValue(rule.sortDirection);
            dropdown.onChange(async (value) => {
                rule.sortDirection = value;
                await this.plugin.saveSettings();
            });
        });
        if (rule.sortType === 'frontmatter') {
            const keySetting = new obsidian.Setting(ruleWrapper)
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
                // 並び替えキーにも同様のサジェスト
                this.plugin.attachTextSuggest(text, () => this.plugin.collectAllFrontmatterKeys());
            });
            const valueTypeSetting = new obsidian.Setting(ruleWrapper)
                .setName(this.plugin.translate('settings.rule.sortValueType'))
                .setDesc(this.plugin.translate('settings.rule.sortValueTypeDesc'));
            valueTypeSetting.addDropdown((dropdown) => {
                dropdown.addOption('string', this.plugin.translate('settings.rule.sortValueType.string'));
                dropdown.addOption('number', this.plugin.translate('settings.rule.sortValueType.number'));
                dropdown.addOption('date', this.plugin.translate('settings.rule.sortValueType.date'));
                dropdown.setValue(rule.sortValueType ?? 'string');
                dropdown.onChange(async (value) => {
                    rule.sortValueType = value;
                    await this.plugin.saveSettings();
                });
            });
        }
    }
    async moveRule(group, rule, delta) {
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

module.exports = FileNavigatorPlugin;
//# sourceMappingURL=main.js.map
