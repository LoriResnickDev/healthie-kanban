# Project Brief

## Prompt

Build a frontend-only Kanban board using React and TypeScript.

The board has three columns:

- To Do
- Doing
- Done

Fetch characters from the Rick and Morty GraphQL API:

https://rickandmortyapi.com/graphql

Users can create tasks using a form. Each task must have a Rick and Morty
character assigned to it.

Tasks must be:

- draggable between columns
- reorderable within a column

When a task moves into Done, show something delightful, such as confetti
or an animation.

The UI should be usable and thoughtfully styled, but does not need to be
highly polished.

## Current implementation status

The core application described in this brief has been implemented. The
Feature Implementation Order records the sequence used to build the app;
it should not be interpreted as a list of remaining work.

Use the current source code as the source of truth for implemented behavior.
Use this brief for requirements, constraints, and design decisions.

## Clarifications

- The Rick and Morty API provides character data only. Tasks are created
  and managed by this application.
- Fetch the first page of characters. Loading the full character catalog
  is not required.
- New tasks are added to the end of the To Do column.
- Tasks do not need to persist across page refreshes.
- Filtering, persistence, and other functionality not required by the
  prompt are out of scope for the initial implementation.

## Views

### Board

The main view displays:

- an application heading
- a board-level Add Task button
- To Do, Doing, and Done columns
- task cards within each column

Each task card displays:

- the task title
- the assigned character's image as a small round avatar
- the assigned character's name

### Add Task Dialog

Selecting Add Task opens a modal dialog containing:

- task title input
- character select
- Add Task submit button
- Cancel/close control

After successful submission, the dialog closes and the new task appears
at the end of To Do.

## Decisions

### Data model

Use separate arrays for the three board columns so array position
represents task order.

```ts
type Character = {
  id: string
  name: string
  image: string
}

type Task = {
  id: string
  title: string
  characterId: string
}

type ColumnId = 'todo' | 'doing' | 'done'

type BoardState = {
  todo: Task[]
  doing: Task[]
  done: Task[]
}
```

Store only `characterId` on a task rather than duplicating character data.
Character details can be derived from the fetched character collection.

### Character fetching

Use the browser `fetch` API rather than a server-state library.

This application has one small, read-only server request and does not
currently need caching, background refetching, mutations, or server-state
synchronization.

Fetch the character fields needed by the UI:

- id
- name
- image

Provide:

- a loading state
- an error state
- a retry action

### Task creation

Task titles:

- are required
- are trimmed before validation
- must contain between 1 and 100 characters after trimming
- may contain punctuation and other normal text characters

Character assignment is required.

Use a native select initially because the fetched character list is small
and a native control provides straightforward keyboard and accessibility
behavior.

Generate task IDs on the client.

### Drag and drop

Use dnd-kit.

Support:

- reordering within the same column
- moving tasks between columns
- moving a task into an empty column

Keep the dnd-kit implementation as simple as possible. Do not introduce
custom sensors, collision algorithms, modifiers, or abstractions unless
they are needed to satisfy the requirements.

### Drag-and-Drop Architecture Notes

- `App.tsx` owns dnd-kit event orchestration, board state updates, drag-start/
  cancel tracking, and Done celebration triggering.
- `board.ts` contains board movement semantics and should remain independent
  of React, dnd-kit events, DOM geometry, pointer/keyboard input, and collision
  rectangles.
- `dragDrop.ts` translates dnd-kit geometry into semantic placement values
  such as column `start` / `end` and task `before` / `after`.
- Cross-column movement happens live during `onDragOver` so the dragged task
  appears in the destination column while dragging.
- `onDragEnd` finalizes same-column reordering and reconciles the final drop
  target without duplicating cross-column moves already applied during
  `onDragOver`.
- `onDragCancel` restores the board snapshot captured at drag start.
- Same-column task reordering should preserve standard sortable index
  behavior. Task `before` / `after` geometry is useful for cross-column task
  insertion, but should not override same-column sortable index behavior.
- When a cross-column task has already moved during `onDragOver` and
  `onDragEnd` reports a column target with no explicit `start` / `end`
  placement, preserve the existing board order rather than defaulting to end-of-
  column.
- dnd-kit `autoScroll` is disabled because it caused distracting page/board
  scrolling while dragging near column edges in this app.

### Done celebration

Trigger the celebration only when a task moves into Done.

Briefly display a larger version of the task's assigned character with a
simple jump or bounce animation and confetti. The celebration should be
temporary and should not permanently change the Done column layout.

Respect the user's reduced-motion preference.

### Accessibility

Accessibility is part of each feature rather than a separate cleanup step.

Use semantic HTML, explicit form labels, keyboard-accessible controls,
visible focus states, and appropriate status/error announcements.

The modal dialog should:

- move initial focus to the task title field
- keep focus within the dialog while open
- close with Escape
- return focus to the Add Task button when closed
- prevent interaction with the background while open

Drag-and-drop interactions should support keyboard use as well as pointer
interaction.

### Testing

Add focused tests as meaningful behavior is introduced.

Prioritize behavior such as:

- character loading and error handling
- retrying a failed character request
- task creation
- task validation
- required character assignment
- important board movement behavior where practical

Avoid tests that merely duplicate implementation details.

Some interactive behavior, especially drag-and-drop and native dialog focus
behavior, should also be manually verified in the browser. See DEMO_NOTES.md
for manual verification procedures.

### Engineering approach

Prefer the simplest implementation that satisfies the current
requirements.

Do not implement functionality beyond this brief unless explicitly
requested.

Avoid premature abstraction.

Favor code that is easy to understand, explain, debug, and modify during
a live pairing interview.

## Feature Implementation Order

1. Define the board/task data model and render the three-column board.
2. Fetch Rick and Morty character data for later task assignment, with loading,
   error, and retry states. Do not render a character list.
3. Add task creation through the Add Task dialog. Display each created task as a card in To Do with its title and the assigned character's name and small round avatar.
4. Add drag-and-drop reordering within columns.
5. Add drag-and-drop movement between columns, including empty columns.
6. Add the Done celebration.
7. Review accessibility and important test coverage across the completed
   application.
8. Add final responsive styling and UI refinements.

## Future improvements (out of scope).

These are possible follow-up or pairing features, not incomplete initial
requirements.

Possible follow-up features include:

- task persistence
- task filtering or search
- character search or pagination
- additional UI refinements

Do not implement these unless explicitly requested.
