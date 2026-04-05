# obsidian-file-navigator

[日本語](./README.md) | English

## Overview

- An Obsidian plugin that navigates between files relative to the active note by filtering with tags or folders and sorting with metadata such as frontmatter.

## Installation

### For Users (via BRAT)

1. Install and enable the community plugin "BRAT" in Obsidian.
2. In BRAT settings, choose "Add Beta Plugin" and add this repository URL.
3. Enable File Navigator from the plugin list.

### BRAT Release Flow for Maintainers

1. Sync the files required for BRAT distribution to the repository root.

        npm run build:brat

2. Commit the generated `main.js`, `manifest.json`, and `styles.css`, then create a tag or release.

### Automated GitHub Releases

- `.github/workflows/release.yml` is included. When you push a tag in the form `v0.1.1` or `0.1.1`, GitHub Actions creates a Release and attaches `main.js`, `manifest.json`, and `styles.css` as assets.
- The tag version must match the `version` value in `manifest.json`. The workflow fails if they do not match.

### Development Environment

1. Clone the repository and install dependencies.

        npm install

2. Start the development build watcher.

        npm run dev

3. Symlink or copy the `build/` folder into your Obsidian plugins directory to test changes.
4. Create a production build with:

        npm run build

## Commands and Shortcuts

- Go to newer file
- Go to older file
- Go to latest file
- Go to oldest file

Assign shortcuts from Obsidian Hotkeys settings as needed.

## Settings

- From `Settings > File Navigator`, you can add groups, choose tag or folder filters, and configure sorting options through the GUI.
- When sorting by frontmatter, provide the key name and its value type (`string`, `number`, or `date`).
- Each group registers its own Older/Newer/Latest/Oldest commands, so you can assign hotkeys per group.

## Testing

- Vitest is used for unit tests and coverage.

        npm run test

## Formatting

- Biome is used as the formatter and linter.

        npm run format

## i18n

- Translation strings live in JSON files under `src/i18n/locales`.
- `Translator` in `src/i18n/index.ts` resolves the active locale and returns translated strings.
- To add a new language, add a JSON file and register it in the `dictionaries` map.
