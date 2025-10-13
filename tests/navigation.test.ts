import { describe, expect, it, beforeEach, vi } from 'vitest';
import FileNavigatorPlugin from '../src/main';
import { App, TFile, __clearNotices, __notices } from 'obsidian';

const createFile = (path: string, ctime: number, mtime: number): TFile => {
  const file = new TFile(path);
  file.stat = { ctime, mtime } as typeof file.stat;
  const folder = path.includes('/') ? path.split('/').slice(0, -1).join('/') : '';
  file.parent = { path: folder };
  return file;
};

const setupPlugin = (files: TFile[]) => {
  const app = new App();
  app.vault.setMarkdownFiles(files);

  const plugin = new FileNavigatorPlugin(app as unknown as App);
  (plugin as unknown as { refreshCommands(): void }).refreshCommands = vi.fn();
  (plugin as { settings: unknown }).settings = { groups: [] };

  const openSpy = vi.fn(async (_file: TFile) => Promise.resolve());
  (plugin as unknown as { openFile: (file: TFile) => Promise<void> }).openFile = openSpy;

  return { plugin, app, openSpy };
};

describe('navigation', () => {
  beforeEach(() => {
    __clearNotices();
  });

  it('moves to the next file within matching folder', async () => {
    const files = [
      createFile('notes/a.md', 1, 10),
      createFile('notes/b.md', 2, 20),
      createFile('notes/c.md', 3, 30)
    ];

    const { plugin, app, openSpy } = setupPlugin(files);

    const group = {
      id: 'group-1',
      name: 'Notes',
      rules: [
        {
          id: 'rule-folder',
          filterType: 'folder' as const,
          filterValue: 'notes',
          sortType: 'created' as const,
          sortDirection: 'asc' as const
        }
      ]
    };

    (plugin as unknown as { settings: { groups: typeof group[] } }).settings.groups = [group];
    app.workspace.setActiveFile(files[1]);

    await (plugin as unknown as { navigate: (g: typeof group, direction: 'previous' | 'next' | 'latest') => Promise<void> }).navigate(group, 'next');

    expect(openSpy).toHaveBeenCalledWith(files[2]);
    expect(__notices).toHaveLength(0);
  });

  it('wraps around when navigating previous', async () => {
    const files = [
      createFile('notes/a.md', 1, 10),
      createFile('notes/b.md', 2, 20),
      createFile('notes/c.md', 3, 30)
    ];

    const { plugin, app, openSpy } = setupPlugin(files);

    const group = {
      id: 'group-2',
      name: 'Notes',
      rules: [
        {
          id: 'rule-folder',
          filterType: 'folder' as const,
          filterValue: 'notes',
          sortType: 'created' as const,
          sortDirection: 'asc' as const
        }
      ]
    };

    (plugin as unknown as { settings: { groups: typeof group[] } }).settings.groups = [group];
    app.workspace.setActiveFile(files[0]);

    await (plugin as unknown as { navigate: (g: typeof group, direction: 'previous' | 'next' | 'latest') => Promise<void> }).navigate(group, 'previous');

    expect(openSpy).toHaveBeenCalledWith(files[2]);
  });

  it('opens the latest file respecting sort direction', async () => {
    const files = [
      createFile('notes/old.md', 1, 10),
      createFile('notes/new.md', 10, 20)
    ];

    const { plugin, app, openSpy } = setupPlugin(files);

    const group = {
      id: 'group-3',
      name: 'Notes',
      rules: [
        {
          id: 'rule-folder',
          filterType: 'folder' as const,
          filterValue: 'notes',
          sortType: 'created' as const,
          sortDirection: 'asc' as const
        }
      ]
    };

    (plugin as unknown as { settings: { groups: typeof group[] } }).settings.groups = [group];
    app.workspace.setActiveFile(files[0]);

    await (plugin as unknown as { navigate: (g: typeof group, direction: 'previous' | 'next' | 'latest') => Promise<void> }).navigate(group, 'latest');

    expect(openSpy).toHaveBeenCalledWith(files[1]);
  });

  it('opens the latest file within the rule that contains the active file (multiple rules)', async () => {
    const files = [
      // notes group
      createFile('notes/a.md', 1, 10),
      createFile('notes/b.md', 5, 50),
      // tasks group
      createFile('tasks/1.md', 2, 20),
      createFile('tasks/2.md', 8, 80)
    ];

    const { plugin, app, openSpy } = setupPlugin(files);

    const group = {
      id: 'group-latest-multi',
      name: 'MultiLatest',
      rules: [
        {
          id: 'rule-notes',
          filterType: 'folder' as const,
          filterValue: 'notes',
          sortType: 'created' as const,
          sortDirection: 'asc' as const
        },
        {
          id: 'rule-tasks',
          filterType: 'folder' as const,
          filterValue: 'tasks',
          sortType: 'created' as const,
          sortDirection: 'asc' as const
        }
      ]
    };

    (plugin as unknown as { settings: { groups: typeof group[] } }).settings.groups = [group];

    // アクティブは tasks/1.md（ルール2に一致）
    app.workspace.setActiveFile(files[2]);

    await (plugin as unknown as { navigate: (g: typeof group, direction: 'previous' | 'next' | 'latest') => Promise<void> }).navigate(group, 'latest');

    // ルール2(tasks)での最新（昇順なら末尾）は tasks/2.md
    expect(openSpy).toHaveBeenCalledWith(files[3]);
  });

  it('notifies when no candidates match', async () => {
    const files = [createFile('notes/a.md', 1, 1)];
    const { plugin, app, openSpy } = setupPlugin(files);

    const group = {
      id: 'group-no-candidate',
      name: 'Other',
      rules: [
        {
          id: 'rule-folder',
          filterType: 'folder' as const,
          filterValue: 'other',
          sortType: 'created' as const,
          sortDirection: 'asc' as const
        }
      ]
    };

    (plugin as unknown as { settings: { groups: typeof group[] } }).settings.groups = [group];
    app.workspace.setActiveFile(files[0]);

    await (plugin as unknown as { navigate: (g: typeof group, direction: 'previous' | 'next' | 'latest') => Promise<void> }).navigate(group, 'next');

    expect(openSpy).not.toHaveBeenCalled();
    expect(__notices).toContain('No matching file was found for this group.');
  });

  it('notifies when group has no rules', async () => {
    const files = [createFile('notes/a.md', 1, 1)];
    const { plugin, app, openSpy } = setupPlugin(files);

    const group = {
      id: 'group-empty',
      name: 'Empty',
      rules: [] as never[]
    };

    (plugin as unknown as { settings: { groups: typeof group[] } }).settings.groups = [group];
    app.workspace.setActiveFile(files[0]);

    await (plugin as unknown as { navigate: (g: typeof group, direction: 'previous' | 'next' | 'latest') => Promise<void> }).navigate(group, 'next');

    expect(openSpy).not.toHaveBeenCalled();
    expect(__notices).toContain('No rules have been configured for this group yet.');
  });

  it('uses the first rule that contains the active file when multiple rules exist', async () => {
    const files = [
      // notes group
      createFile('notes/a.md', 1, 10),
      createFile('notes/b.md', 2, 20),
      // tasks group
      createFile('tasks/1.md', 1, 5),
      createFile('tasks/2.md', 3, 30)
    ];

    const { plugin, app, openSpy } = setupPlugin(files);

    const group = {
      id: 'group-multi',
      name: 'Multi',
      rules: [
        {
          id: 'rule-notes',
          filterType: 'folder' as const,
          filterValue: 'notes',
          sortType: 'created' as const,
          sortDirection: 'asc' as const
        },
        {
          id: 'rule-tasks',
          filterType: 'folder' as const,
          filterValue: 'tasks',
          sortType: 'created' as const,
          sortDirection: 'asc' as const
        }
      ]
    };

    (plugin as unknown as { settings: { groups: typeof group[] } }).settings.groups = [group];

    // アクティブファイルは rule2(tasks) にのみ含まれる
    app.workspace.setActiveFile(files[2]); // tasks/1.md

    await (plugin as unknown as { navigate: (g: typeof group, direction: 'previous' | 'next' | 'latest') => Promise<void> }).navigate(group, 'next');

    // tasks 内で next なので tasks/2.md を開くべき（notes ではない）
    expect(openSpy).toHaveBeenCalledWith(files[3]);
    expect(__notices).toHaveLength(0);
  });

  it('does not fall back to the first rule when the active file matches none', async () => {
    const files = [
      // unrelated
      createFile('others/x.md', 1, 1),
      // notes group
      createFile('notes/a.md', 1, 10),
      createFile('notes/b.md', 2, 20),
      // tasks group
      createFile('tasks/1.md', 1, 5)
    ];

    const { plugin, app, openSpy } = setupPlugin(files);

    const group = {
      id: 'group-multi-none',
      name: 'MultiNone',
      rules: [
        {
          id: 'rule-notes',
          filterType: 'folder' as const,
          filterValue: 'notes',
          sortType: 'created' as const,
          sortDirection: 'asc' as const
        },
        {
          id: 'rule-tasks',
          filterType: 'folder' as const,
          filterValue: 'tasks',
          sortType: 'created' as const,
          sortDirection: 'asc' as const
        }
      ]
    };

    (plugin as unknown as { settings: { groups: typeof group[] } }).settings.groups = [group];

    // どのルールにも含まれないファイルをアクティブにする
    app.workspace.setActiveFile(files[0]); // others/x.md

    await (plugin as unknown as { navigate: (g: typeof group, direction: 'previous' | 'next' | 'latest') => Promise<void> }).navigate(group, 'next');

    // フォールバックで最初のルールに移動せず、通知して移動しない
    expect(openSpy).not.toHaveBeenCalled();
    expect(__notices).toContain('No matching file was found for this group.');
  });
});
