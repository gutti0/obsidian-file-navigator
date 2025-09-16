export class TAbstractFile {
  constructor(public path: string) {}
}

export class TFile extends TAbstractFile {}

export class Workspace {
  private activeFile: TFile | null = null;

  getActiveFile(): TFile | null {
    return this.activeFile;
  }

  setActiveFile(file: TFile | null): void {
    this.activeFile = file;
  }
}

export class Vault {
  constructor(private readonly config: Record<string, unknown> = {}) {}

  getConfig(key: string): unknown {
    return this.config[key];
  }
}

export class App {
  vault: Vault;
  workspace: Workspace;

  constructor(config: Record<string, unknown> = {}) {
    this.vault = new Vault(config);
    this.workspace = new Workspace();
  }
}

export interface Command {
  id: string;
  name: string;
  callback: () => void;
}

export class Notice {
  constructor(public message: string) {}
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

type EventRef = symbol;
export type TEventRef = EventRef;
