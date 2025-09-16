import { Notice, Plugin, TFile } from 'obsidian';
import { Translator, createTranslator, readAppLocale } from './i18n';

export type NavigationDirection = 'previous' | 'next' | 'latest';

export default class FileNavigatorPlugin extends Plugin {
  private translator: Translator | null = null;

  async onload(): Promise<void> {
    this.translator = createTranslator(this.app);
    this.registerCommands();
  }

  onunload(): void {
    this.translator = null;
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

  private translate(key: Parameters<Translator['t']>[0]): string {
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
