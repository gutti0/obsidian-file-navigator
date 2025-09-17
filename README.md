# obsidian-file-navigator

## 概要 / Overview

- アクティブなノートを基準に、タグやフォルダ、frontmatter などの条件でファイルを絞り込んで移動する Obsidian プラグインです。
- Obsidian plugin that navigates between files filtered and sorted relative to the current note.

## インストール / Installation

### ユーザー向け (BRAT 経由) / For Users (via BRAT)

1. Obsidian のコミュニティプラグイン「BRAT」を導入し、有効化します。 / Install and enable the community plugin "BRAT" in Obsidian.
2. BRAT の設定画面で「Add Beta Plugin」を選び、このリポジトリの URL を追加します。 / In BRAT settings choose "Add Beta Plugin" and add this repository URL.
3. プラグイン一覧から File Navigator を有効化します。 / Enable File Navigator from the plugin list.

### 開発環境 / Development Environment

1. リポジトリをクローンし、依存関係をインストールします。 / Clone the repository and install dependencies.

        npm install

2. 開発モードでビルドウォッチを開始します。 / Start the development build watcher.

        npm run dev

3. `build/` フォルダを Obsidian のプラグインディレクトリにリンクするかコピーすると、変更が反映されます。 / Symlink or copy the `build/` folder into your Obsidian plugins directory to test changes.
4. 本番ビルドは次のコマンドで作成できます。 / Create a production build with:

        npm run build

## コマンドとショートカット / Commands and Shortcuts

- 次のファイルへ移動 / Go to next file
- 前のファイルへ移動 / Go to previous file
- 最新のファイルへ移動 / Go to latest file

ショートカットは Obsidian のホットキー設定から任意に割り当てます。 / Assign shortcuts from Obsidian Hotkeys settings as needed.

## 設定 / Settings

- 設定画面（`設定 > ファイルナビゲーター`）からグループを追加し、タグまたはフォルダフィルターと各種ソート条件を GUI で編集できます。 / From `Settings > File Navigator` you can add groups, choose tag or folder filters, and configure sorting options via the GUI.
- frontmatter で並び替える場合は、キー名と値の型（文字列／数値／日付）を指定します。 / When sorting by frontmatter, provide the key name and its value type (string/number/date).
- 各グループごとに「前へ／次へ／最新」コマンドが自動登録され、ホットキー設定から個別に割り当てできます。 / Each group registers its own Previous/Next/Latest commands so you can assign hotkeys per group.

## テスト / Testing

- 単体テストとカバレッジは Vitest を利用します。 / Vitest powers unit tests and coverage.

        npm run test

## i18n

- 翻訳文字列は `src/i18n/locales` 配下の JSON に配置されています。 / Translation strings live in the JSON files under `src/i18n/locales`.
- `src/i18n/index.ts` の `Translator` が言語の解決と文字列取得を担います。 / `Translator` in `src/i18n/index.ts` resolves locales and returns strings.
- 新しい言語を追加する場合は JSON を追加し、`dictionaries` に登録してください。 / To add a new language, add a JSON file and register it in the `dictionaries` map.
