export class TAbstractFile {
  constructor(public path: string) {}
}

export class TFile extends TAbstractFile {
  stat: { ctime: number; mtime: number } = { ctime: 0, mtime: 0 };
  parent?: { path: string };
}

export class Workspace {
  private activeFile: TFile | null = null;
  getActiveFile(): TFile | null {
    return this.activeFile;
  }
  setActiveFile(file: TFile | null): void {
    this.activeFile = file;
  }
  getLeaf(_force: boolean): { openFile: (file: TFile) => Promise<void> } {
    return {
      async openFile(): Promise<void> {
        /* noop */
      }
    };
  }
}

export interface FileCache {
  tags?: { tag: string }[];
  frontmatter?: Record<string, unknown>;
}

export class MetadataCache {
  private caches = new Map<string, FileCache>();
  getFileCache(file: TFile): FileCache | undefined {
    return this.caches.get(file.path);
  }
  setFileCache(file: TFile, cache: FileCache): void {
    this.caches.set(file.path, cache);
  }
  clear(): void {
    this.caches.clear();
  }
}

export class Vault {
  private files: TFile[] = [];
  constructor(private readonly config: Record<string, unknown> = {}) {}
  getConfig(key: string): unknown {
    return this.config[key];
  }
  getMarkdownFiles(): TFile[] {
    return this.files;
  }
  setMarkdownFiles(files: TFile[]): void {
    this.files = files;
  }
}

export class Commands {
  removed: string[] = [];
  removeCommand(id: string): void {
    this.removed.push(id);
  }
}

export const __notices: string[] = [];
export const __clearNotices = (): void => {
  __notices.length = 0;
};

export class Notice {
  message: string;
  constructor(message: string) {
    this.message = message;
    __notices.push(message);
  }
}

export class App {
  vault: Vault;
  workspace: Workspace;
  metadataCache: MetadataCache;
  commands: Commands;
  setting?: {
    open: () => void;
    openTabById?: (id: string) => void;
  };

  constructor(config: Record<string, unknown> = {}) {
    this.vault = new Vault(config);
    this.workspace = new Workspace();
    this.metadataCache = new MetadataCache();
    this.commands = new Commands();
  }
}

export interface Command {
  id: string;
  name: string;
  callback: () => void;
}

export class Plugin {
  app: App;
  commands: Command[] = [];

  constructor(app: App) {
    this.app = app;
  }

  addCommand(command: Command): void {
    this.commands.push(command);
  }

  registerEvent(): symbol {
    return Symbol('event');
  }
}

export class PluginSettingTab {
  app: App;
  plugin: Plugin;
  containerEl: HTMLElement;

  constructor(app: App, plugin: Plugin) {
    this.app = app;
    this.plugin = plugin;
    this.containerEl = document.createElement('div');
  }

  display(): void {}
}

class AbstractComponent {
  protected onChangeCallback?: (value: string) => void;
}

export class TextComponent extends AbstractComponent {
  setPlaceholder(_value: string): TextComponent {
    return this;
  }
  setValue(_value: string): TextComponent {
    return this;
  }
  onChange(callback: (value: string) => void): TextComponent {
    this.onChangeCallback = callback;
    return this;
  }
}

export class DropdownComponent extends AbstractComponent {
  addOption(_value: string, _label: string): DropdownComponent {
    return this;
  }
  setValue(_value: string): DropdownComponent {
    return this;
  }
  onChange(callback: (value: string) => void): DropdownComponent {
    this.onChangeCallback = callback;
    return this;
  }
}

export class ButtonComponent {
  private onClickCallback?: () => void;
  setButtonText(_text: string): ButtonComponent {
    return this;
  }
  setTooltip(_text: string): ButtonComponent {
    return this;
  }
  setWarning(): ButtonComponent {
    return this;
  }
  setCta(): ButtonComponent {
    return this;
  }
  setDisabled(_disabled: boolean): ButtonComponent {
    return this;
  }
  onClick(callback: () => void): ButtonComponent {
    this.onClickCallback = callback;
    return this;
  }
  click(): void {
    this.onClickCallback?.();
  }
}

export class Setting {
  settingEl: HTMLElement;
  private controlEl: HTMLElement;

  constructor(containerEl: HTMLElement) {
    this.settingEl = document.createElement('div');
    this.settingEl.classList.add('setting-item');
    containerEl.appendChild(this.settingEl);
    this.controlEl = document.createElement('div');
    this.controlEl.classList.add('setting-item-control');
    this.settingEl.appendChild(this.controlEl);
  }

  setClass(cls: string): Setting {
    this.settingEl.classList.add(cls);
    return this;
  }

  setName(_name: string): Setting {
    return this;
  }

  setDesc(_desc: string | DocumentFragment | ((fragment: DocumentFragment) => void)): Setting {
    return this;
  }

  addText(callback: (component: TextComponent) => void): Setting {
    const component = new TextComponent();
    callback(component);
    return this;
  }

  addDropdown(callback: (component: DropdownComponent) => void): Setting {
    const component = new DropdownComponent();
    callback(component);
    return this;
  }

  addButton(callback: (component: ButtonComponent) => void): Setting {
    const component = new ButtonComponent();
    callback(component);
    return this;
  }
}

type EventRef = symbol;
export type TEventRef = EventRef;
