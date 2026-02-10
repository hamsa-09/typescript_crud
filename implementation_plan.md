# HashedIn Meme Sharing App (Angular 19) Implementation Plan

## 1. Project Initialization
- Create Angular 19 application (Standalone, No Routing, CSS).
- Install Dependencies: `@angular/material`, `@angular/cdk`.
- Configure `angular.json` and `styles.css` for custom dark theme.

## 2. Core Architecture
- **State Management**: Angular Signals in Services.
- **Persistence**: `LocalStorageService` with initial data seeding.
- **Navigation**: `ViewService` (Signal-based state for current view/modal).

## 3. Shared UI Library (Wrappers)
- `ui-card`: Wrapper for data display.
- `ui-button`: Wrapper for actions (primary, accents).
- `ui-input`: Input fields/Textareas.
- `ui-tag`: Pill for tags/categories.
- `ui-modal`: Wrapper or service around Material Dialog/Drawer.

## 4. Features
- **Feed**:
  - List of posts.
  - Search/Filter header.
  - Integration with `MemeService`.
- **Post Detail**:
  - Full view.
  - Spoiler logic.
  - Actions (Like, Bookmark, etc.).
- **Post Composer**:
  - Create/Edit logic.
  - Drafts autosave.
  - "Mood" selector.

## 5. Data Models
- `User`, `Post`, `Comment` (if needed, though spec says Posts mainly), `Like`, `Bookmark`, `Flag`.

## 6. Execution Steps
1.  Init App.
2.  Install Material.
3.  Create Types & Services.
4.  Create Shared UI.
5.  Implement Features one by one.
6.  Polish Styling.
