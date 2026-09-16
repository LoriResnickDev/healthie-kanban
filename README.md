# Healthie Kanban

A frontend-only Kanban board built with React, TypeScript, and Vite for the Healthie frontend take-home.

The app fetches Rick and Morty character data from the public GraphQL API, lets users create tasks assigned to a character, and supports pointer and keyboard drag-and-drop for reordering tasks and moving them between To Do, Doing, and Done. Moving a task into Done triggers a brief celebration.

## Getting Started

Install dependencies:

```sh
npm install
```

Run the local dev server:

```sh
npm run dev
```

This project uses Vite's default dev server configuration, so the app is normally available at:

```text
http://localhost:5173/
```

If that port is unavailable, use the local URL printed by Vite in the terminal.

Build for production:

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```

## Testing and Verification

Run the test suite:

```sh
npm test
```

Run linting:

```sh
npm run lint
```

Run TypeScript checks:

```sh
./node_modules/.bin/tsc -b
```

Check formatting:

```sh
npm run format:check
```

Format files:

```sh
npm run format
```

### Accessibility Testing

The main interactions can be tested without a mouse.

#### Keyboard drag-and-drop

1. Use `Tab` to focus a task card.
2. Press `Space` or `Enter` to pick it up.
3. Use the arrow keys to reorder it within a column or move it between columns, including empty columns.
4. Press `Space` or `Enter` to drop it.
5. Press `Escape` to cancel the drag and verify the task returns to its original position.

#### Add Task dialog

1. Use `Tab` to focus the Add Task button.
2. Press `Space` or `Enter` to open the dialog.
3. Verify that focus moves to the task title field.
4. Use `Tab` and `Shift+Tab` to move through the dialog controls.
5. Press `Escape` to close the dialog.
6. Verify that focus returns to the Add Task button.

### Additional Manual Testing

Additional browser-based manual verification and demonstration procedures are
documented in [DEMO_NOTES.md](./DEMO_NOTES.md).

## Technical Notes

- The project uses React 19, TypeScript, Vite, Vitest, React Testing Library, ESLint, and Prettier.
- `BRIEF.md` captures the implementation plan, design decisions, and scope used to guide development, including the AI-assisted workflow.
- Character data comes from the Rick and Morty GraphQL API. Tasks are client-side state only.
- Board state is modeled as explicit ordered arrays for `todo`, `doing`, and `done`; each array's order is the source of truth for rendering and reordering.
- Tasks store a `characterId` instead of duplicating character data from the API.
- Task creation uses a native `<dialog>` element for modal behavior, with explicit labels, validation errors, initial focus, Escape handling, and focus return.
- Drag-and-drop uses dnd-kit with pointer and keyboard sensors. Columns remain droppable so tasks can be moved into empty columns and column space.
- dnd-kit auto-scroll is disabled to avoid unwanted horizontal scrolling while dragging near the board edge.
- The Done celebration is a temporary, non-layout-affecting overlay and respects reduced-motion preferences.
- Tests focus on meaningful behavior: character fetching and validation, task creation, dialog behavior, board movement logic, drag placement geometry, and the Done celebration.

## Scope

Tasks are not persisted across refreshes. Filtering, search, pagination beyond the first page of characters, and backend storage are intentionally out of scope for this take-home.

## Known Limitations

Drag and drop is keyboard operable, but the current implementation does not
provide screen-reader announcements for drag-and-drop actions such as pickup,
movement, and drop.
